const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id: { type: String, required: true },
  name: { type: String, required: true },
  brand_name: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image_url: { type: String },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  items: { type: [orderItemSchema], required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  contact: {
    name: { type: String },
    phone: { type: String },
    email: { type: String },
  },
  city: { type: String },
  delivery_address: { type: String },
  payment_method: { type: String, enum: ['card', 'cash', 'bank_transfer', ''], default: '' },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

orderSchema.index({ user: 1, created_at: -1 });

module.exports = mongoose.model('Order', orderSchema);
