const mongoose = require('mongoose');
const env = require('./env');

// Stale indexes that no longer exist in the schema but may remain in MongoDB
const STALE_INDEXES = {
  users: ['login_1', 'username_1', 'phone_1'],
};

async function dropStaleIndexes() {
  for (const [collection, indexes] of Object.entries(STALE_INDEXES)) {
    const col = mongoose.connection.collection(collection);
    for (const idx of indexes) {
      try {
        await col.dropIndex(idx);
        console.log(`[mongo] Dropped stale index: ${collection}.${idx}`);
      } catch (_) {
        // Index doesn't exist — that's fine, ignore
      }
    }
  }
}

async function connectMongo() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('MongoDB connected');
    await dropStaleIndexes();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectMongo;
