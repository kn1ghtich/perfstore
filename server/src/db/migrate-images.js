const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/perfstore';
const IMAGES_DIR = path.join(__dirname, '..', '..', '..', 'client', 'public', 'images');

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

async function uploadFile(bucket, filePath, filename) {
  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME[ext] || 'image/png';

  // Delete existing file with same name to allow re-upload
  const existing = await bucket.find({ filename }).toArray();
  for (const f of existing) {
    await bucket.delete(f._id);
  }

  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(filePath);
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { contentType },
    });
    readStream.pipe(uploadStream);
    uploadStream.on('finish', resolve);
    uploadStream.on('error', reject);
    readStream.on('error', reject);
  });
}

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'images' });

  // Read all image files
  let files;
  try {
    files = fs.readdirSync(IMAGES_DIR).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
  } catch {
    console.error(`Images directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  console.log(`Found ${files.length} images to upload`);

  for (const filename of files) {
    const filePath = path.join(IMAGES_DIR, filename);
    process.stdout.write(`  Uploading ${filename}... `);
    await uploadFile(bucket, filePath, filename);
    console.log('done');
  }

  // Update product image_url: /images/foo.png → /api/images/foo.png
  const products = await Product.find({});
  let updated = 0;

  for (const product of products) {
    if (product.image_url && product.image_url.startsWith('/images/')) {
      const filename = path.basename(product.image_url);
      product.image_url = `/api/images/${filename}`;
      await product.save();
      updated++;
    }
  }

  console.log(`\nUpdated image_url for ${updated} products`);
  console.log('Migration complete!');

  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
