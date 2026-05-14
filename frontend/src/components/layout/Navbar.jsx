function Navbar({ title, subtitle }) {
  const handleNewTransaction = () => {
    // Redirect to new transaction page
    window.location.href = "/new-transaction";

    // If using React Router use this instead:
    // navigate('/new-transaction')
  };

  return (
    <div style={styles.navbar}>
      {/* Left Section */}
      <div>
        <h1 style={styles.title}>{title}</h1>

        {subtitle && (
          <p style={styles.subtitle}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Section */}
      <div style={styles.rightSection}>
        
        <button
          style={styles.transactionButton}
            onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow =
            '0 6px 18px rgba(59,130,246,0.25)';
            }}
            onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0px)';
            e.target.style.boxShadow =
              '0 4px 12px rgba(37,99,235,0.12)';
          }}
          onClick={handleNewTransaction}
          >
          + New Transaction
        </button>

        {/* Live Detection */}
        <div style={styles.liveIndicator}>
          <div style={styles.liveDot} />
          <span style={styles.liveText}>
            Live Detection
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    height: '72px',
    background: 'rgba(10,10,15,0.96)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    backdropFilter: 'blur(18px)',
    position: 'sticky',
    top: 0,
    zIndex: 99
  },

  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: '0.3px'
  },

  subtitle: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '500'
  },

  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },

  transactionButton: {
    padding: '10px 18px',
    borderRadius: '14px',
    border: '1px solid rgba(59,130,246,0.25)',
    background:
      'linear-gradient(135deg, rgba(37,99,235,0.18), rgba(59,130,246,0.08))',
    color: '#60a5fa',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 4px 12px rgba(37,99,235,0.12)'
  },

  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'rgba(34,197,94,0.08)',
    border: '1px solid rgba(34,197,94,0.18)',
    borderRadius: '14px',
    backdropFilter: 'blur(12px)'
  },

  liveDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 10px #22c55e',
    animation: 'pulse 1.5s ease infinite'
  },

  liveText: {
    fontSize: '12px',
    color: '#4ade80',
    fontWeight: '600',
    letterSpacing: '0.2px'
  }
};

export default Navbar;