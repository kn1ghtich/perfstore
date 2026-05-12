const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const User = require('../models/User');
const Review = require('../models/Review');
const Store = require('../models/Store');

// ─── Products ────────────────────────────────────────────────────────────────

async function listProducts({ page = 1, limit = 20, search = '' }) {
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('brand', 'name slug')
      .populate('categories', 'name slug')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  const ids = products.map((p) => p._id);

  // Attach review counts
  const [counts, stores] = await Promise.all([
    Review.aggregate([
      { $match: { product: { $in: ids } } },
      { $group: { _id: '$product', count: { $sum: 1 }, avg: { $avg: '$rating' } } },
    ]),
    // Sum branch inventory quantities for every product on this page
    Store.find({ 'inventory.product': { $in: ids } }).select('inventory').lean(),
  ]);

  const countMap = {};
  counts.forEach((c) => { countMap[c._id.toString()] = c; });

  // Build map: productId -> total branch qty
  const branchQtyMap = {};
  for (const store of stores) {
    for (const inv of store.inventory) {
      const pid = inv.product.toString();
      branchQtyMap[pid] = (branchQtyMap[pid] || 0) + (inv.quantity || 0);
    }
  }

  return {
    products: products.map((p) => {
      const obj = p.toObject({ virtuals: true });
      const stats = countMap[obj.id] || { count: 0, avg: 0 };
      // Branch total takes priority; fallback to global quantity if not in any store
      const quantity = obj.id in branchQtyMap ? branchQtyMap[obj.id] : (obj.quantity ?? 0);
      const in_stock = quantity > 0;
      return {
        ...obj,
        quantity,
        in_stock,
        review_count: stats.count,
        avg_rating: stats.avg ? Math.round(stats.avg * 10) / 10 : 0,
        brand_name: obj.brand?.name || '',
      };
    }),
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  };
}

async function getProduct(id) {
  const product = await Product.findById(id)
    .populate('brand', 'name slug')
    .populate('categories', 'name slug');
  if (!product) {
    const err = new Error('Товар не найден');
    err.status = 404;
    throw err;
  }
  return product.toObject({ virtuals: true });
}

async function deleteProduct(id) {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    const err = new Error('Товар не найден');
    err.status = 404;
    throw err;
  }
  return { ok: true };
}

async function createProduct(fields) {
  const allowed = ['name', 'slug', 'description', 'price', 'original_price', 'gender', 'concentration', 'volume_ml', 'in_stock', 'quantity', 'notes', 'brand', 'categories'];
  const data = {};
  for (const key of allowed) {
    if (fields[key] !== undefined) data[key] = fields[key];
  }
  const product = await Product.create(data);
  return (await Product.findById(product._id)
    .populate('brand', 'name slug')
    .populate('categories', 'name slug'))
    .toObject({ virtuals: true });
}

async function updateProduct(id, fields) {
  const allowed = ['name', 'slug', 'description', 'price', 'original_price', 'gender', 'concentration', 'volume_ml', 'in_stock', 'quantity', 'notes', 'brand', 'categories', 'images'];
  const update = {};
  for (const key of allowed) {
    if (fields[key] !== undefined) update[key] = fields[key];
  }

  const product = await Product.findByIdAndUpdate(id, update, { new: true, runValidators: true })
    .populate('brand', 'name slug')
    .populate('categories', 'name slug');

  if (!product) {
    const err = new Error('Товар не найден');
    err.status = 404;
    throw err;
  }
  return product.toObject({ virtuals: true });
}

// ─── Users ───────────────────────────────────────────────────────────────────

async function listUsers({ page = 1, limit = 20, search = '' }) {
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password_hash')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  // Order counts per user
  const Order = require('../models/Order');
  const ids = users.map((u) => u._id);
  const orderCounts = await Order.aggregate([
    { $match: { user: { $in: ids } } },
    { $group: { _id: '$user', count: { $sum: 1 }, total: { $sum: '$total' } } },
  ]);
  const orderMap = {};
  orderCounts.forEach((o) => { orderMap[o._id.toString()] = o; });

  return {
    users: users.map((u) => {
      const obj = u.toObject({ virtuals: true });
      const stats = orderMap[obj.id] || { count: 0, total: 0 };
      return { ...obj, order_count: stats.count, orders_total: stats.total };
    }),
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  };
}

async function getUser(id) {
  const user = await User.findById(id).select('-password_hash');
  if (!user) {
    const err = new Error('Пользователь не найден');
    err.status = 404;
    throw err;
  }
  const obj = user.toObject({ virtuals: true });

  const Order = require('../models/Order');
  const orders = await Order.find({ user: id }).sort({ created_at: -1 }).limit(10);

  return {
    ...obj,
    orders: orders.map((o) => o.toObject({ virtuals: true })),
  };
}

async function updateUserRole(id, role) {
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password_hash');
  if (!user) {
    const err = new Error('Пользователь не найден');
    err.status = 404;
    throw err;
  }
  return user.toObject({ virtuals: true });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

const Order = require('../models/Order');

async function listOrders({ page = 1, limit = 20, status = '', search = '' }) {
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { 'contact.name':  { $regex: search, $options: 'i' } },
      { 'contact.email': { $regex: search, $options: 'i' } },
      { 'contact.phone': { $regex: search, $options: 'i' } },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email first_name last_name')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return {
    orders: orders.map((o) => o.toObject({ virtuals: true })),
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  };
}

async function updateOrderStatus(id, status) {
  const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) {
    const err = new Error('Неверный статус'); err.status = 400; throw err;
  }
  const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
    .populate('user', 'name email');
  if (!order) { const err = new Error('Заказ не найден'); err.status = 404; throw err; }
  return order.toObject({ virtuals: true });
}

// ─── Stats / Dashboard ────────────────────────────────────────────────────────

async function getStats() {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo  = new Date(today - 7  * 86400000);
  const monthAgo = new Date(today - 30 * 86400000);

  const [
    totalOrders,
    totalRevenue,
    todayOrders,
    weekOrders,
    monthOrders,
    byStatus,
    revenueByDay,
    topProducts,
    newUsers,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, sum: { $sum: '$total' } } }]),
    Order.countDocuments({ created_at: { $gte: today } }),
    Order.countDocuments({ created_at: { $gte: weekAgo } }),
    Order.countDocuments({ created_at: { $gte: monthAgo } }),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { created_at: { $gte: monthAgo }, status: { $ne: 'cancelled' } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          revenue: { $sum: '$total' },
          count:   { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', brand: { $first: '$items.brand_name' }, qty: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
    User.countDocuments({ created_at: { $gte: weekAgo } }),
  ]);

  const statusMap = {};
  byStatus.forEach((s) => { statusMap[s._id] = s.count; });

  return {
    totalOrders,
    totalRevenue: totalRevenue[0]?.sum || 0,
    todayOrders,
    weekOrders,
    monthOrders,
    avgCheck: totalOrders > 0 ? (totalRevenue[0]?.sum || 0) / totalOrders : 0,
    byStatus: statusMap,
    revenueByDay,
    topProducts,
    newUsersThisWeek: newUsers,
  };
}

// ─── Dictionaries ─────────────────────────────────────────────────────────────

async function getBrands() {
  const brands = await Brand.find().sort({ name: 1 });
  return brands.map((b) => b.toObject({ virtuals: true }));
}

async function getCategories() {
  const cats = await Category.find().sort({ name: 1 });
  return cats.map((c) => c.toObject({ virtuals: true }));
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct, listUsers, getUser, updateUserRole, listOrders, updateOrderStatus, getStats, getBrands, getCategories };
