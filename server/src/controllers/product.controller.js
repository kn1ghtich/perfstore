const productService = require('../services/product.service');
const Store = require('../models/Store');

async function list(req, res, next) {
  try {
    const { page, limit, brand, brands, category, categories, gender, minPrice, maxPrice, sort, q, store } = req.query;

    let productIds;
    if (store) {
      const storeDoc = await Store.findById(store).select('inventory').lean();
      productIds = storeDoc ? storeDoc.inventory.map((i) => i.product.toString()) : [];
    }

    const result = await productService.listProducts({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 12,
      brand, brands, category, categories, gender, minPrice, maxPrice, sort, search: q,
      productIds,
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
