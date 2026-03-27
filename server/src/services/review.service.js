const pool = require('../config/db');

async function getReviews(productId) {
  const result = await pool.query(
    `SELECT r.*, u.name AS user_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC`,
    [productId]
  );
  return result.rows;
}

async function createReview(productId, userId, { rating, title, body }) {
  const result = await pool.query(
    `INSERT INTO reviews (product_id, user_id, rating, title, body)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [productId, userId, rating, title, body]
  );
  return result.rows[0];
}

async function updateReview(reviewId, userId, { rating, title, body }) {
  const result = await pool.query(
    `UPDATE reviews SET rating = $1, title = $2, body = $3
     WHERE id = $4 AND user_id = $5
     RETURNING *`,
    [rating, title, body, reviewId, userId]
  );
  if (result.rows.length === 0) {
    const err = new Error('Review not found or not yours');
    err.status = 404;
    throw err;
  }
  return result.rows[0];
}

async function deleteReview(reviewId, userId) {
  const result = await pool.query(
    'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id',
    [reviewId, userId]
  );
  if (result.rows.length === 0) {
    const err = new Error('Review not found or not yours');
    err.status = 404;
    throw err;
  }
}

module.exports = { getReviews, createReview, updateReview, deleteReview };
