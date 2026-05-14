const Transaction = require('../models/Transaction')
const axios = require('axios')

// ─── GET DASHBOARD STATS ──────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id

    // Get all transactions for user
    const total = await Transaction.countDocuments({ user: userId })
    const fraudCount = await Transaction.countDocuments({
      user: userId,
      isFraud: true
    })
    const safeCount = await Transaction.countDocuments({
      user: userId,
      isFraud: false
    })

    // Get total amount
    const amountResult = await Transaction.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const totalAmount = amountResult[0]?.total || 0

    // Get fraud amount
    const fraudAmountResult = await Transaction.aggregate([
      { $match: { user: userId, isFraud: true } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const fraudAmount = fraudAmountResult[0]?.total || 0

    // Accuracy rate
    const accuracyRate = total > 0
      ? ((safeCount / total) * 100).toFixed(2)
      : 0

    // Recent transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)

    // Risk distribution
    const riskDistribution = await Transaction.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ])

    // Daily fraud trend (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dailyTrend = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            isFraud: '$isFraud'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ])

    // Get ML model stats
    let mlStats = null
    try {
      const mlResponse = await axios.get(
        `${process.env.ML_SERVICE_URL}/api/stats`
      )
      mlStats = mlResponse.data.stats
    } catch (err) {
      console.log('ML service not available')
    }

    res.json({
      success: true,
      data: {
        stats: {
          total,
          fraudCount,
          safeCount,
          totalAmount: totalAmount.toFixed(2),
          fraudAmount: fraudAmount.toFixed(2),
          accuracyRate
        },
        recentTransactions,
        riskDistribution,
        dailyTrend,
        mlStats
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

module.exports = { getDashboardStats }