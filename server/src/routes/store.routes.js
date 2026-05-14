const { Router } = require('express');
const Store = require('../models/Store');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const stores = await Store.find().sort({ sort_order: 1, createdAt: 1 })
      .select('name description address phone working_hours image_filename sort_order');
    res.json({
      stores: stores.map((s) => ({
        id:            s._id.toString(),
        name:          s.name,
        description:   s.description  || '',
        address:       s.address      || '',
        phone:         s.phone        || '',
        working_hours: s.working_hours|| '',
        image_url:     s.image_filename ? `/api/images/${s.image_filename}` : null,
      })),
    });
  } catch (err) { next(err); }
});

// Per-store availability for a specific product
router.get('/product/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const stores = await Store.find().sort({ sort_order: 1, createdAt: 1 });
    const result = stores.map((s) => {
      const inv = s.inventory.find((i) => i.product.toString() === productId);
      const quantity = inv ? inv.quantity : 0;
      return {
        id: s._id.toString(),
        name: s.name,
        address: s.address || '',
        working_hours: s.working_hours || '',
        phone: s.phone || '',
        image_url: s.image_filename ? `/api/images/${s.image_filename}` : null,
        quantity,
        in_stock: quantity > 0,
      };
    });
    res.json({ stores: result });
  } catch (err) { next(err); }
});

module.exports = router;
