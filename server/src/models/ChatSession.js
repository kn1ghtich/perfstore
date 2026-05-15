const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const userProfileSchema = new mongoose.Schema({
  gender:          { type: String, default: null },
  minPrice:        { type: Number, default: null },
  maxPrice:        { type: Number, default: null },
  likedCategories: { type: [String], default: [] },
  occasion:        { type: String, default: null },
}, { _id: false });

const chatSessionSchema = new mongoose.Schema({
  sessionId:   { type: String, required: true, unique: true, index: true },
  userId:      { type: String, default: null },
  messages:    [messageSchema],
  userProfile: { type: userProfileSchema, default: () => ({}) },
  metadata: {
    startedAt:     { type: Date, default: Date.now },
    lastMessageAt: { type: Date, default: Date.now },
  },
}, { timestamps: true });

chatSessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
