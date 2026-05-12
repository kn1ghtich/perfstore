const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  country: { type: String },
  description: { type: String },
  logo_url: { type: String },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Brand', brandSchema);
