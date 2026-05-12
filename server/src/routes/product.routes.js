const { Router } = require('express');
const productController = require('../controllers/product.controller');
const { getSimilarProducts } = require('../services/recommendation.service');

const router = Router();

router.get('/search', productController.search);
router.get('/', productController.list);

// Similar products — content-based (Stage 2)
router.get('/:id/similar', async (req, res, next) => {
  try {
    const products = await getSimilarProducts(req.params.id, 6);
    res.json({ products });
  } catch (err) { next(err); }
});

router.get('/:slug', productController.getBySlug);

module.exports = router;
