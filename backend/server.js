require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')

connectDB()

const app = express()

// ─── CORS ─────────────────────────────────────────
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://ai-based-fraud-detection-system-ml.vercel.app',
    process.env.CLIENT_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))

// ✅ Handle preflight - Express 5 compatible
app.options('/{*path}', cors(corsOptions))

app.use(helmet({
  crossOriginResourcePolicy: false
}))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
})
app.use(limiter)

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'FraudGuard AI API running ✅' })
})

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/transactions', require('./routes/transactionRoutes'))
app.use('/api/dashboard', require('./routes/dashboardRoutes'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})