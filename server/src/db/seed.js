const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '..', '.env') });

const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/perfstore';

const brands = [
  { name: 'Chanel', slug: 'chanel', country: 'France', description: 'Iconic French luxury fashion and perfume house' },
  { name: 'Dior', slug: 'dior', country: 'France', description: 'World-renowned haute couture and fragrance brand' },
  { name: 'Tom Ford', slug: 'tom-ford', country: 'USA', description: 'American luxury brand known for bold, sophisticated fragrances' },
  { name: 'Versace', slug: 'versace', country: 'Italy', description: 'Italian luxury fashion company with vibrant fragrance lines' },
  { name: 'Yves Saint Laurent', slug: 'ysl', country: 'France', description: 'French luxury fashion house with elegant perfumes' },
  { name: 'Creed', slug: 'creed', country: 'France', description: 'Prestigious niche fragrance house since 1760' },
  { name: 'Jo Malone', slug: 'jo-malone', country: 'UK', description: 'British fragrance brand known for elegant simplicity' },
  { name: 'Guerlain', slug: 'guerlain', country: 'France', description: 'One of the oldest perfume houses in the world' },
];

const categories = [
  { name: 'Цветочные', slug: 'floral', description: 'Ароматы на основе цветочных нот: роза, жасмин, лилия' },
  { name: 'Древесные', slug: 'woody', description: 'Тёплые, землистые ароматы с сандалом, кедром и ветивером' },
  { name: 'Восточные', slug: 'oriental', description: 'Насыщенные, тёплые ароматы с амбром, ванилью и пряностями' },
  { name: 'Свежие', slug: 'fresh', description: 'Чистые, бодрящие ароматы с цитрусовыми и акватическими нотами' },
  { name: 'Гурманские', slug: 'gourmand', description: 'Сладкие ароматы с ванилью, шоколадом и карамелью' },
  { name: 'Ароматические', slug: 'aromatic', description: 'Травяные ароматы с лавандой, розмарином и шалфеем' },
];

