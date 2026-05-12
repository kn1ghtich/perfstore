const { Router } = require('express');
const Category = require('../models/Category');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
