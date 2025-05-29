// const mongoose = require('mongoose');

// const predictionSchema = new mongoose.Schema({
//   owner: {
//     type: String,
//     required: true,
//     index: true // Add index for faster queries
//   },
//   month: {
//     type: String,
//     required: true,
//     match: /^\d{4}-\d{2}$/ // Validate format YYYY-MM
//   },
//   production: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   earnings: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   confidence: {
//     type: String,
//     enum: ['Low', 'Medium', 'High', 'Unavailable'],
//     default: 'Unavailable'
//   },
//   history_months: {
//     type: Number,
//     min: 0
//   },
//   timestamp: {
//     type: Date,
//     default: Date.now,
//     index: true
//   },
//   version: {
//     type: Number,
//     default: 1
//   },
//   model_version: {
//     type: String,
//     required: true,
//     default: '1.0.0'
//   },
//   training_date: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('Prediction', predictionSchema);


// const mongoose = require('mongoose');

// const predictionSchema = new mongoose.Schema({
//   owner: {
//     type: String,
//     required: true,
//     index: true
//   },
//   month: {
//     type: String,
//     required: true,
//     match: /^\d{4}-\d{2}$/ // Validate format YYYY-MM
//   },
//   production: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   earnings: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   confidence: {
//     type: String,
//     enum: ['Low', 'Medium', 'High', 'Unavailable'],
//     default: 'Unavailable'
//   },
//   history_months: {
//     type: Number,
//     min: 0
//   },
//   timestamp: {
//     type: Date,
//     default: Date.now,
//     index: true
//   },
//   version: {
//     type: Number,
//     default: 1
//   }
// }, {
//   toObject: { virtuals: true },
//   toJSON: { virtuals: true }
// });

// // Add virtual for formatted date
// predictionSchema.virtual('month_formatted').get(function() {
//   if (!this.month) return '';
//   const [year, month] = this.month.split('-');
//   const date = new Date(year, month - 1);
//   return date.toLocaleString('default', {
//     month: 'long',
//     year: 'numeric'
//   });
// });

// // Add index for frequently queried fields
// predictionSchema.index({ owner: 1, month: 1 });
// predictionSchema.index({ timestamp: -1 });

// module.exports = mongoose.model('Prediction', predictionSchema);


const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true,
    index: true
  },
  month: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}$/
  },
  production: {
    type: Number,
    required: true,
    min: 0
  },
  earnings: {
    type: Number,
    required: true,
    min: 0
  },
  confidence: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Unavailable'],
    default: 'Unavailable'
  },
  history_months: {
    type: Number,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('Prediction', predictionSchema);