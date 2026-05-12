const orderService = require('../services/order.service');

async function create(req, res, next) {
  try {
    const { items, total, contact, city, delivery_address, payment_method, store_id } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    if (typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ error: 'Invalid total' });
    }

    const order = await orderService.createOrder({
      userId: req.user?.id || null,
      items,
      total,
      contact,
      city,
      delivery_address,
      payment_method,
      storeId: store_id || null,
    });

    res.status(201).json({ order });
  } catch (err) {
    // Pass stock validation errors with details to the client
    if (err.status === 409 && err.stockErrors) {
      return res.status(409).json({ error: err.message, stockErrors: err.stockErrors });
    }
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const orders = await orderService.getUserOrders(req.user.id);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.id);
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getOne };
