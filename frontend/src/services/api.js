import axios from 'axios'

// Base API instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
})

// Auto add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Auth ──────────────────────────────────────────
export const registerUser = (data) =>
  API.post('/auth/register', data)

export const loginUser = (data) =>
  API.post('/auth/login', data)

export const getProfile = () =>
  API.get('/auth/profile')

// ─── Transactions ──────────────────────────────────
export const submitTransaction = (data) =>
  API.post('/transactions', data)

export const getTransactions = (params) =>
  API.get('/transactions', { params })

export const getTransaction = (id) =>
  API.get(`/transactions/${id}`)

// ─── Dashboard ─────────────────────────────────────
export const getDashboardStats = () =>
  API.get('/dashboard')