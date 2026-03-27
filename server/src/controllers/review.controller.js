const reviewService = require('../services/review.service');

async function getReviews(req, res, next) {
  try {
    const reviews = await reviewService.getReviews(req.params.productId);
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

async function createReview(req, res, next) {
  try {
    const { rating, title, body } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const review = await reviewService.createReview(
      req.params.productId, req.user.id, { rating, title, body }
    );
    res.status(201).json({ review });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'You already reviewed this product' });
    }
    next(err);
  }
}

async function updateReview(req, res, next) {
  try {
    const { rating, title, body } = req.body;
    const review = await reviewService.updateReview(
      req.params.id, req.user.id, { rating, title, body }
    );
    res.json({ review });
  } catch (err) {
    next(err);
  }
}

async function deleteReview(req, res, next) {
  try {
    await reviewService.deleteReview(req.params.id, req.user.id);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getReviews, createReview, updateReview, deleteReview };
