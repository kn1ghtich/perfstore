const pool = require('../config/db');

async function listProducts({ page = 1, limit = 12, brand, category, gender, minPrice, maxPrice, sort, search }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  let paramIdx = 1;

  if (brand) {
    conditions.push(`b.slug = $${paramIdx++}`);
    params.push(brand);
  }
  if (gender) {
    conditions.push(`p.gender = $${paramIdx++}`);
    params.push(gender);
  }
  if (minPrice) {
    conditions.push(`p.price >= $${paramIdx++}`);
    params.push(parseFloat(minPrice));
  }
  if (maxPrice) {
    conditions.push(`p.price <= $${paramIdx++}`);
    params.push(parseFloat(maxPrice));
  }
  if (search) {
    conditions.push(`(p.name ILIKE $${paramIdx} OR p.description ILIKE $${paramIdx})`);
    params.push(`%${search}%`);
    paramIdx++;
  }
  if (category) {
    conditions.push(`EXISTS (
      SELECT 1 FROM product_categories pc
      JOIN categories c ON c.id = pc.category_id
      WHERE pc.product_id = p.id AND c.slug = $${paramIdx++}
    )`);
    params.push(category);
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  let orderBy = 'ORDER BY p.created_at DESC';
  if (sort === 'price_asc') orderBy = 'ORDER BY p.price ASC';
  else if (sort === 'price_desc') orderBy = 'ORDER BY p.price DESC';
  else if (sort === 'name') orderBy = 'ORDER BY p.name ASC';

  const countQuery = `
    SELECT COUNT(*) FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    ${where}
  `;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count);

  const dataQuery = `
    SELECT p.*, b.name AS brand_name, b.slug AS brand_slug,
      COALESCE(
        (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id),
        0
      ) AS avg_rating,
      COALESCE(
        (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id),
        0
      ) AS review_count
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    ${where}
    ${orderBy}
    LIMIT $${paramIdx++} OFFSET $${paramIdx++}
  `;
  params.push(limit, offset);

  const result = await pool.query(dataQuery, params);

  return {
    products: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getProductBySlug(slug) {
  const productResult = await pool.query(
    `SELECT p.*, b.name AS brand_name, b.slug AS brand_slug, b.country AS brand_country,
      COALESCE(
        (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id),
        0
      ) AS avg_rating,
      COALESCE(
        (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id),
        0
      ) AS review_count
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    WHERE p.slug = $1`,
    [slug]
  );

  if (productResult.rows.length === 0) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }

  const product = productResult.rows[0];

  const notesResult = await pool.query(
    'SELECT layer, note FROM product_notes WHERE product_id = $1 ORDER BY layer, id',
    [product.id]
  );

  const categoriesResult = await pool.query(
    `SELECT c.name, c.slug FROM categories c
     JOIN product_categories pc ON pc.category_id = c.id
     WHERE pc.product_id = $1`,
    [product.id]
  );

  product.notes = { top: [], middle: [], base: [] };
  for (const row of notesResult.rows) {
    product.notes[row.layer].push(row.note);
  }
  product.categories = categoriesResult.rows;

  return product;
}

async function searchProducts(query) {
  const result = await pool.query(
    `SELECT p.id, p.name, p.slug, p.price, p.image_url, p.gender,
            b.name AS brand_name, b.slug AS brand_slug
     FROM products p
     LEFT JOIN brands b ON b.id = p.brand_id
     WHERE p.name ILIKE $1 OR p.description ILIKE $1 OR b.name ILIKE $1
     LIMIT 20`,
    [`%${query}%`]
  );
  return result.rows;
}

module.exports = { listProducts, getProductBySlug, searchProducts };
