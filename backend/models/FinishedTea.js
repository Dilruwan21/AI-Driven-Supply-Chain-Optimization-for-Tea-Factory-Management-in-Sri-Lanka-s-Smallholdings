

const mongoose = require('mongoose');
const FinishedTeaSchema = new mongoose.Schema({
  stockId: { type: String, required: true, unique: true },
  kgPerStock: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  kgProduced: { type: Number, required: true },
  rawTeaUsed: { type: Number, required: true },
  wastage: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('FinishedTea', FinishedTeaSchema);

