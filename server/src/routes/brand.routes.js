const { Router } = require('express');
const Brand = require('../models/Brand');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json({ brands });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
