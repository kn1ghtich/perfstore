const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 0, min: 0 },
}, { _id: false });

const storeSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  description:   { type: String, default: '' },
  address:       { type: String, default: '' },
  phone:         { type: String, default: '' },
  working_hours: { type: String, default: '' },
  image_filename:{ type: String, default: null },
  sort_order:    { type: Number, default: 0 },
  inventory:     { type: [inventoryItemSchema], default: [] },
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true },
});

storeSchema.virtual('image_url').get(function () {
  return this.image_filename ? `/api/images/${this.image_filename}` : null;
});

module.exports = mongoose.model('Store', storeSchema);
