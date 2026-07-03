const router = require('express').Router();
const mediaController = require('../controllers/mediaController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

router.get('/', mediaController.list);
router.post('/upload', upload.array('files', 10), mediaController.upload);
router.delete('/:id', mediaController.remove);

module.exports = router;
