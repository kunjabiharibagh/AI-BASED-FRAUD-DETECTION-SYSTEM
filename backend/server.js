require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')

// Connect MongoDB
connectDB()

const app = express()

// ─── Security Middleware ───────────────────────────
app.use(helmet())

// CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.CLIENT_URL
  ],
  credentials: true
}))

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
})
app.use(limiter)

// Body Parser
app.use(express.json())

// ─── Health Check ─────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'FraudGuard AI API running ✅' })
})

// ─── Routes ───────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/transactions', require('./routes/transactionRoutes'))
app.use('/api/dashboard', require('./routes/dashboardRoutes'))

// ─── Start Server ─────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})