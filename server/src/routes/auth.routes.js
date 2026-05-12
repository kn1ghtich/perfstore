const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const { getRecommendations } = require('../services/recommendation.service');

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);
router.put('/profile', authenticate, authController.updateProfile);

// ─── Personalised recommendations (Stage 1) ────────────────────────────────
router.get('/recommendations', authenticate, async (req, res, next) => {
  try {
    const products = await getRecommendations(req.user.id);
    res.json({ products });
  } catch (err) { next(err); }
});

// ─── Wishlist ───────────────────────────────────────────────────────────────

router.get('/wishlist', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('wishlist', 'name slug price image_url gender brand')
      .populate({ path: 'wishlist', populate: { path: 'brand', select: 'name slug' } });
    res.json({ wishlist: user?.wishlist || [] });
  } catch (err) { next(err); }
});

router.post('/wishlist/toggle', authenticate, async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId required' });
    const user = await User.findById(req.user.id);
    const idx = user.wishlist.findIndex((id) => id.toString() === productId);
    let added;
    if (idx === -1) { user.wishlist.push(productId); added = true; }
    else            { user.wishlist.splice(idx, 1);   added = false; }
    await user.save();
    res.json({ added, wishlist: user.wishlist.map((id) => id.toString()) });
  } catch (err) { next(err); }
});

// ─── Stock Alerts ───────────────────────────────────────────────────────────
const StockAlert = require('../models/StockAlert');

router.post('/stock-alerts', authenticate, async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId required' });
    await StockAlert.findOneAndUpdate(
      { user: req.user.id, product: productId },
      { user: req.user.id, product: productId, notified: false },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.delete('/stock-alerts/:productId', authenticate, async (req, res, next) => {
  try {
    await StockAlert.deleteOne({ user: req.user.id, product: req.params.productId });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.get('/stock-alerts', authenticate, async (req, res, next) => {
  try {
    const alerts = await StockAlert.find({ user: req.user.id }).select('product');
    res.json({ productIds: alerts.map(a => a.product.toString()) });
  } catch (err) { next(err); }
});

module.exports = router;
