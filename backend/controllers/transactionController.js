const Transaction = require('../models/Transaction')
const axios = require('axios')

// ─── SUBMIT TRANSACTION ───────────────────────────
const submitTransaction = async (req, res) => {
  try {
    console.log('Transaction submitted ✅')

    const {
      amount,
      transactionType,
      merchantCategory,
      description,
      v1, v2, v3, v4, v5, v6, v7,
      v8, v9, v10, v11, v12, v13, v14,
      v15, v16, v17, v18, v19, v20,
      v21, v22, v23, v24, v25, v26,
      v27, v28
    } = req.body

    // Validate required fields
    if (!amount || !transactionType || !merchantCategory) {
      return res.status(400).json({
        success: false,
        error: 'Amount, transaction type and merchant category are required'
      })
    }

    console.log('Calling ML service...')

    // Call Python ML Service for prediction
    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/api/predict`,
      {
        amount: parseFloat(amount),
        transaction_type: transactionType,
        merchant_category: merchantCategory,
        hour_of_day: new Date().getHours(),
        day_of_week: new Date().getDay(),
        v1: v1 || 0, v2: v2 || 0, v3: v3 || 0,
        v4: v4 || 0, v5: v5 || 0, v6: v6 || 0,
        v7: v7 || 0, v8: v8 || 0, v9: v9 || 0,
        v10: v10 || 0, v11: v11 || 0, v12: v12 || 0,
        v13: v13 || 0, v14: v14 || 0, v15: v15 || 0,
        v16: v16 || 0, v17: v17 || 0, v18: v18 || 0,
        v19: v19 || 0, v20: v20 || 0, v21: v21 || 0,
        v22: v22 || 0, v23: v23 || 0, v24: v24 || 0,
        v25: v25 || 0, v26: v26 || 0, v27: v27 || 0,
        v28: v28 || 0
      }
    )

    console.log('ML prediction received ✅')

    const prediction = mlResponse.data.prediction

    // Save transaction to MongoDB
    const transaction = await Transaction.create({
      user: req.user._id,
      amount: parseFloat(amount),
      transactionType,
      merchantCategory,
      description: description || '',
      isFraud: prediction.is_fraud,
      fraudProbability: prediction.fraud_probability,
      riskLevel: prediction.risk_level,
      mlStatus: prediction.status,
      mlMessage: prediction.message
    })

    console.log('Transaction saved ✅:', transaction._id)

    res.status(201).json({
      success: true,
      data: {
        transaction: {
          id: transaction._id,
          amount: transaction.amount,
          transactionType: transaction.transactionType,
          merchantCategory: transaction.merchantCategory,
          description: transaction.description,
          status: transaction.status,
          createdAt: transaction.createdAt
        },
        prediction: {
          isFraud: prediction.is_fraud,
          fraudProbability: prediction.fraud_probability,
          riskLevel: prediction.risk_level,
          message: prediction.message
        }
      }
    })

  } catch (error) {
    console.log('❌ Transaction error:', error.message)

    // ML service not running
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'ML service unavailable. Please try again.'
      })
    }

    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// ─── GET ALL TRANSACTIONS ─────────────────────────
const getTransactions = async (req, res) => {
  try {
    // Get filter from query params
    const { status, riskLevel, page = 1, limit = 10 } = req.query

    // Build filter
    const filter = { user: req.user._id }
    if (status) filter.status = status
    if (riskLevel) filter.riskLevel = riskLevel

    // Get total count
    const total = await Transaction.countDocuments(filter)

    // Get transactions with pagination
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// ─── GET SINGLE TRANSACTION ───────────────────────
const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      })
    }

    res.json({
      success: true,
      data: transaction
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

module.exports = {
  submitTransaction,
  getTransactions,
  getTransaction
}