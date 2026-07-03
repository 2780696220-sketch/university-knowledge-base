import axios from 'axios';

const api = axios.create({
  // 生产环境用 Render 后端地址，本地开发走 Vite proxy
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器 — 自动附加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 — 401 时清除 token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      // 如果当前在管理页面，跳转到登录页
      const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      const adminPath = base + '/admin';
      if (window.location.pathname.startsWith(adminPath) && !window.location.pathname.includes('/login')) {
        window.location.href = adminPath + '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
