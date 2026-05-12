const Product = require('../models/Product');
const Review = require('../models/Review');

async function listProducts({ page = 1, limit = 10, brand, brands, category, categories, gender, minPrice, maxPrice, sort, search, productIds }) {
  const offset = (page - 1) * limit;
  const pipeline = [];

  // Restrict to specific product IDs (e.g. store inventory filter)
  if (productIds) {
    const mongoose = require('mongoose');
    const ids = productIds.map((id) => {
      try { return new mongoose.Types.ObjectId(id); } catch { return null; }
    }).filter(Boolean);
    pipeline.push({ $match: { _id: { $in: ids } } });
  }

  // Filters on product fields
  const directMatch = {};
  if (gender) directMatch.gender = gender;
  if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
    directMatch.price = directMatch.price || {};
    directMatch.price.$gte = parseFloat(minPrice);
  }
  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
    directMatch.price = directMatch.price || {};
    directMatch.price.$lte = parseFloat(maxPrice);
  }
  if (search) {
    directMatch.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (Object.keys(directMatch).length > 0) {
    pipeline.push({ $match: directMatch });
  }

  // Brand lookup
  pipeline.push({ $lookup: { from: 'brands', localField: 'brand', foreignField: '_id', as: '_brand' } });
  pipeline.push({ $unwind: { path: '$_brand', preserveNullAndEmptyArrays: true } });

  // Brand filter — support multiple (comma-separated) or single
  const brandSlugs = brands
    ? brands.split(',').map((s) => s.trim()).filter(Boolean)
    : brand ? [brand] : null;
  if (brandSlugs && brandSlugs.length > 0) {
    pipeline.push({ $match: { '_brand.slug': brandSlugs.length === 1 ? brandSlugs[0] : { $in: brandSlugs } } });
  }

  // Category lookup and filter — support multiple (comma-separated) or single
  pipeline.push({ $lookup: { from: 'categories', localField: 'categories', foreignField: '_id', as: '_categories' } });
  const catSlugs = categories
    ? categories.split(',').map((s) => s.trim()).filter(Boolean)
    : category ? [category] : null;
  if (catSlugs && catSlugs.length > 0) {
    pipeline.push({ $match: { '_categories.slug': catSlugs.length === 1 ? catSlugs[0] : { $in: catSlugs } } });
  }

  // Reviews lookup for computed stats
  pipeline.push({ $lookup: { from: 'reviews', localField: '_id', foreignField: 'product', as: '_reviews' } });

  // Computed fields
  pipeline.push({
    $addFields: {
      id: { $toString: '$_id' },
      avg_rating: { $ifNull: [{ $round: [{ $avg: '$_reviews.rating' }, 1] }, 0] },
      review_count: { $size: '$_reviews' },
      brand_name: '$_brand.name',
      brand_slug: '$_brand.slug',
      categories: {
        $map: {
          input: '$_categories',
          as: 'cat',
          in: { name: '$$cat.name', slug: '$$cat.slug', description: '$$cat.description' },
        },
      },
    },
  });

  pipeline.push({ $project: { _brand: 0, _categories: 0, _reviews: 0, __v: 0 } });

  const sortStage = {};
  if (sort === 'price_asc') sortStage.price = 1;
  else if (sort === 'price_desc') sortStage.price = -1;
  else if (sort === 'name') sortStage.name = 1;
  else sortStage.created_at = -1;

  const countPipeline = [...pipeline, { $count: 'total' }];
  const dataPipeline = [...pipeline, { $sort: sortStage }, { $skip: offset }, { $limit: limit }];

  const [countResult, products] = await Promise.all([
    Product.aggregate(countPipeline),
    Product.aggregate(dataPipeline),
  ]);

  const total = countResult[0]?.total ?? 0;

  return {
    products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getProductBySlug(slug) {
  const product = await Product.findOne({ slug })
    .populate('brand', 'name slug country')
    .populate('categories', 'name slug description');

  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }

  const [stats] = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const result = product.toObject({ virtuals: true });
  result.brand_name = result.brand?.name;
  result.brand_slug = result.brand?.slug;
  result.brand_country = result.brand?.country;
  result.avg_rating = stats ? Math.round(stats.avg * 10) / 10 : 0;
  result.review_count = stats?.count ?? 0;

  return result;
}

async function searchProducts(query) {
  const products = await Product.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ],
  })
    .populate('brand', 'name slug')
    .limit(20)
    .select('name slug price original_price image_url gender brand');

  return products.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    image_url: p.image_url,
    gender: p.gender,
    brand_name: p.brand?.name,
    brand_slug: p.brand?.slug,
  }));
}

module.exports = { listProducts, getProductBySlug, searchProducts };
