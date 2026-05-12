const { Router } = require('express');
const { getBucket } = require('../config/gridfs');

const router = Router();

router.get('/:filename', async (req, res) => {
  try {
    const bucket = getBucket();
    const files = await bucket.find({ filename: req.params.filename }).toArray();

    if (files.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const file = files[0];
    const contentType = file.metadata?.contentType || 'image/png';

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');

    bucket.openDownloadStreamByName(req.params.filename).pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load image' });
  }
});

module.exports = router;
