// 极简 Render 连通性测试 — 无 MongoDB 依赖
const http = require('http');

console.log('Node 版本:', process.version);
console.log('CWD:', process.cwd());
console.log('PORT:', process.env.PORT || 5000);

// 检查重要环境变量
['NODE_ENV', 'MONGODB_URI', 'JWT_SECRET', 'CORS_ORIGIN'].forEach(k => {
  const v = process.env[k];
  if (!v) {
    console.log(`❌ 缺少环境变量: ${k}`);
  } else if (k === 'MONGODB_URI') {
    console.log(`✅ ${k}: ***${v.slice(-30)}`);
  } else {
    console.log(`✅ ${k}: ${v}`);
  }
});

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Render 环境正常 ✓\n');
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`服务器启动成功: 端口 ${port}`);
});
