const mongoose = require('mongoose');

const priceSettingSchema = new mongoose.Schema({
  localPrice: { type: Number, required: true, default: 500 },
  exportPrice: { type: Number, required: true, default: 800 },
}, { timestamps: true });

module.exports = mongoose.model('PriceSetting', priceSettingSchema);