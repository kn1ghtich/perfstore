const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const admin = require('../services/admin.service');
const Store = require('../models/Store');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { getBucket } = require('../config/gridfs');
const { randomUUID } = require('crypto');
const Notification = require('../models/Notification');
const StockAlert = require('../models/StockAlert');
const Slide = require('../models/Slide');

// ─── Helpers ───────────────────────────────────────────────────────────────

async function saveBase64Image(base64DataUrl) {
  if (!base64DataUrl || !base64DataUrl.startsWith('data:')) return null;
  const matches = base64DataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) return null;
  const contentType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const ext = contentType.split('/')[1]?.split('+')[0] || 'jpg';
  const filename = `store_${randomUUID()}.${ext}`;
  const bucket = getBucket();
  const uploadStream = bucket.openUploadStream(filename, { metadata: { contentType } });
  return new Promise((resolve, reject) => {
    uploadStream.on('finish', () => resolve(filename));
    uploadStream.on('error', reject);
    uploadStream.end(buffer);
  });
}

async function deleteImage(filename) {
  if (!filename) return;
  try {
    const bucket = getBucket();
    const files = await bucket.find({ filename }).toArray();
    if (files.length > 0) await bucket.delete(files[0]._id);
  } catch (_) {}
}

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

// ─── Products ──────────────────────────────────────────────────────────────

router.get('/products', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const data = await admin.listProducts({ page: Number(page), limit: Number(limit), search });
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/products', async (req, res, next) => {
  try {
    const product = await admin.createProduct(req.body);
    res.status(201).json({ product });
  } catch (err) { next(err); }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    await admin.deleteProduct(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.get('/products/:id', async (req, res, next) => {
  try {
    const product = await admin.getProduct(req.params.id);
    res.json({ product });
  } catch (err) { next(err); }
});

router.put('/products/:id', async (req, res, next) => {
  try {
    // Fetch old product to detect restock + price/discount changes
    const old = await Product.findById(req.params.id)
      .select('quantity in_stock name slug image_url price original_price')
      .lean();

    const body = { ...req.body };

    // If this product exists in any branch — derive in_stock from branch totals
    // (branch data is the source of truth; manual in_stock toggle is ignored)
    const branchStores = await Store.find({ 'inventory.product': req.params.id }).select('inventory').lean();
    if (branchStores.length > 0) {
      const totalBranchQty = branchStores.reduce((sum, s) => {
        const inv = s.inventory.find((i) => i.product.toString() === req.params.id);
        return sum + (inv?.quantity ?? 0);
      }, 0);
      body.in_stock = totalBranchQty > 0;
    } else if (body.quantity !== undefined) {
      // No branches — fall back to global quantity
      body.quantity = Math.max(0, Number(body.quantity));
      if (body.in_stock === undefined) body.in_stock = body.quantity > 0;
    }

    const product = await admin.updateProduct(req.params.id, body);

    // ── Restock notification ──────────────────────────────────────────────
    const newQty = body.quantity;
    const wasOut = (old.quantity === 0 || !old.in_stock);
    if (newQty !== undefined && newQty > 0 && wasOut) {
      await Notification.create({
        type: 'restock',
        title: `${old.name} снова в наличии`,
        message: `Парфюм пополнен. Доступно ${newQty} шт.`,
        link: `/product/${old.slug}`,
        product: old._id,
      });
      await StockAlert.updateMany({ product: old._id, notified: false }, { notified: true });
    }

    // ── Price / discount notification ─────────────────────────────────────
    const newPrice = body.price !== undefined ? parseFloat(body.price) : old.price;
    // Use explicit body value if the key was sent (even null = clearing discount)
    const newOriginalPrice = 'original_price' in body
      ? (body.original_price ? parseFloat(body.original_price) : null)
      : old.original_price;

    // Effective discount % (0 = no discount)
    const oldDiscount = old.original_price && old.original_price > old.price
      ? Math.round((1 - old.price / old.original_price) * 100) : 0;
    const newDiscount = newOriginalPrice && newOriginalPrice > newPrice
      ? Math.round((1 - newPrice / newOriginalPrice) * 100) : 0;

    if (newDiscount > 0 && newDiscount > oldDiscount) {
      // Discount added or increased
      await Notification.create({
        type: 'promotion',
        title: `Скидка −${newDiscount}% на ${old.name}`,
        message: `Новая цена $${newPrice.toFixed(2)} вместо $${newOriginalPrice.toFixed(2)}`,
        link: `/product/${old.slug}`,
        product: old._id,
      });
    } else if (newDiscount === 0 && newPrice < old.price) {
      // Plain price drop (no original_price set)
      const dropPct = Math.round((1 - newPrice / old.price) * 100);
      if (dropPct >= 1) {
        await Notification.create({
          type: 'promotion',
          title: `Снижение цены: ${old.name}`,
          message: `Цена снизилась с $${old.price.toFixed(2)} до $${newPrice.toFixed(2)} (−${dropPct}%)`,
          link: `/product/${old.slug}`,
          product: old._id,
        });
      }
    }

    res.json({ product });
  } catch (err) { next(err); }
});

// ─── Users ─────────────────────────────────────────────────────────────────

router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const data = await admin.listUsers({ page: Number(page), limit: Number(limit), search });
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await admin.getUser(req.params.id);
    res.json({ user });
  } catch (err) { next(err); }
});

