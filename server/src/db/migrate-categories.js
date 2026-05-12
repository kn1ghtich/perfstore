const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '..', '.env') });

const Category = require('../models/Category');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/perfstore';

const CATEGORY_RU = {
  floral:   { name: 'Цветочные',    description: 'Ароматы на основе цветочных нот: роза, жасмин, лилия' },
  woody:    { name: 'Древесные',    description: 'Тёплые, землистые ароматы с сандалом, кедром и ветивером' },
  oriental: { name: 'Восточные',    description: 'Насыщенные, тёплые ароматы с амбром, ванилью и пряностями' },
  fresh:    { name: 'Свежие',       description: 'Чистые, бодрящие ароматы с цитрусовыми и акватическими нотами' },
  gourmand: { name: 'Гурманские',   description: 'Сладкие ароматы с ванилью, шоколадом и карамелью' },
  aromatic: { name: 'Ароматические',description: 'Травяные ароматы с лавандой, розмарином и шалфеем' },
};

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Подключено к MongoDB');

  for (const [slug, data] of Object.entries(CATEGORY_RU)) {
    const result = await Category.updateOne({ slug }, { $set: data });
    if (result.matchedCount > 0) {
      console.log(`✓ ${slug} → ${data.name}`);
    } else {
      console.log(`⚠ Категория не найдена: ${slug}`);
    }
  }

  await mongoose.disconnect();
  console.log('Готово!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
