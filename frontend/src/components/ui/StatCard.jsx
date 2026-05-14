function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = '#7c3aed',
  trend
}) {
  return (
    <div style={{
      ...styles.card,
      borderColor: `${color}30`
    }}>
      {/* Icon */}
      <div style={{
        ...styles.iconBox,
        background: `${color}15`,
        color: color
      }}>
        {icon}
      </div>

      {/* Content */}
      <div style={styles.content}>
        <p style={styles.title}>{title}</p>
        <p style={{ ...styles.value, color }}>{value}</p>
        {subtitle && (
          <p style={styles.subtitle}>{subtitle}</p>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div style={{
          ...styles.trend,
          color: trend > 0 ? '#ef4444' : '#22c55e',
          background: trend > 0
            ? 'rgba(239,68,68,0.1)'
            : 'rgba(34,197,94,0.1)'
        }}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}

const styles = {
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid',
    borderRadius: '14px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'hidden'
  },
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    flexShrink: 0
  },
  content: {
    flex: 1
  },
  title: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  value: {
    margin: '4px 0',
    fontSize: '24px',
    fontWeight: '700'
  },
  subtitle: {
    margin: 0,
    fontSize: '12px',
    color: '#475569'
  },
  trend: {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    position: 'absolute',
    top: '12px',
    right: '12px'
  }
}

export default StatCard