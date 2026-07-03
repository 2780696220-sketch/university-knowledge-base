const User = require('../models/User');

async function seedAdmin() {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const username = process.env.ADMIN_USERNAME || 'admin';
      const password = process.env.ADMIN_PASSWORD || 'admin123456';

      await User.create({
        username,
        email: `${username}@university.local`,
        password,
        role: 'admin',
      });

      console.log(`管理员账号已创建: ${username} / ${password}`);
    } else {
      console.log('管理员账号已存在，跳过创建');
    }
  } catch (error) {
    console.error('创建管理员账号失败:', error.message);
  }
}

module.exports = seedAdmin;