router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Неверная роль' });
    const user = await admin.updateUserRole(req.params.id, role);
    res.json({ user });
  } catch (err) { next(err); }
});

// ─── Orders ────────────────────────────────────────────────────────────────

router.get('/orders', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = '', search = '' } = req.query;
    const data = await admin.listOrders({ page: Number(page), limit: Number(limit), status, search });
    res.json(data);
  } catch (err) { next(err); }
});

router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const order = await admin.updateOrderStatus(req.params.id, req.body.status);
    res.json({ order });
  } catch (err) { next(err); }
});

// ─── Stats ─────────────────────────────────────────────────────────────────

router.get('/stats', async (req, res, next) => {
  try {
    res.json(await admin.getStats());
  } catch (err) { next(err); }
});

// ─── Dictionaries ──────────────────────────────────────────────────────────

router.get('/brands', async (req, res, next) => {
  try {
    res.json({ brands: await admin.getBrands() });
  } catch (err) { next(err); }
});

router.get('/categories', async (req, res, next) => {
  try {
    res.json({ categories: await admin.getCategories() });
  } catch (err) { next(err); }
});

// ─── Product image upload ──────────────────────────────────────────────────

// Upload / replace main image
router.post('/products/:id/image', async (req, res, next) => {
  try {
    const { image_base64 } = req.body;
    if (!image_base64) return res.status(400).json({ error: 'image_base64 required' });
    const filename = await saveBase64Image(image_base64);
    const imageUrl = `/api/images/${filename}`;
    await Product.findByIdAndUpdate(req.params.id, { image_url: imageUrl });
    res.json({ image_url: imageUrl });
  } catch (err) { next(err); }
});

// Add image to gallery (images array)
router.post('/products/:id/images', async (req, res, next) => {
  try {
    const { image_base64 } = req.body;
    if (!image_base64) return res.status(400).json({ error: 'image_base64 required' });
    const filename = await saveBase64Image(image_base64);
    const imageUrl = `/api/images/${filename}`;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $push: { images: imageUrl } },
      { new: true }
    );
    res.json({ image_url: imageUrl, images: product.images });
  } catch (err) { next(err); }
});

// Delete image from gallery by index
router.delete('/products/:id/images/:index', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    const idx = parseInt(req.params.index);
    if (isNaN(idx) || idx < 0 || idx >= product.images.length) {
      return res.status(400).json({ error: 'Неверный индекс' });
    }
    product.images.splice(idx, 1);
    await product.save();
    res.json({ images: product.images });
  } catch (err) { next(err); }
});

