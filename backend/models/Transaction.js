const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({

  // Which user submitted this transaction
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Transaction Details
  amount: {
    type: Number,
    required: true
  },
  transactionType: {
    type: String,
    enum: ['online', 'pos', 'atm', 'transfer'],
    required: true
  },
  merchantCategory: {
    type: String,
    enum: ['retail', 'food', 'travel', 'entertainment', 'other'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },

  // ML Prediction Results
  isFraud: {
    type: Boolean,
    required: true
  },
  fraudProbability: {
    type: Number,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['safe', 'low', 'medium', 'high', 'critical'],
    required: true
  },
  mlStatus: {
    type: String,
    enum: ['fraud', 'normal'],
    required: true
  },
  mlMessage: {
    type: String,
    required: true
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'blocked'],
    default: function() {
      return this.isFraud ? 'blocked' : 'approved'
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Transaction', transactionSchema)