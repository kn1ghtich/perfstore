const { Router } = require('express');
const pool = require('../config/db');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json({ categories: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
