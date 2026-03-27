const { Router } = require('express');
const productController = require('../controllers/product.controller');

const router = Router();

router.get('/search', productController.search);
router.get('/', productController.list);
router.get('/:slug', productController.getBySlug);

module.exports = router;
