function RiskBadge({ risk }) {
  const config = {
    safe: {
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.1)',
      border: 'rgba(34,197,94,0.3)',
      label: '✅ Safe'
    },
    low: {
      color: '#84cc16',
      bg: 'rgba(132,204,22,0.1)',
      border: 'rgba(132,204,22,0.3)',
      label: '🟢 Low'
    },
    medium: {
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
      border: 'rgba(245,158,11,0.3)',
      label: '🟡 Medium'
    },
    high: {
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.1)',
      border: 'rgba(239,68,68,0.3)',
      label: '🔴 High'
    },
    critical: {
      color: '#dc2626',
      bg: 'rgba(220,38,38,0.15)',
      border: 'rgba(220,38,38,0.4)',
      label: '🚨 Critical'
    }
  }

  const c = config[risk] || config.safe

  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '700',
      color: c.color,
      background: c.bg,
      border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap'
    }}>
      {c.label}
    </span>
  )
}

export default RiskBadge