const path = require('path');

// 本地开发加载 .env，生产环境用 Render 环境变量
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
}

const app = require('./app');
const connectDB = require('./config/db');
const validateEnv = require('./config/env');

const PORT = process.env.PORT || 5000;

async function start() {
  validateEnv();
  await connectDB();

  if (process.env.NODE_ENV === 'production') {
    // 生产环境：从 JSON 种子文件导入数据（幂等）
    const prodSeed = require('./utils/prodSeed');
    await prodSeed();
  } else {
    // 本地开发：使用原有的增量种子
    const seedAdmin = require('./utils/seedAdmin');
    const seedUniversities = require('./utils/seedUniversities');
    const seedMajors = require('./utils/seedMajors');
    const seedCourses = require('./utils/seedCourses');
    await seedAdmin();
    await seedUniversities();
    await seedMajors();
    await seedCourses();
  }

  app.listen(PORT, () => {
    console.log(`服务器已启动: http://localhost:${PORT}`);
  });
}

start();
