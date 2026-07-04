// HTTP 诊断 — 所有日志输出到 HTTP 响应
const http = require('http');
const fs = require('fs');
const path = require('path');
const dns = require('dns');
const net = require('net');

const logs = [];
function log(msg) { logs.push(msg); console.log(msg); }

async function runDiagnostics() {
  log('Node: ' + process.version);
  log('CWD: ' + process.cwd());
  log('PORT: ' + (process.env.PORT || 5000));

  // 检查环境变量
  ['NODE_ENV', 'MONGODB_URI', 'JWT_SECRET', 'CORS_ORIGIN'].forEach(k => {
    const v = process.env[k];
    if (!v) log(`ENV ${k}: ❌ 未设置`);
    else if (k.includes('URI')) log(`ENV ${k}: ***${v.slice(-30)}`);
    else log(`ENV ${k}: ${v}`);
  });

  // DNS 解析
  try {
    const addresses = await new Promise((resolve, reject) => {
      dns.resolve('cluster0.zz5s9za.mongodb.net', (err, addrs) => {
        if (err) reject(err); else resolve(addrs);
      });
    });
    log(`DNS cluster0.zz5s9za.mongodb.net: ${addresses.join(', ')}`);
  } catch (e) {
    log(`DNS 失败: ${e.message}`);
  }

  // 检查 seed 目录
  const seedsDir = path.join(__dirname, 'seeds');
  log(`Seed 目录: ${seedsDir}`);
  if (fs.existsSync(seedsDir)) {
    log(`Seed 文件: ${fs.readdirSync(seedsDir).join(', ')}`);
  } else {
    log('Seed 目录不存在!');
  }

  // 尝试 require mongoose
  try {
    const m = require('mongoose');
    log(`Mongoose 加载 OK, 版本: ${m.version}`);
  } catch (e) {
    log(`Mongoose 加载失败: ${e.message}`);
    return;
  }

  // mongoose.connect
  const uri = process.env.MONGODB_URI;
  if (!uri) { log('无 MONGODB_URI, 跳过连接'); return; }

  const mongoose = require('mongoose');
  try {
    log('正在连接 MongoDB (timeout 20s)...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
    });
    log(`✅ MongoDB 连接成功! Host: ${conn.connection.host}`);
    const ping = await conn.connection.db.admin().ping();
    log(`Ping: ${JSON.stringify(ping)}`);
    await mongoose.disconnect();
    log('✅ 所有测试通过');
  } catch (e) {
    log(`❌ MongoDB 连接失败: ${e.message}`);
    log(`   Code: ${e.code}, Name: ${e.name}`);
  }
}

// HTTP 服务器
const server = http.createServer(async (req, res) => {
  if (req.url === '/diag') {
    logs.length = 0;
    await runDiagnostics();
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(logs.join('\n'));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('OK - 访问 /diag 查看诊断');
  }
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  log(`HTTP 服务器启动: 端口 ${port}`);
});
