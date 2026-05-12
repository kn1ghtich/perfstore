const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '..', '.env') });

const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/perfstore';
const email = process.argv[2];

if (!email) {
  console.error('Использование: node src/db/make-admin.js <email>');
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGO_URI);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: 'admin' },
    { new: true }
  );
  if (!user) {
    console.error(`Пользователь не найден: ${email}`);
    process.exit(1);
  }
  console.log(`✓ ${user.email} теперь администратор`);
  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });
