const crypto = require('crypto');
const https = require('https');

// Fixed WBI permutation table (64 elements)
const MIXIN_KEY_ENC_TAB = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
  27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
  37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4,
  22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
];

// Cached mixin key + cookies
let cachedMixKey = null;
let cachedMixKeyExpiry = 0;
let cachedCookies = '';

const MIXIN_KEY_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Make an HTTPS GET request and return { body, headers }
 */
function httpsGet(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: options.headers || {} }, (res) => {
      // Collect Set-Cookie headers
      const setCookie = res.headers['set-cookie'];
      if (setCookie) {
        options._cookieJar = options._cookieJar || [];
        options._cookieJar.push(...setCookie);
      }

      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const body = JSON.parse(data);
          resolve({ body, cookies: options._cookieJar || [] });
        } catch {
          resolve({ body: data, cookies: options._cookieJar || [] });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Extract img_key and sub_key from nav response, compute mixin key
 */
function computeMixinKey(imgKey, subKey) {
  const raw = imgKey + subKey;
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += raw[MIXIN_KEY_ENC_TAB[i]];
  }
  return result;
}

/**
 * Fetch /nav endpoint, extract keys, compute and cache mixin key.
 * Also collects buvid3 cookie for anti-bot.
 */
async function getMixinKey() {
  const now = Date.now();
  if (cachedMixKey && now < cachedMixKeyExpiry) {
    return { mixinKey: cachedMixKey, cookies: cachedCookies };
  }

  // Fetch nav to get WBI image keys
  const navResult = await httpsGet('https://api.bilibili.com/x/web-interface/nav', {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  const { body, cookies } = navResult;

  // Extract img_url and sub_url from nav response
  const wbiImg = body?.data?.wbi_img;
  if (!wbiImg || !wbiImg.img_url || !wbiImg.sub_url) {
    throw new Error('Failed to extract WBI keys from /nav: ' + JSON.stringify(body));
  }

  const imgKey = wbiImg.img_url.split('/').pop().replace('.png', '');
  const subKey = wbiImg.sub_url.split('/').pop().replace('.png', '');

  const mixinKey = computeMixinKey(imgKey, subKey);

  // Cache
  cachedMixKey = mixinKey;
  cachedMixKeyExpiry = now + MIXIN_KEY_TTL;
  cachedCookies = cookies.map((c) => c.split(';')[0]).join('; ');

  return { mixinKey, cookies: cachedCookies };
}

/**
 * Sign query parameters with WBI v3 protocol.
 * @param {Object} params - Query parameters (without wts/w_rid)
 * @returns {Object} params with wts and w_rid added
 */
async function signParams(params) {
  const { mixinKey } = await getMixinKey();

  const wts = Math.floor(Date.now() / 1000);
  const allParams = { ...params, wts };

  // Sort keys alphabetically
  const sortedKeys = Object.keys(allParams).sort();

  // Build query string: encodeURIComponent with uppercase hex
  const queryParts = sortedKeys.map((k) => {
    const encoded = encodeURIComponent(allParams[k])
      .replace(/[!'()*]/g, (ch) => '%' + ch.charCodeAt(0).toString(16).toUpperCase());
    return `${k}=${encoded}`;
  });
  const queryString = queryParts.join('&');

  // MD5(queryString + mixinKey)
  const w_rid = crypto.createHash('md5').update(queryString + mixinKey).digest('hex');

  return { ...allParams, w_rid };
}

/**
 * Get cached cookies (buvid3 etc.) for anti-bot
 */
async function getCookies() {
  const { cookies } = await getMixinKey();
  return cookies;
}

/**
 * Clear cached keys (for testing / force refresh)
 */
function clearCache() {
  cachedMixKey = null;
  cachedMixKeyExpiry = 0;
  cachedCookies = '';
}

module.exports = { signParams, getCookies, clearCache };
