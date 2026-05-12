const Review = require('../models/Review');

async function getReviews(productId) {
  const reviews = await Review.find({ product: productId })
    .populate('user', 'name')
    .sort({ created_at: -1 });

  return reviews.map(r => {
    const obj = r.toObject({ virtuals: true });
    obj.user_name = r.user?.name;
    return obj;
  });
}

async function createReview(productId, userId, { rating, title, body }) {
  const review = await Review.create({ product: productId, user: userId, rating, title, body });
  return review.toObject({ virtuals: true });
}

async function updateReview(reviewId, userId, { rating, title, body }) {
  const review = await Review.findOneAndUpdate(
    { _id: reviewId, user: userId },
    { rating, title, body },
    { new: true }
  );
  if (!review) {
    const err = new Error('Review not found or not yours');
    err.status = 404;
    throw err;
  }
  return review.toObject({ virtuals: true });
}

async function deleteReview(reviewId, userId) {
  const result = await Review.findOneAndDelete({ _id: reviewId, user: userId });
  if (!result) {
    const err = new Error('Review not found or not yours');
    err.status = 404;
    throw err;
  }
}

module.exports = { getReviews, createReview, updateReview, deleteReview };
