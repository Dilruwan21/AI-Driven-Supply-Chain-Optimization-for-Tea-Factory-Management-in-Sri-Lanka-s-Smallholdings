







const mongoose = require('mongoose');

const distributionSchema = new mongoose.Schema({
  stockId: { type: String, required: true },
  distributionType: { type: String, enum: ['local', 'export'], required: true },
  kgDistributed: { type: Number, required: true },
  pricePerKg: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  timestamp: { type: Date, required: true },
  centerName: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Distribution', distributionSchema);