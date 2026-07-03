/**
 * Course enrichment script — B站视频 + Z-Library 参考教材。
 *
 * Usage:
 *   node src/utils/enrichCourses.js                        # All unenriched / no-books courses
 *   node src/utils/enrichCourses.js --limit=10             # Dry run
 *   node src/utils/enrichCourses.js --category=工学         # Single 学科门类
 *   node src/utils/enrichCourses.js --books-only           # Only fetch books (skip videos)
 *
 * Idempotent: courses with enriched=true AND books[] already populated are skipped.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const mongoose = require('mongoose');
const https = require('https');
const crypto = require('crypto');
const { signParams, getCookies } = require('./bilibiliSign');

const Course = require('../models/Course');

// ── Config ──────────────────────────────────────────────────────────────────

const DELAY_MS = 1500;
const RETRY_DELAY_MS = 30000;
const MAX_RETRIES = 3;
const PAGESIZE = 5;
const BOOK_PAGESIZE = 5;

// Z-Library config — all from env vars
const ZLIB_EMAIL = process.env.ZLIBRARY_EMAIL || '';
const ZLIB_PASSWORD = process.env.ZLIBRARY_PASSWORD || '';
const ZLIB_BASE = process.env.ZLIBRARY_BASE || 'https://z-lib.io';

// ── Parse CLI args ──────────────────────────────────────────────────────────

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith('--limit=')) {
      args.limit = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--category=')) {
      args.category = arg.split('=')[1];
    } else if (arg === '--books-only') {
      args.booksOnly = true;
    }
  });
  return args;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpsGet(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
        ...opts.headers,
      },
    };
    const req = https.request(options, (res) => {
      // Collect Set-Cookie
      const setCookie = res.headers['set-cookie'];
      if (setCookie) {
        opts._cookies = opts._cookies || [];
        opts._cookies.push(...setCookie);
      }

      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const body = JSON.parse(data);
          resolve({ body, cookies: opts._cookies || [] });
        } catch {
          resolve({ body: data, cookies: opts._cookies || [] });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

function httpsPost(url, postData, opts = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isForm = opts.form === true;
    const bodyString = isForm
      ? Object.entries(postData)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join('&')
      : JSON.stringify(postData);

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
        'Content-Type': isForm
          ? 'application/x-www-form-urlencoded'
          : 'application/json',
        'Content-Length': Buffer.byteLength(bodyString),
        ...opts.headers,
      },
    };
    const req = https.request(options, (res) => {
      const setCookie = res.headers['set-cookie'];
      if (setCookie) {
        opts._cookies = opts._cookies || [];
        opts._cookies.push(...setCookie);
      }

      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const body = JSON.parse(data);
          resolve({ body, cookies: opts._cookies || [] });
        } catch {
          resolve({ body: data, cookies: opts._cookies || [] });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.write(bodyString);
    req.end();
  });
}

// ── Z-Library auth ──────────────────────────────────────────────────────────

let zlibAuth = { userId: null, userKey: null, expiresAt: 0 };

function parseCookies(cookieList) {
  const result = {};
  for (const c of cookieList) {
    const parts = c.split(';')[0].split('=');
    if (parts.length >= 2) {
      result[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  }
  return result;
}

async function zlibLogin() {
  const now = Date.now();
  if (zlibAuth.userId && zlibAuth.userKey && now < zlibAuth.expiresAt) {
    return zlibAuth;
  }

  if (!ZLIB_EMAIL || !ZLIB_PASSWORD) {
    throw new Error('Z-Library credentials not set. Set ZLIBRARY_EMAIL and ZLIBRARY_PASSWORD in .env');
  }

  console.log('  登录 Z-Library...');

  const result = await httpsPost(
    `${ZLIB_BASE}/eapi/user/login`,
    { email: ZLIB_EMAIL, password: ZLIB_PASSWORD },
    { form: true }
  );

  const cookies = parseCookies(result.cookies);

  if (!result.body || result.body.success !== 1) {
    const msg = result.body?.error || JSON.stringify(result.body).slice(0, 200);
    throw new Error(`Z-Library login failed: ${msg}`);
  }

  zlibAuth = {
    userId: cookies['remix_userid'] || '',
    userKey: cookies['remix_userkey'] || '',
    expiresAt: now + 55 * 60 * 1000, // 55 min cache
  };

  console.log('  Z-Library 登录成功');
  return zlibAuth;
}

function getZlibCookieHeader() {
  return `remix_userid=${zlibAuth.userId}; remix_userkey=${zlibAuth.userKey}`;
}

// ── Z-Library book search ──────────────────────────────────────────────────

async function searchZLibrary(courseName) {
  if (!ZLIB_EMAIL || !ZLIB_PASSWORD) {
    console.warn('  ⚠ 未配置 Z-Library 凭据，跳过书籍搜索');
    return [];
  }

  await zlibLogin();

  const cookie = getZlibCookieHeader();

  const result = await httpsPost(
    `${ZLIB_BASE}/eapi/book/search`,
    { message: courseName, limit: BOOK_PAGESIZE, order: 'popular' },
    { form: true, headers: { Cookie: cookie } }
  );

  if (!result.body || result.body.success !== 1) {
    return [];
  }

  const books = result.body.books || [];
  return books.slice(0, BOOK_PAGESIZE).map((b) => ({
    title: b.title || '',
    author: b.author || '',
    cover: b.cover || '',
    url: b.href || `${ZLIB_BASE}/book/${b.id}/${b.hash || ''}`,
    publisher: b.publisher || '',
    year: b.year ? String(b.year) : '',
    extension: b.extension || '',
    size: b.filesizeString || '',
  }));
}

// ── B站 search ──────────────────────────────────────────────────────────────

async function searchBilibili(keyword, searchType, opts = {}) {
  const { page = 1, pagesize = 5, order = 'totalrank', duration } = opts;

  const params = { search_type: searchType, keyword, page, pagesize, order };
  if (duration !== undefined) params.duration = duration;

  const signedParams = await signParams(params);
  const queryString = Object.entries(signedParams)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

  const url = `https://api.bilibili.com/x/web-interface/wbi/search/type?${queryString}`;
  return httpsGet(url);
}

async function searchVideos(courseName) {
  let result = await searchBilibili(courseName, 'video', {
    pagesize: PAGESIZE, order: 'click', duration: 4,
  });

  if (!result?.data?.result || result.data.result.length < 3) {
    result = await searchBilibili(courseName, 'video', {
      pagesize: PAGESIZE, order: 'click', duration: 3,
    });
  }

  if (!result?.data?.result || result.data.result.length < 2) {
    result = await searchBilibili(courseName, 'video', {
      pagesize: PAGESIZE, order: 'totalrank', duration: 0,
    });
  }

  if (!result || result.body?.code !== 0) return [];

  return (result.body.data?.result || []).slice(0, PAGESIZE).map((v) => ({
    bvid: v.bvid || '',
    title: (v.title || '').replace(/<\/?[^>]+(>|$)/g, ''),
    thumbnail: v.pic || '',
    playCount: typeof v.play === 'number' ? v.play : parseInt(v.play, 10) || 0,
    duration: v.duration || '',
    author: v.author || '',
    url: v.arcurl || `https://www.bilibili.com/video/${v.bvid}`,
    pubdate: v.pubdate || 0,
  }));
}

// ── Enrich one course ───────────────────────────────────────────────────────

async function enrichOneCourse(course, index, total, opts = {}) {
  const label = `[${index + 1}/${total}]`;
  const booksOnly = opts.booksOnly;
  const hasVideos = course.videos && course.videos.length > 0;

  let videos = course.videos || [];
  let books = [];

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Parallel: videos (if needed) + books
      const tasks = [];

      if (!booksOnly && !hasVideos) {
        tasks.push(searchVideos(course.name));
      } else {
        tasks.push(Promise.resolve(videos));
      }

      tasks.push(searchZLibrary(course.name));

      const results = await Promise.all(tasks);
      videos = results[0];
      books = results[1];

      await Course.updateOne(
        { _id: course._id },
        { $set: { videos, books, enriched: true } }
      );

      console.log(
        `${label} ✓ ${course.name} — ${videos.length} 视频, ${books.length} 教材 [${course.majorCategory}]`
      );
      return { success: true, videos: videos.length, books: books.length };
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        console.warn(`${label} ⚠ ${course.name} — 重试 ${attempt}/${MAX_RETRIES}: ${err.message}`);
        await sleep(RETRY_DELAY_MS * attempt);
      } else {
        console.error(`${label} ✗ ${course.name} — 失败: ${err.message}`);
        try {
          await Course.updateOne(
            { _id: course._id },
            { $set: { videos, books, enriched: true } }
          );
        } catch {
          await Course.updateOne({ _id: course._id }, { $set: { enriched: true } });
        }
        return { success: false, videos: videos.length, books: books.length };
      }
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  const startTime = Date.now();

  console.log('╔══════════════════════════════════════════╗');
  console.log('║   课程资源爬虫 — B站 + Z-Library 教材   ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  // Connect
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/university-website';
  await mongoose.connect(MONGODB_URI);
  console.log(`MongoDB 已连接: ${mongoose.connection.host}`);

  // Build query: enriched=false OR no books
  let query = {
    $or: [
      { enriched: false },
      { books: { $exists: false } },
      { books: { $size: 0 } },
    ],
  };

  if (args.category) {
    query = {
      $and: [
        query,
        { majorCategory: args.category },
      ],
    };
    console.log(`筛选学科门类: ${args.category}`);
  }

  if (args.booksOnly) {
    // Only courses that have videos but no books
    query = {
      $and: [
        { enriched: true },
        {
          $or: [
            { books: { $exists: false } },
            { books: { $size: 0 } },
          ],
        },
      ],
    };
    console.log('模式: 仅补书籍（跳过已有视频的课程）');
  }

  const totalCount = await Course.countDocuments(query);
  console.log(`待处理课程: ${totalCount}`);
  console.log('');

  if (totalCount === 0) {
    console.log('所有课程已处理完毕。');
    await mongoose.disconnect();
    return;
  }

  // Fetch all IDs first to avoid cursor timeout on long runs
  let fetchQuery = Course.find(query).select('name majorCategory videos enriched').lean();
  if (args.limit) {
    fetchQuery = fetchQuery.limit(args.limit);
    console.log(`(限制模式: 仅处理 ${args.limit} 门)`);
    console.log('');
  }

  const courses = await fetchQuery;
  console.log(`已加载 ${courses.length} 门课程到内存`);
  console.log('');

  let processed = 0, successCount = 0, failCount = 0;
  let totalVideos = 0, totalBooks = 0;

  for (const course of courses) {
    const result = await enrichOneCourse(course, processed, args.limit || totalCount, {
      booksOnly: args.booksOnly || (course.videos && course.videos.length > 0),
    });

    if (result.success) successCount++;
    else failCount++;
    totalVideos += result.videos;
    totalBooks += result.books;
    processed++;

    await sleep(DELAY_MS);
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log('');
  console.log('══════════════════════════════════════════');
  console.log(`完成! 耗时 ${elapsed} 分钟`);
  console.log(`处理: ${processed} 门课程`);
  console.log(`成功: ${successCount} | 失败: ${failCount}`);
  console.log(`视频: ${totalVideos} | 教材: ${totalBooks}`);
  console.log('══════════════════════════════════════════');

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('爬虫异常:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
