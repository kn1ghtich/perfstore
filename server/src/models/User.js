const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  first_name: { type: String, trim: true, default: '' },
  last_name: { type: String, trim: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  city: { type: String, trim: true, default: '' },
  delivery_address: { type: String, trim: true, default: '' },
  payment_method: { type: String, enum: ['card', 'cash', 'bank_transfer', ''], default: '' },
  avatar: { type: String, default: '' },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('User', userSchema);
