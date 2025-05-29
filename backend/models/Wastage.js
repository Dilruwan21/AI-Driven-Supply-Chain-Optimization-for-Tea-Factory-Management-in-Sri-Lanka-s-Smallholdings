const mongoose = require('mongoose');

const WastageSchema = new mongoose.Schema({
  kgs: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    required: true,
    enum: ['spoilage', 'processing_error', 'quality_rejection', 'processing_wastage', 'other']
  },
  date: {
    type: Date,
    default: Date.now
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Wastage', WastageSchema);