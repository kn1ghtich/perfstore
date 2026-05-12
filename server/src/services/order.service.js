const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');

async function createOrder({ userId, items, total, contact, city, delivery_address, payment_method, storeId }) {
  // ── Stock validation ──────────────────────────────────────────────────────
  const stockErrors = [];

  if (storeId) {
    // Branch-level validation: check store inventory
    const store = await Store.findById(storeId).lean();
    if (!store) {
      const err = new Error('Филиал не найден');
      err.status = 404;
      throw err;
    }
    for (const item of items) {
      if (!item.product_id) continue;
      const inv = store.inventory.find((i) => i.product.toString() === item.product_id);
      const available = inv ? inv.quantity : 0;
      if (available < item.quantity) {
        stockErrors.push({ name: item.name, requested: item.quantity, available });
      }
    }
  } else {
    // Global stock validation (no store selected)
    for (const item of items) {
      if (!item.product_id) continue;
      const product = await Product.findById(item.product_id).select('quantity in_stock name').lean();
      if (!product) continue;
      if (!product.in_stock || product.quantity < item.quantity) {
        stockErrors.push({ name: item.name, requested: item.quantity, available: product.quantity || 0 });
      }
    }
  }

  if (stockErrors.length > 0) {
    const err = new Error('Недостаточно товара в наличии');
    err.status = 409;
    err.stockErrors = stockErrors;
    throw err;
  }

  // ── Create order ──────────────────────────────────────────────────────────
  const order = await Order.create({
    user: userId || null,
    store: storeId || null,
    items,
    total,
    contact,
    city,
    delivery_address,
    payment_method,
  });

  // ── Decrease stock ────────────────────────────────────────────────────────
  for (const item of items) {
    if (!item.product_id) continue;

    if (storeId) {
      // Deduct from branch inventory
      await Store.updateOne(
        { _id: storeId, 'inventory.product': item.product_id },
        { $inc: { 'inventory.$.quantity': -item.quantity } }
      );

      // Sync Product.in_stock + quantity from ALL branch totals (source of truth)
      const allStores = await Store.find({ 'inventory.product': item.product_id }).select('inventory').lean();
      const totalBranchQty = allStores.reduce((sum, s) => {
        const inv = s.inventory.find((i) => i.product.toString() === item.product_id);
        return sum + (inv?.quantity ?? 0);
      }, 0);
      await Product.findByIdAndUpdate(item.product_id, {
        $set: { quantity: totalBranchQty, in_stock: totalBranchQty > 0 },
      });
    } else {
      // No store selected — fall back to global quantity sync
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { quantity: -item.quantity },
        $set: { in_stock: true },
      });
      await Product.updateOne(
        { _id: item.product_id, quantity: { $lte: 0 } },
        { $set: { quantity: 0, in_stock: false } }
      );
    }
  }

  return order.toObject({ virtuals: true });
}

async function getUserOrders(userId) {
  const orders = await Order.find({ user: userId }).sort({ created_at: -1 });
  return orders.map((o) => o.toObject({ virtuals: true }));
}

async function getOrderById(orderId, userId) {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }
  return order.toObject({ virtuals: true });
}

module.exports = { createOrder, getUserOrders, getOrderById };
