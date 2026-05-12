const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
  top: { type: [String], default: [] },
  middle: { type: [String], default: [] },
  base: { type: [String], default: [] },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  description: { type: String },
  price: { type: Number, required: true },
  original_price: { type: Number, default: null },
  gender: { type: String, enum: ['male', 'female', 'unisex'], required: true },
  concentration: { type: String },
  volume_ml: { type: Number },
  image_url: { type: String },
  images:    { type: [String], default: [] },
  in_stock: { type: Boolean, default: true },
  quantity: { type: Number, default: 0, min: 0 },
  notes: { type: notesSchema, default: () => ({ top: [], middle: [], base: [] }) },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

productSchema.index({ brand: 1 });
productSchema.index({ gender: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
