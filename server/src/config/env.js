const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];

function validateEnv() {
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`缺少环境变量: ${missing.join(', ')}。请检查 .env 文件。`);
    process.exit(1);
  }
}

module.exports = validateEnv;
