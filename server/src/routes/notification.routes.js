const router = require('express').Router();
const Notification = require('../models/Notification');

// Public: get recent 50 notifications
router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .sort({ created_at: -1 })
      .limit(50)
      .populate('product', 'name slug image_url');
    res.json({ notifications: notifications.map(n => ({ ...n.toObject({ virtuals: true }), id: n._id.toString() })) });
  } catch (err) { next(err); }
});

module.exports = router;
