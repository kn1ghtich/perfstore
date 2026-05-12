const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['promotion', 'restock', 'new_product', 'info'], default: 'info' },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  link: { type: String, default: '' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });
module.exports = mongoose.model('Notification', notificationSchema);
