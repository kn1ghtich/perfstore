const { Router } = require('express');
const pool = require('../config/db');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM brands ORDER BY name');
    res.json({ brands: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
