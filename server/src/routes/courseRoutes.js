const router = require('express').Router();
const controller = require('../controllers/courseController');

// 公开路由 — 按专业类获取课程（含 enriched 标记）
router.get('/', controller.getByParent);

// 公开路由 — 获取单个课程详情（含视频和资料）
router.get('/:id', controller.getById);

module.exports = router;
