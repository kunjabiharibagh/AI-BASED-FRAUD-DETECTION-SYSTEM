const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { register, login, getProfile } = require('../controllers/authController')
const { protect } = require('../middleware/auth')

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]

const loginRules = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
]

router.post('/register', registerRules, register)
router.post('/login', loginRules, login)
router.get('/profile', protect, getProfile)

module.exports = router