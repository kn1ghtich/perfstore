const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order   = require('../models/Order');
const User    = require('../models/User');

// ─── Helper: format a product doc for API response ────────────────────────────
function _fmt(p) {
  return {
    id:             p._id.toString(),
    name:           p.name,
    slug:           p.slug,
    price:          p.price,
    original_price: p.original_price,
    image_url:      p.image_url,
    gender:         p.gender,
    concentration:  p.concentration,
    in_stock:       p.in_stock,
    quantity:       p.quantity,
    brand_name:     p.brand?.name  || '',
    brand_slug:     p.brand?.slug  || '',
    avg_rating:     p.avg_rating   || 0,
    review_count:   p.review_count || 0,
    categories:     (p.categories || []).map((c) => ({ id: c._id?.toString(), name: c.name, slug: c.slug })),
  };
}

// ─── Stage 1: Rule-based personalised recommendations ────────────────────────
// Scores all in-stock products (excluding already purchased) based on:
//   +3 per brand match (from orders + wishlist)
//   +2 per category match
//   +2 gender match, +1 unisex fallback
//   +1 similar price (±35% of user's avg spend)
async function getRecommendations(userId, limit = 10) {
  // 1. Orders
  const orders = await Order.find({ user: userId }).select('items').lean();
  const purchasedIds = new Set(orders.flatMap((o) => o.items.map((i) => i.product_id.toString())));

  // 2. User's wishlist + gender
  const user = await User.findById(userId).select('wishlist gender').lean();
  const wishlistIds = (user?.wishlist || []).map((id) => id.toString());
  const userGender  = user?.gender || '';

  // 3. Preference pool = purchased + wishlist
  const prefIds = [...new Set([...purchasedIds, ...wishlistIds])].filter(Boolean);

  // No history → return popular (in_stock, sorted by rating stub)
  if (prefIds.length === 0) {
    const popular = await Product.find({ in_stock: true })
      .populate('brand', 'name slug')
      .populate('categories', 'name slug')
      .limit(limit)
      .lean();
    return popular.map(_fmt);
  }

  // 4. Load preference products to extract brand / category / price signals
  const prefProducts = await Product.find({ _id: { $in: prefIds } })
    .populate('brand', 'name slug')
    .populate('categories', 'name slug')
    .lean();

  const brandWeight = {};
  const catWeight   = {};
  let   totalPrice  = 0;
  let   priceCount  = 0;

  for (const p of prefProducts) {
    const bid = p.brand?._id?.toString();
    if (bid) brandWeight[bid] = (brandWeight[bid] || 0) + 3;

    for (const cat of p.categories || []) {
      const cid = cat._id?.toString();
      if (cid) catWeight[cid] = (catWeight[cid] || 0) + 2;
    }
    totalPrice += p.price;
    priceCount++;
  }
  const avgPrice = priceCount > 0 ? totalPrice / priceCount : 0;

  // 5. Candidate products (not purchased, in stock)
  const candidates = await Product.find({
    _id:      { $nin: [...purchasedIds] },
    in_stock: true,
  })
    .populate('brand', 'name slug')
    .populate('categories', 'name slug')
    .lean();

  // 6. Score
  const scored = candidates.map((p) => {
    let score = 0;

    const bid = p.brand?._id?.toString();
    if (bid && brandWeight[bid]) score += brandWeight[bid];

    for (const cat of p.categories || []) {
      const cid = cat._id?.toString();
      if (cid && catWeight[cid]) score += catWeight[cid];
    }

    if (userGender) {
      if (p.gender === userGender)   score += 2;
      else if (p.gender === 'unisex') score += 1;
    }

    if (avgPrice > 0) {
      const diff = Math.abs(p.price - avgPrice) / avgPrice;
      if (diff <= 0.35) score += 1;
    }

    return { p, score };
  });

  // 7. Top-N by score (only items with at least 1 signal)
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => _fmt(s.p));
}

// ─── Stage 2: Content-based similar products ──────────────────────────────────
// Given a product, scores all other in-stock products by attribute overlap:
//   +4 same brand
//   +2 per shared category
//   +2 same gender (or +1 unisex crossover)
//   +1 same concentration
//   +1 similar price (±30%)
async function getSimilarProducts(productId, limit = 6) {
  const base = await Product.findById(productId)
    .populate('brand', 'name slug')
    .populate('categories', 'name slug')
    .lean();

  if (!base) return [];

  const baseBrand  = base.brand?._id?.toString();
  const baseCatIds = new Set((base.categories || []).map((c) => c._id?.toString()));

  const candidates = await Product.find({
    _id:      { $ne: new mongoose.Types.ObjectId(productId) },
    in_stock: true,
  })
    .populate('brand', 'name slug')
    .populate('categories', 'name slug')
    .lean();

  const scored = candidates.map((p) => {
    let score = 0;

    if (p.brand?._id?.toString() === baseBrand) score += 4;

    for (const cat of p.categories || []) {
      if (baseCatIds.has(cat._id?.toString())) score += 2;
    }

    if (p.gender === base.gender)         score += 2;
    else if (p.gender === 'unisex' || base.gender === 'unisex') score += 1;

    if (p.concentration && p.concentration === base.concentration) score += 1;

    const priceDiff = Math.abs(p.price - base.price) / (base.price || 1);
    if (priceDiff <= 0.3) score += 1;

    return { p, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => _fmt(s.p));
}

module.exports = { getRecommendations, getSimilarProducts };
