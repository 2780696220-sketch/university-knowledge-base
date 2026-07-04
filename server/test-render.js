// 逐步诊断 MongoDB 连接问题
console.log('=== Render MongoDB 诊断 ===');
console.log('Node:', process.version);
console.log('CWD:', process.cwd());

// 步骤1: 测试能否加载 mongoose
console.log('\n1. 加载 mongoose...');
try {
  const mongoose = require('mongoose');
  console.log('   ✓ mongoose 加载成功, 版本:', mongoose.version);
} catch (e) {
  console.error('   ✗ mongoose 加载失败:', e.message);
  process.exit(1);
}

// 步骤2: 检查环境变量
const MONGODB_URI = process.env.MONGODB_URI;
console.log('\n2. MONGODB_URI:', MONGODB_URI ? '***' + MONGODB_URI.slice(-40) : '未设置!');
if (!MONGODB_URI) {
  console.error('   ✗ 缺少 MONGODB_URI');
  process.exit(1);
}

// 步骤3: 尝试连接
const mongoose = require('mongoose');

async function main() {
  console.log('\n3. 连接 MongoDB...');
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });
    console.log('   ✓ 连接成功! Host:', conn.connection.host);
    console.log('   Database:', conn.connection.name);

    // Ping
    const ping = await conn.connection.db.admin().ping();
    console.log('   Ping:', JSON.stringify(ping));

    await mongoose.disconnect();
    console.log('\n=== 测试通过 ✓ ===');
    process.exit(0);
  } catch (err) {
    console.error('   ✗ 连接失败:', err.message);
    console.error('   错误类型:', err.name);
    console.error('   错误码:', err.code);
    if (err.reason) console.error('   原因:', JSON.stringify(err.reason));
    process.exit(1);
  }
}
main();
