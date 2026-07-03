const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// 路由
const authRoutes = require('./routes/authRoutes');
const siteSettingRoutes = require('./routes/siteSettingRoutes');
const newsRoutes = require('./routes/newsRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const universityRoutes = require('./routes/universityRoutes');
const majorRoutes = require('./routes/majorRoutes');
const courseRoutes = require('./routes/courseRoutes');

const app = express();

// ── CORS — 生产环境限制来源，本地开发全放 ──────────────────────────
const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin(origin, cb) {
      // 无 origin（同源请求、Postman 等）直接放行
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return cb(null, true);
      }
      // 生产环境拒绝未知来源
      console.warn(`CORS 拒绝: ${origin}`);
      cb(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件 — 上传目录
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 生产环境 — 服务 React 构建产物
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  // SPA fallback: 所有非 API 路由返回 index.html
  app.get(/^\/(?!api\/)/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/settings', siteSettingRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/admin/media', mediaRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/majors', majorRoutes);
app.use('/api/courses', courseRoutes);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: '服务器运行正常' });
});

// 全局错误处理
app.use(errorHandler);

module.exports = app;
