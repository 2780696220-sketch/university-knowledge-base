const router = require('express').Router();
const newsController = require('../controllers/newsController');
const authMiddleware = require('../middleware/authMiddleware');

// 管理接口（必须在 /:slug 之前注册，避免 "admin" 被当作 slug）
router.get('/admin/list', authMiddleware, newsController.getAdminList);
router.get('/admin/:id', authMiddleware, newsController.getById);
router.post('/admin', authMiddleware, newsController.create);
router.put('/admin/:id', authMiddleware, newsController.update);
router.delete('/admin/:id', authMiddleware, newsController.remove);

// 公开接口
router.get('/', newsController.getPublicList);
router.get('/:slug', newsController.getPublicBySlug);

module.exports = router;
