const { Router } = require('express');
const Slide = require('../models/Slide');

const router = Router();

// Public: returns active slides sorted by sort_order
router.get('/', async (req, res, next) => {
  try {
    const slides = await Slide.find({ active: true }).sort({ sort_order: 1, created_at: 1 });
    res.json({
      slides: slides.map((s) => ({
        ...s.toObject({ virtuals: true }),
        image_url: s.image_filename ? `/api/images/${s.image_filename}` : null,
      })),
    });
  } catch (err) { next(err); }
});

module.exports = router;
