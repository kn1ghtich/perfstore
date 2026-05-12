const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema(
  {
    tag:            { type: String, default: '' },
    badge:          { type: String, default: '' },
    title:          { type: String, required: true },
    desc:           { type: String, default: '' },
    link:           { type: String, default: '/' },
    external:       { type: Boolean, default: false },
    gradient:       { type: String, default: 'linear-gradient(135deg, #0a0a0a 0%, #1a1208 50%, #0d0a00 100%)' },
    accent:         { type: String, default: '#C9A84C' },
    emoji:          { type: String, default: '' },
    image_filename: { type: String, default: null },
    sort_order:     { type: Number, default: 0 },
    active:         { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

slideSchema.virtual('id').get(function () { return this._id.toString(); });
slideSchema.virtual('image_url').get(function () {
  return this.image_filename ? `/api/images/${this.image_filename}` : null;
});

module.exports = mongoose.model('Slide', slideSchema);
