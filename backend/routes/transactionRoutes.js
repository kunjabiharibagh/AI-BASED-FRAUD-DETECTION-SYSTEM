const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  submitTransaction,
  getTransactions,
  getTransaction
} = require('../controllers/transactionController')

// POST /api/transactions - submit new transaction
router.post('/', protect, submitTransaction)

// GET /api/transactions - get all transactions
router.get('/', protect, getTransactions)

// GET /api/transactions/:id - get single transaction
router.get('/:id', protect, getTransaction)

module.exports = router