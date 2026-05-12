const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Category', categorySchema);
