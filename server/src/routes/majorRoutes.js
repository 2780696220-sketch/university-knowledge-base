const router = require('express').Router();
const controller = require('../controllers/majorController');

// Public routes
router.get('/categories', controller.getCategories);
router.get('/search', controller.search);
router.get('/', controller.getChildren);
router.get('/:slug', controller.getBySlug);

module.exports = router;
