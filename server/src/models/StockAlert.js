const mongoose = require('mongoose');
const stockAlertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  notified: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });
stockAlertSchema.index({ user: 1, product: 1 }, { unique: true });
module.exports = mongoose.model('StockAlert', stockAlertSchema);
