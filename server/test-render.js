// 极简 Render 连通性测试
console.log('Node 版本:', process.version);
console.log('CWD:', process.cwd());
console.log('ENV keys:', Object.keys(process.env).filter(k => !k.includes('npm_')).join(', '));

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'not-set';
console.log('MONGODB_URI 已设置:', MONGODB_URI !== 'not-set');

// 检查 seed 文件
const SEEDS_DIR = path.join(__dirname, 'seeds');
console.log('Seed 目录:', SEEDS_DIR);
if (fs.existsSync(SEEDS_DIR)) {
  const files = fs.readdirSync(SEEDS_DIR);
  console.log('Seed 文件:', files.join(', '));
} else {
  console.log('Seed 目录不存在!');
}

async function main() {
  try {
    console.log('正在连接 MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('MongoDB 连接成功!');
    console.log('Host:', mongoose.connection.host);

    // Ping test
    const adminDb = mongoose.connection.db.admin();
    const ping = await adminDb.ping();
    console.log('Ping:', JSON.stringify(ping));

    await mongoose.disconnect();
    console.log('测试通过 ✓');
    process.exit(0);
  } catch (err) {
    console.error('失败:', err.message);
    console.error('Stack:', err.stack?.split('\n').slice(0, 3).join('\n'));
    process.exit(1);
  }
}

main();
