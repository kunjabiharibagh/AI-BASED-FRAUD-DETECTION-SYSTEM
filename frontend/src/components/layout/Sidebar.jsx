import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Navigation items
const navItems = [
  {
    icon: '🏠',
    label: 'Dashboard',
    path: '/dashboard'
  },
  {
    icon: '💳',
    label: 'New Transaction',
    path: '/new-transaction'
  },
  {
    icon: '📋',
    label: 'History',
    path: '/transactions'
  },
  {
    icon: '📊',
    label: 'Analytics',
    path: '/analytics'
  },
  {
    icon: '🚨',
    label: 'Alerts',
    path: '/alerts'
  }
]

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={styles.sidebar}>

      {/* Logo */}
      <div style={styles.logoSection}>
        <div style={styles.logoBox}>🛡️</div>
        <div>
          <p style={styles.logoTitle}>FraudGuard AI</p>
          <p style={styles.logoSubtitle}>AI Based Fraud Detection</p>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Nav Items */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navItem,
                background: isActive
                  ? 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(109,40,217,0.2))'
                  : 'transparent',
                borderLeft: isActive
                  ? '3px solid #7c3aed'
                  : '3px solid transparent',
                color: isActive ? '#c4b5fd' : '#64748b'
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
              {/* Active dot */}
              {isActive && (
                <div style={styles.activeDot} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div style={styles.bottomSection}>
        <div style={styles.divider} />

        {/* User Info */}
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={styles.userDetails}>
            <p style={styles.userName}>{user?.name}</p>
            <p style={styles.userEmail}>{user?.email}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={styles.logoutBtn}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

const styles = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: '#0f172a',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 20px 20px'
  },
  logoBox: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg,#7c3aed,#ef4444)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    boxShadow: '0 0 20px rgba(124,58,237,0.3)',
    flexShrink: 0
  },
  logoTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '700',
    background: 'linear-gradient(135deg,#c4b5fd,#fca5a5)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  logoSubtitle: {
    margin: 0,
    fontSize: '11px',
    color: '#475569'
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.06)',
    margin: '0 20px 16px'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 12px',
    flex: 1
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    textAlign: 'left',
    position: 'relative',
    width: '100%'
  },
  navIcon: {
    fontSize: '18px',
    flexShrink: 0
  },
  navLabel: {
    flex: 1
  },
  activeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#7c3aed',
    boxShadow: '0 0 6px #7c3aed'
  },
  bottomSection: {
    padding: '0'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px'
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    flexShrink: 0
  },
  userDetails: {
    overflow: 'hidden'
  },
  userName: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '600',
    color: '#e2e8f0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  userEmail: {
    margin: 0,
    fontSize: '11px',
    color: '#475569',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    background: 'rgba(239,68,68,0.08)',
    border: 'none',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    color: '#f87171',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    width: '100%',
    transition: 'all 0.2s'
  }
}

export default Sidebar