// ─── Categories CRUD ────────────────────────────────────────────────────────

router.get('/dict/categories', async (req, res, next) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    res.json({ categories: cats.map((c) => c.toObject({ virtuals: true })) });
  } catch (err) { next(err); }
});

router.post('/dict/categories', async (req, res, next) => {
  try {
    const { name, slug, description } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'name и slug обязательны' });
    const cat = await Category.create({ name, slug, description });
    res.status(201).json({ category: cat.toObject({ virtuals: true }) });
  } catch (err) { next(err); }
});

router.put('/dict/categories/:id', async (req, res, next) => {
  try {
    const { name, slug, description } = req.body;
    const cat = await Category.findByIdAndUpdate(req.params.id, { name, slug, description }, { new: true });
    if (!cat) return res.status(404).json({ error: 'Не найдено' });
    res.json({ category: cat.toObject({ virtuals: true }) });
  } catch (err) { next(err); }
});

router.delete('/dict/categories/:id', async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ─── Brands CRUD ────────────────────────────────────────────────────────────

router.get('/dict/brands', async (req, res, next) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json({ brands: brands.map((b) => b.toObject({ virtuals: true })) });
  } catch (err) { next(err); }
});

router.post('/dict/brands', async (req, res, next) => {
  try {
    const { name, slug, country, description } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'name и slug обязательны' });
    const brand = await Brand.create({ name, slug, country, description });
    res.status(201).json({ brand: brand.toObject({ virtuals: true }) });
  } catch (err) { next(err); }
});

router.put('/dict/brands/:id', async (req, res, next) => {
  try {
    const { name, slug, country, description } = req.body;
    const brand = await Brand.findByIdAndUpdate(req.params.id, { name, slug, country, description }, { new: true });
    if (!brand) return res.status(404).json({ error: 'Не найдено' });
    res.json({ brand: brand.toObject({ virtuals: true }) });
  } catch (err) { next(err); }
});

router.delete('/dict/brands/:id', async (req, res, next) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ─── New orders badge ───────────────────────────────────────────────────────

router.get('/orders/new-count', async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h
    const count = await Order.countDocuments({ status: 'pending', created_at: { $gte: since } });
    res.json({ count });
  } catch (err) { next(err); }
});

// ─── Orders CSV export ──────────────────────────────────────────────────────

