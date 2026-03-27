const { Router } = require('express');
const reviewController = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/products/:productId/reviews', reviewController.getReviews);
router.post('/products/:productId/reviews', authenticate, reviewController.createReview);
router.put('/reviews/:id', authenticate, reviewController.updateReview);
router.delete('/reviews/:id', authenticate, reviewController.deleteReview);

module.exports = router;
