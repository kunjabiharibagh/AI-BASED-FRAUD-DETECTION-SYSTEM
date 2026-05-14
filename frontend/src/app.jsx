import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import NewTransaction from './pages/NewTransaction'
import Analytics from './pages/Analytics'
import Alerts from './pages/Alerts'

// Protected Route
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      color: '#a78bfa',
      fontSize: '16px'
    }}>
      Loading...
    </div>
  )

  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/transactions" element={
          <PrivateRoute><Transactions /></PrivateRoute>
        } />
        <Route path="/new-transaction" element={
          <PrivateRoute><NewTransaction /></PrivateRoute>
        } />
        <Route path="/analytics" element={
          <PrivateRoute><Analytics /></PrivateRoute>
        } />
        <Route path="/alerts" element={
          <PrivateRoute><Alerts /></PrivateRoute>
        } />

        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AuthProvider>
  )
}

export default App