router.get('/orders/export', async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ created_at: -1 }).limit(5000).lean();
    const header = ['ID', 'Дата', 'Клиент', 'Email', 'Телефон', 'Город', 'Адрес', 'Сумма', 'Статус', 'Оплата', 'Позиций'];
    const rows = orders.map((o) => [
      o._id.toString().slice(-8).toUpperCase(),
      new Date(o.created_at).toLocaleDateString('ru-RU'),
      o.contact?.name || '',
      o.contact?.email || '',
      o.contact?.phone || '',
      o.city || '',
      o.delivery_address || '',
      o.total?.toFixed(2) || '0',
      o.status || '',
      o.payment_method || '',
      o.items?.length || 0,
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="orders_${Date.now()}.csv"`);
    res.send('﻿' + csv); // BOM for Excel
  } catch (err) { next(err); }
});

// ─── Stores ────────────────────────────────────────────────────────────────

router.get('/stores', async (req, res, next) => {
  try {
    const stores = await Store.find().sort({ sort_order: 1, createdAt: 1 });
    res.json({ stores: stores.map((s) => s.toObject({ virtuals: true })) });
  } catch (err) { next(err); }
});

// Single store with populated inventory
router.get('/stores/:id', async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate({ path: 'inventory.product', select: 'name slug image_url brand price', populate: { path: 'brand', select: 'name' } });
    if (!store) return res.status(404).json({ error: 'Магазин не найден' });
    res.json({ store: store.toObject({ virtuals: true }) });
  } catch (err) { next(err); }
});

// Add product to store inventory
router.post('/stores/:id/inventory', async (req, res, next) => {
  try {
    const { productId, quantity = 0 } = req.body;
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ error: 'Магазин не найден' });
    const exists = store.inventory.some((i) => i.product.toString() === productId);
    if (exists) return res.status(400).json({ error: 'Товар уже добавлен в этот магазин' });
    store.inventory.push({ product: productId, quantity: Number(quantity) });
    await store.save();

    // Sync Product.in_stock + quantity from all branches
    const allStores = await Store.find({ 'inventory.product': productId }).select('inventory').lean();
    const totalQty = allStores.reduce((sum, s) => {
      const inv = s.inventory.find((i) => i.product.toString() === productId);
      return sum + (inv?.quantity ?? 0);
    }, 0);
    await Product.findByIdAndUpdate(productId, { in_stock: totalQty > 0, quantity: totalQty });

    const updated = await Store.findById(store._id)
      .populate({ path: 'inventory.product', select: 'name slug image_url brand price', populate: { path: 'brand', select: 'name' } });
    res.json({ store: updated.toObject({ virtuals: true }) });
  } catch (err) { next(err); }
});

// Update product quantity in store + auto-sync in_stock
router.patch('/stores/:id/inventory/:productId', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ error: 'Магазин не найден' });
    const item = store.inventory.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ error: 'Товар не найден в магазине' });
    item.quantity = Math.max(0, Number(quantity));
    await store.save();

    // Auto-update product in_stock + quantity based on total qty across all stores
    const agg = await Store.aggregate([
      { $unwind: '$inventory' },
      { $match: { 'inventory.product': item.product } },
      { $group: { _id: null, total: { $sum: '$inventory.quantity' } } },
    ]);
    const totalQty = agg[0]?.total ?? 0;
    await Product.findByIdAndUpdate(item.product, { in_stock: totalQty > 0, quantity: totalQty });

    res.json({ ok: true, quantity: item.quantity });
  } catch (err) { next(err); }
});

// Remove product from store inventory
router.delete('/stores/:id/inventory/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ error: 'Магазин не найден' });
    store.inventory = store.inventory.filter((i) => i.product.toString() !== productId);
    await store.save();

    // Sync Product.in_stock + quantity from remaining branches
    const allStores = await Store.find({ 'inventory.product': productId }).select('inventory').lean();
    const totalQty = allStores.reduce((sum, s) => {
      const inv = s.inventory.find((i) => i.product.toString() === productId);
      return sum + (inv?.quantity ?? 0);
    }, 0);
    await Product.findByIdAndUpdate(productId, { in_stock: totalQty > 0, quantity: totalQty });

    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post('/stores', async (req, res, next) => {
  try {
    const { name, description, address, phone, working_hours, sort_order, image_base64 } = req.body;
    const image_filename = await saveBase64Image(image_base64);
    const store = await Store.create({ name, description, address, phone, working_hours, sort_order, image_filename });
    res.status(201).json({ store: store.toObject({ virtuals: true }) });
  } catch (err) { next(err); }
});

router.put('/stores/:id', async (req, res, next) => {
  try {
    const { name, description, address, phone, working_hours, sort_order, image_base64 } = req.body;
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ error: 'Магазин не найден' });

    let image_filename = store.image_filename;
    if (image_base64) {
      await deleteImage(store.image_filename);
      image_filename = await saveBase64Image(image_base64);
    }

    Object.assign(store, { name, description, address, phone, working_hours, sort_order, image_filename });
    await store.save();
    res.json({ store: store.toObject({ virtuals: true }) });
  } catch (err) { next(err); }
});

router.delete('/stores/:id', async (req, res, next) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) return res.status(404).json({ error: 'Магазин не найден' });
    await deleteImage(store.image_filename);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ─── Notifications ─────────────────────────────────────────────────────────

router.get('/notifications', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [notifications, total] = await Promise.all([
      Notification.find().sort({ created_at: -1 }).skip((page-1)*limit).limit(Number(limit)).populate('product', 'name slug'),
      Notification.countDocuments(),
    ]);
    res.json({ notifications: notifications.map(n => ({ ...n.toObject({ virtuals: true }), id: n._id.toString() })), pagination: { page: Number(page), total, totalPages: Math.ceil(total/limit) } });
  } catch (err) { next(err); }
});

router.post('/notifications', async (req, res, next) => {
  try {
    const { type, title, message, link } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const n = await Notification.create({ type: type || 'info', title, message, link });
    res.status(201).json({ notification: { ...n.toObject({ virtuals: true }), id: n._id.toString() } });
  } catch (err) { next(err); }
});

router.delete('/notifications/:id', async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ─── Stock alerts (admin view) ──────────────────────────────────────────────

router.get('/stock-alerts', async (req, res, next) => {
  try {
    const alerts = await StockAlert.find({ notified: false })
      .populate('user', 'name email')
      .populate('product', 'name slug')
      .sort({ created_at: -1 });
    res.json({ alerts: alerts.map(a => ({ ...a.toObject({ virtuals: true }), id: a._id.toString() })) });
  } catch (err) { next(err); }
});

// ─── Slides (home carousel) ────────────────────────────────────────────────

const toSlideJson = (s) => ({
  ...s.toObject({ virtuals: true }),
  image_url: s.image_filename ? `/api/images/${s.image_filename}` : null,
});

router.get('/slides', async (req, res, next) => {
  try {
    const slides = await Slide.find().sort({ sort_order: 1, created_at: 1 });
    res.json({ slides: slides.map(toSlideJson) });
  } catch (err) { next(err); }
});

router.post('/slides', async (req, res, next) => {
  try {
    const { tag, badge, title, desc, link, external, gradient, accent, emoji, sort_order, active } = req.body;
    const slide = await Slide.create({ tag, badge, title, desc, link, external, gradient, accent, emoji, sort_order, active });
    res.status(201).json({ slide: toSlideJson(slide) });
  } catch (err) { next(err); }
});

router.put('/slides/:id', async (req, res, next) => {
  try {
    const allowed = ['tag', 'badge', 'title', 'desc', 'link', 'external', 'gradient', 'accent', 'emoji', 'sort_order', 'active'];
    const update = {};
    for (const k of allowed) { if (req.body[k] !== undefined) update[k] = req.body[k]; }
    const slide = await Slide.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!slide) return res.status(404).json({ error: 'Слайд не найден' });
    res.json({ slide: toSlideJson(slide) });
  } catch (err) { next(err); }
});

router.post('/slides/:id/image', async (req, res, next) => {
  try {
    const { image_base64 } = req.body;
    if (!image_base64) return res.status(400).json({ error: 'image_base64 required' });
    const slide = await Slide.findById(req.params.id);
    if (!slide) return res.status(404).json({ error: 'Слайд не найден' });
    if (slide.image_filename) await deleteImage(slide.image_filename);
    const filename = await saveBase64Image(image_base64);
    slide.image_filename = filename;
    await slide.save();
    res.json({ image_url: `/api/images/${filename}` });
  } catch (err) { next(err); }
});

router.delete('/slides/:id/image', async (req, res, next) => {
  try {
    const slide = await Slide.findById(req.params.id);
    if (!slide) return res.status(404).json({ error: 'Слайд не найден' });
    if (slide.image_filename) await deleteImage(slide.image_filename);
    slide.image_filename = null;
    await slide.save();
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.delete('/slides/:id', async (req, res, next) => {
  try {
    const slide = await Slide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ error: 'Слайд не найден' });
    if (slide.image_filename) await deleteImage(slide.image_filename);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
