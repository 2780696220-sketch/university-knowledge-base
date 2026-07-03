const router = require('express').Router();
const universityController = require('../controllers/universityController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin routes — 必须在 public 通配路由之前注册
router.get('/admin/list', authMiddleware, universityController.getAdminList);
router.post('/admin/batch', authMiddleware, universityController.batchImport);
router.get('/admin/:id', authMiddleware, universityController.getById);
router.post('/admin', authMiddleware, universityController.create);
router.put('/admin/:id', authMiddleware, universityController.update);
router.delete('/admin/:id', authMiddleware, universityController.remove);

// Public routes
router.get('/', universityController.getPublicList);
router.get('/:slug', universityController.getPublicBySlug);

module.exports = router;
