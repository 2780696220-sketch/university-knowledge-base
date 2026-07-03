const router = require('express').Router();
const siteSettingController = require('../controllers/siteSettingController');
const authMiddleware = require('../middleware/authMiddleware');

// 公开接口
router.get('/', siteSettingController.getPublic);

// 管理接口
router.put('/', authMiddleware, siteSettingController.update);

module.exports = router;
