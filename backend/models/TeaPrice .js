// models/TeaPrice.js
const mongoose = require('mongoose');

const teaPriceSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true
  },
  updatedBy: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('TeaPrice', teaPriceSchema);