const productService = require('../services/product.service');

async function list(req, res, next) {
  try {
    const { page, limit, brand, category, gender, minPrice, maxPrice, sort, q } = req.query;
    const result = await productService.listProducts({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 12,
      brand, category, gender, minPrice, maxPrice, sort, search: q,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getBySlug(req, res, next) {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

async function search(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ results: [] });
    }
    const results = await productService.searchProducts(q.trim());
    res.json({ results });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getBySlug, search };
