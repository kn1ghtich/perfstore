/**
 * Seed script — populates the Slides collection with the 4 default carousel slides.
 * Run: node scripts/seedSlides.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Slide = require('../src/models/Slide');

const SLIDES = [
  {
    tag:       'Новая коллекция',
    badge:     'Хит сезона',
    title:     'Весна 2025: ароматы цветущих садов',
    desc:      'Свежие цветочные композиции, вдохновлённые садами Прованса и японскими сакурами.',
    link:      '/catalog?categories=floral',
    external:  false,
    gradient:  'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 40%, #1a2a1a 100%)',
    accent:    '#C9A84C',
    emoji:     '🌸',
    sort_order: 0,
    active:    true,
  },
  {
    tag:       'Эксклюзив',
    badge:     'Лимит',
    title:     'Tom Ford: лимитированная серия Noir Extrême',
    desc:      'Насыщенные восточные ноты амбры и чёрной орхидеи. Только 50 флаконов в наличии.',
    link:      '/catalog?brands=tom-ford',
    external:  false,
    gradient:  'linear-gradient(135deg, #0a0a0a 0%, #1a1208 50%, #0d0a00 100%)',
    accent:    '#C9A84C',
    emoji:     '🖤',
    sort_order: 1,
    active:    true,
  },
  {
    tag:       'Гид по ароматам',
    badge:     'Статья',
    title:     'Как выбрать свой аромат: пирамида нот',
    desc:      'Разбираемся в верхних, серединных и базовых нотах, чтобы найти парфюм, который останется с вами.',
    link:      'https://stockmann.ru/fashion-blog/kak-vybrat-duhi/',
    external:  true,
    gradient:  'linear-gradient(135deg, #0a1628 0%, #0d2040 45%, #1a0a0a 100%)',
    accent:    '#7eb8e8',
    emoji:     '✨',
    sort_order: 2,
    active:    true,
  },
  {
    tag:       'Подарки',
    badge:     'Акция',
    title:     'Подарочные наборы для близких',
    desc:      'Элегантные сеты с миниатюрами мировых брендов. Идеальный выбор для особых случаев.',
    link:      '/catalog',
    external:  false,
    gradient:  'linear-gradient(135deg, #1a0a0e 0%, #2d0a14 45%, #0a0a1e 100%)',
    accent:    '#e87eb8',
    emoji:     '🎁',
    sort_order: 3,
    active:    true,
  },
];

async function seed() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/perfstore';
    await mongoose.connect(uri);
    console.log('MongoDB connected');

    // Insert only slides whose title doesn't already exist
    const existingTitles = (await Slide.find().select('title').lean()).map((s) => s.title);
    const toInsert = SLIDES.filter((s) => !existingTitles.includes(s.title));

    if (toInsert.length === 0) {
      console.log('Все слайды уже существуют в БД. Ничего не добавлено.');
      process.exit(0);
    }

    await Slide.insertMany(toInsert);
    console.log(`✅ Добавлено ${toInsert.length} слайд(ов):`)
    toInsert.forEach((s) => console.log(`   • ${s.title}`));
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    process.exit(1);
  }
}

seed();
