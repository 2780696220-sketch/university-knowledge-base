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
  try {
    console.log('> 验证环境变量...');
    validateEnv();

    console.log('> 连接 MongoDB...');
    await connectDB();
    console.log('> MongoDB 连接成功');

    if (process.env.NODE_ENV === 'production') {
      console.log('> 生产环境：检查种子数据...');
      const prodSeed = require('./utils/prodSeed');
      await prodSeed();
      console.log('> 种子数据检查完毕');
    } else {
      console.log('> 本地环境：运行增量种子...');
      const seedAdmin = require('./utils/seedAdmin');
      const seedUniversities = require('./utils/seedUniversities');
      const seedMajors = require('./utils/seedMajors');
      const seedCourses = require('./utils/seedCourses');
      await seedAdmin();
      await seedUniversities();
      await seedMajors();
      await seedCourses();
      console.log('> 增量种子完成');
    }

    app.listen(PORT, () => {
      console.log(`> 服务器已启动: 端口 ${PORT}`);
    });
  } catch (err) {
    console.error('启动失败:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

start();