const products = [
  {
    name: 'Chanel No. 5 Eau de Parfum', slug: 'chanel-no-5-edp', brand: 'chanel',
    description: 'The legendary fragrance that defined modern perfumery. A complex floral aldehyde composition that has remained timeless since 1921.',
    price: 135.00, gender: 'female', concentration: 'Eau de Parfum', volume_ml: 100,
    image_url: '/api/images/chanel-no5.png',
    categories: ['floral', 'oriental'],
    notes: { top: ['Aldehydes', 'Bergamot', 'Lemon'], middle: ['Jasmine', 'Rose', 'Ylang-Ylang'], base: ['Sandalwood', 'Vanilla', 'Musk'] },
  },
  {
    name: 'Dior Sauvage Eau de Toilette', slug: 'dior-sauvage-edt', brand: 'dior',
    description: 'A radically fresh composition inspired by wide-open spaces. Raw and noble, featuring Calabrian bergamot and Ambroxan.',
    price: 105.00, gender: 'male', concentration: 'Eau de Toilette', volume_ml: 100,
    image_url: '/api/images/dior-sauvage.png',
    categories: ['fresh', 'aromatic'],
    notes: { top: ['Bergamot', 'Pepper'], middle: ['Lavender', 'Pink Pepper', 'Geranium'], base: ['Ambroxan', 'Cedar', 'Labdanum'] },
  },
  {
    name: 'Tom Ford Black Orchid', slug: 'tom-ford-black-orchid', brand: 'tom-ford',
    description: 'A luxurious and sensual fragrance of rich, dark accords and an alluring potion of black orchids and spice.',
    price: 180.00, gender: 'unisex', concentration: 'Eau de Parfum', volume_ml: 100,
    image_url: '/api/images/tf-black-orchid.png',
    categories: ['oriental', 'floral'],
    notes: { top: ['Truffle', 'Black Currant', 'Bergamot'], middle: ['Black Orchid', 'Lotus', 'Fruity Notes'], base: ['Patchouli', 'Vanilla', 'Vetiver'] },
  },
  {
    name: 'Versace Eros', slug: 'versace-eros', brand: 'versace',
    description: 'A fragrance for a strong, passionate man. Inspired by Greek mythology, it features mint, green apple, and tonka bean.',
    price: 85.00, gender: 'male', concentration: 'Eau de Toilette', volume_ml: 100,
    image_url: '/api/images/versace-eros.png',
    categories: ['fresh', 'oriental'],
    notes: { top: ['Mint', 'Green Apple', 'Lemon'], middle: ['Tonka Bean', 'Geranium', 'Ambroxan'], base: ['Vanilla', 'Vetiver', 'Oak Moss', 'Cedar'] },
  },
  {
    name: 'YSL Libre Eau de Parfum', slug: 'ysl-libre-edp', brand: 'ysl',
    description: 'The scent of freedom. A daring floral fragrance with lavender essence from France and Moroccan orange blossom.',
    price: 120.00, gender: 'female', concentration: 'Eau de Parfum', volume_ml: 90,
    image_url: '/api/images/ysl-libre.png',
    categories: ['floral', 'aromatic'],
    notes: { top: ['Lavender', 'Mandarin', 'Black Currant'], middle: ['Orange Blossom', 'Jasmine', 'Orchid'], base: ['Madagascar Vanilla', 'Cedar', 'Musk'] },
  },
  {
    name: 'Creed Aventus', slug: 'creed-aventus', brand: 'creed',
    description: 'A bold, masculine blend inspired by the dramatic life of a historic emperor. Rich, fruity, and sophisticated.',
    price: 445.00, gender: 'male', concentration: 'Eau de Parfum', volume_ml: 100,
    image_url: '/api/images/creed-aventus.png',
    categories: ['woody', 'fresh'],
    notes: { top: ['Pineapple', 'Bergamot', 'Black Currant', 'Apple'], middle: ['Birch', 'Jasmine', 'Patchouli'], base: ['Musk', 'Oak Moss', 'Ambergris', 'Vanilla'] },
  },
  {
    name: 'Jo Malone English Pear & Freesia', slug: 'jo-malone-pear-freesia', brand: 'jo-malone',
    description: 'The essence of autumn. Luscious pear wrapped in a bouquet of white freesias and gently finished with amber, patchouli, and woods.',
    price: 75.00, gender: 'unisex', concentration: 'Cologne', volume_ml: 100,
    image_url: '/api/images/jm-pear-freesia.png',
    categories: ['floral', 'fresh'],
    notes: { top: ['Pear', 'Melon'], middle: ['Freesia', 'Rose'], base: ['Patchouli', 'Amber', 'Rhubarb'] },
  },
  {
    name: 'Guerlain Shalimar', slug: 'guerlain-shalimar', brand: 'guerlain',
    description: 'A legendary oriental fragrance created in 1925, inspired by the love story of Emperor Shah Jahan and Mumtaz Mahal.',
    price: 110.00, gender: 'female', concentration: 'Eau de Parfum', volume_ml: 90,
    image_url: '/api/images/guerlain-shalimar.png',
    categories: ['oriental', 'gourmand'],
    notes: { top: ['Bergamot', 'Lemon', 'Mandarin'], middle: ['Jasmine', 'Rose', 'Iris'], base: ['Vanilla', 'Benzoin', 'Opoponax', 'Sandalwood'] },
  },
  {
    name: 'Chanel Bleu de Chanel', slug: 'chanel-bleu-de-chanel', brand: 'chanel',
    description: 'A woody aromatic fragrance that reveals the nature of a man who defies convention. Fresh, clean, and profoundly sensual.',
    price: 130.00, gender: 'male', concentration: 'Eau de Parfum', volume_ml: 100,
    image_url: '/api/images/chanel-bleu.png',
    categories: ['woody', 'aromatic'],
    notes: { top: ['Grapefruit', 'Lemon', 'Mint'], middle: ['Ginger', 'Nutmeg', 'Jasmine', 'Iso E Super'], base: ['Sandalwood', 'Cedar', 'Patchouli', 'Labdanum'] },
  },
  {
    name: 'Dior Miss Dior Blooming Bouquet', slug: 'dior-miss-dior-blooming', brand: 'dior',
    description: 'A tender and sparkling floral composition. A couture fragrance that celebrates the freshness of spring.',
    price: 98.00, gender: 'female', concentration: 'Eau de Toilette', volume_ml: 100,
    image_url: '/api/images/dior-miss-dior.png',
    categories: ['floral', 'fresh'],
    notes: { top: ['Mandarin', 'Grapefruit'], middle: ['Peony', 'Rose', 'Apricot'], base: ['White Musk', 'Moss'] },
  },
  {
    name: 'Tom Ford Tobacco Vanille', slug: 'tom-ford-tobacco-vanille', brand: 'tom-ford',
    description: 'Opulent, warm, and iconic. A rich blend of tobacco leaf and aromatic spices balanced with vanilla and cocoa.',
    price: 280.00, gender: 'unisex', concentration: 'Eau de Parfum', volume_ml: 100,
    image_url: '/api/images/tf-tobacco-vanille.png',
    categories: ['oriental', 'gourmand'],
    notes: { top: ['Tobacco Leaf', 'Spicy Notes'], middle: ['Vanilla', 'Cocoa', 'Tonka Bean'], base: ['Dried Fruits', 'Woody Notes'] },
  },
  {
    name: 'Versace Bright Crystal', slug: 'versace-bright-crystal', brand: 'versace',
    description: 'A fresh, sensual blend of refreshing chilled yuzu and pomegranate mingled with peony, magnolia, and lotus.',
    price: 72.00, gender: 'female', concentration: 'Eau de Toilette', volume_ml: 90,
    image_url: '/api/images/versace-bright-crystal.png',
    categories: ['floral', 'fresh'],
    notes: { top: ['Pomegranate', 'Yuzu', 'Frost'], middle: ['Peony', 'Magnolia', 'Lotus'], base: ['Amber', 'Musk', 'Mahogany'] },
  },
  {
    name: 'Creed Green Irish Tweed', slug: 'creed-green-irish-tweed', brand: 'creed',
    description: 'A classic masculine scent evoking the cool, green, rolling hills of Ireland. Fresh, sporty, and timeless.',
    price: 395.00, gender: 'male', concentration: 'Eau de Parfum', volume_ml: 100,
    image_url: '/api/images/creed-git.png',
    categories: ['fresh', 'aromatic'],
    notes: { top: ['Lemon Verbena', 'Iris'], middle: ['Violet Leaves', 'Clary Sage'], base: ['Sandalwood', 'Ambergris', 'Musk'] },
  },
  {
    name: 'Guerlain Aqua Allegoria Mandarine Basilic', slug: 'guerlain-mandarine-basilic', brand: 'guerlain',
    description: 'A joyful citrus fragrance that pairs mandarin zest with aromatic basil for a sunny, carefree spirit.',
    price: 85.00, gender: 'unisex', concentration: 'Eau de Toilette', volume_ml: 125,
    image_url: '/api/images/guerlain-mandarine.png',
    categories: ['fresh'],
    notes: { top: ['Mandarin', 'Basil'], middle: ['Green Tea', 'Tarragon'], base: ['White Musk', 'Amber'] },
  },
  {
    name: "YSL La Nuit de L'Homme", slug: 'ysl-la-nuit-de-lhomme', brand: 'ysl',
    description: 'A bold and distinguished fresh spicy fragrance. Cardamom freshness intertwines with an elegant, sensual lavender base.',
    price: 95.00, gender: 'male', concentration: 'Eau de Toilette', volume_ml: 100,
    image_url: '/api/images/ysl-la-nuit.png',
    categories: ['oriental', 'aromatic'],
    notes: { top: ['Cardamom', 'Bergamot', 'Lavender'], middle: ['Cedar', 'Cumin', 'Iris'], base: ['Vetiver', 'Tonka Bean', 'Coumarin'] },
  },
  {
    name: 'Jo Malone Wood Sage & Sea Salt', slug: 'jo-malone-wood-sage-sea-salt', brand: 'jo-malone',
    description: 'Escape the everyday along a windswept shore. Waves break on the white sand. Mineral-rich sea salt mingles with sage.',
    price: 75.00, gender: 'unisex', concentration: 'Cologne', volume_ml: 100,
    image_url: '/api/images/jm-wood-sage.png',
    categories: ['woody', 'fresh'],
    notes: { top: ['Ambrette Seeds', 'Sea Salt'], middle: ['Sage'], base: ['Driftwood', 'Musk'] },
  },
  {
    name: 'Chanel Coco Mademoiselle', slug: 'chanel-coco-mademoiselle', brand: 'chanel',
    description: 'An irresistibly fresh and elegant oriental fragrance. A spirited and voluptuous scent for an irrepressible young woman.',
    price: 140.00, gender: 'female', concentration: 'Eau de Parfum', volume_ml: 100,
    image_url: '/api/images/chanel-coco-mademoiselle.png',
    categories: ['oriental', 'floral'],
    notes: { top: ['Orange', 'Mandarin', 'Bergamot'], middle: ['Rose', 'Jasmine', 'Lychee'], base: ['Patchouli', 'Vetiver', 'Vanilla', 'White Musk'] },
  },
  {
    name: 'Dior Homme Intense', slug: 'dior-homme-intense', brand: 'dior',
    description: 'A bold and refined fragrance with the irresistible allure of iris elevated by woody and amber notes.',
    price: 115.00, gender: 'male', concentration: 'Eau de Parfum', volume_ml: 100,
    image_url: '/api/images/dior-homme-intense.png',
    categories: ['woody', 'floral'],
    notes: { top: ['Lavender', 'Pear'], middle: ['Iris', 'Violet', 'Rose'], base: ['Cedar', 'Vetiver', 'Leather'] },
  },
  {
    name: 'Tom Ford Lost Cherry', slug: 'tom-ford-lost-cherry', brand: 'tom-ford',
    description: 'A full-bodied fragrance of exotic cherry combined with roasted tonka, sandalwood, and sweet almond.',
    price: 350.00, gender: 'unisex', concentration: 'Eau de Parfum', volume_ml: 50,
    image_url: '/api/images/tf-lost-cherry.png',
    categories: ['gourmand', 'oriental'],
    notes: { top: ['Black Cherry', 'Cherry Liqueur', 'Bitter Almond'], middle: ['Turkish Rose', 'Jasmine Sambac'], base: ['Tonka Bean', 'Sandalwood', 'Peru Balsam', 'Vanilla'] },
  },
  {
    name: 'Guerlain Mon Guerlain', slug: 'guerlain-mon-guerlain', brand: 'guerlain',
    description: "A modern, sensual fragrance that pays tribute to today's woman. Fresh lavender and vanilla create an addictive trail.",
    price: 95.00, gender: 'female', concentration: 'Eau de Parfum', volume_ml: 100,
    image_url: '/api/images/guerlain-mon.png',
    categories: ['oriental', 'floral'],
    notes: { top: ['Lavender', 'Bergamot'], middle: ['Iris', 'Jasmine', 'Rose'], base: ['Vanilla', 'Sandalwood', 'Coumarin'] },
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    Brand.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  const brandDocs = await Brand.insertMany(brands);
  const brandMap = {};
  for (const b of brandDocs) brandMap[b.slug] = b._id;
  console.log(`  ${brands.length} brands seeded`);

  const catDocs = await Category.insertMany(categories);
  const catMap = {};
  for (const c of catDocs) catMap[c.slug] = c._id;
  console.log(`  ${categories.length} categories seeded`);

  for (const p of products) {
    await Product.create({
      name: p.name,
      slug: p.slug,
      brand: brandMap[p.brand],
      description: p.description,
      price: p.price,
      gender: p.gender,
      concentration: p.concentration,
      volume_ml: p.volume_ml,
      image_url: p.image_url,
      notes: p.notes,
      categories: p.categories.map(s => catMap[s]).filter(Boolean),
    });
  }
  console.log(`  ${products.length} products seeded`);

  console.log('Seeding complete!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
