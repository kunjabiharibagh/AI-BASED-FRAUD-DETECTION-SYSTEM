import { useState, useEffect } from 'react'
import PageLayout from '../components/layout/PageLayout'
import RiskBadge from '../components/ui/RiskBadge'
import { getTransactions } from '../services/api'

function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      // Get only blocked/fraud transactions
      const res = await getTransactions({
        status: 'blocked',
        limit: 50
      })
      setAlerts(res.data.data.transactions)
    } catch (err) {
      console.log('Error:', err)
    }
    setLoading(false)
  }

  // Filter alerts by risk level
  const filteredAlerts = filter === 'all'
    ? alerts
    : alerts.filter(a => a.riskLevel === filter)

  return (
    <PageLayout
      title="🚨 Alerts"
      subtitle="Flagged suspicious transactions"
    >
      {/* ─── Alert Summary ────────────────────── */}
      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryIcon}>🚨</span>
          <div>
            <p style={styles.summaryValue}>{alerts.length}</p>
            <p style={styles.summaryLabel}>Total Alerts</p>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryIcon}>🔴</span>
          <div>
            <p style={{ ...styles.summaryValue, color: '#ef4444' }}>
              {alerts.filter(a =>
                a.riskLevel === 'critical' ||
                a.riskLevel === 'high'
              ).length}
            </p>
            <p style={styles.summaryLabel}>High Risk</p>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryIcon}>💰</span>
          <div>
            <p style={{ ...styles.summaryValue, color: '#ef4444' }}>
              ${alerts.reduce((sum, a) =>
                sum + a.amount, 0
              ).toFixed(2)}
            </p>
            <p style={styles.summaryLabel}>Total Blocked</p>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryIcon}>📊</span>
          <div>
            <p style={{ ...styles.summaryValue, color: '#f59e0b' }}>
              {alerts.length > 0
                ? (alerts.reduce((sum, a) =>
                    sum + a.fraudProbability, 0
                  ) / alerts.length).toFixed(1)
                : 0}%
            </p>
            <p style={styles.summaryLabel}>Avg Fraud Score</p>
          </div>
        </div>
      </div>

      {/* ─── Risk Filter ──────────────────────── */}
      <div style={styles.filterRow}>
        {[
          { value: 'all', label: '🚨 All Alerts' },
          { value: 'critical', label: '⚠️ Critical' },
          { value: 'high', label: '🔴 High' },
          { value: 'medium', label: '🟡 Medium' }
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              ...styles.filterBtn,
              background: filter === f.value
                ? 'linear-gradient(135deg,#ef4444,#dc2626)'
                : 'rgba(255,255,255,0.04)',
              color: filter === f.value ? '#fff' : '#64748b',
              border: filter === f.value
                ? 'none'
                : '1px solid rgba(255,255,255,0.08)'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ─── Alerts List ──────────────────────── */}
      {loading ? (
        <div style={styles.loadingState}>
          <div style={styles.spinner} />
          <p style={{ color: '#64748b' }}>Loading alerts...</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ fontSize: '48px', margin: 0 }}>🎉</p>
          <p style={styles.emptyTitle}>No alerts found!</p>
          <p style={styles.emptySubtitle}>
            {filter === 'all'
              ? 'No fraudulent transactions detected'
              : `No ${filter} risk alerts`}
          </p>
        </div>
      ) : (
        <div style={styles.alertsList}>
          {filteredAlerts.map((alert, index) => (
            <div
              key={alert._id}
              style={{
                ...styles.alertCard,
                borderLeft: `4px solid ${
                  alert.riskLevel === 'critical' ? '#dc2626'
                  : alert.riskLevel === 'high' ? '#ef4444'
                  : '#f59e0b'
                }`,
                animation: `fadeIn 0.3s ease ${index * 0.05}s both`
              }}
            >
              {/* Alert Header */}
              <div style={styles.alertHeader}>
                <div style={styles.alertLeft}>
                  <span style={styles.alertIcon}>
                    {alert.riskLevel === 'critical'
                      ? '🚨'
                      : alert.riskLevel === 'high'
                      ? '⚠️'
                      : '⚡'}
                  </span>
                  <div>
                    <p style={styles.alertTitle}>
                      Fraudulent Transaction Detected
                    </p>
                    <p style={styles.alertTime}>
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div style={styles.alertRight}>
                  <RiskBadge risk={alert.riskLevel} />
                </div>
              </div>

              {/* Alert Details */}
              <div style={styles.alertDetails}>
                <div style={styles.alertDetail}>
                  <p style={styles.detailLabel}>Amount</p>
                  <p style={{
                    ...styles.detailValue,
                    color: '#ef4444'
                  }}>
                    ${alert.amount.toFixed(2)}
                  </p>
                </div>
                <div style={styles.alertDetail}>
                  <p style={styles.detailLabel}>Type</p>
                  <p style={styles.detailValue}>
                    {alert.transactionType}
                  </p>
                </div>
                <div style={styles.alertDetail}>
                  <p style={styles.detailLabel}>Category</p>
                  <p style={styles.detailValue}>
                    {alert.merchantCategory}
                  </p>
                </div>
                <div style={styles.alertDetail}>
                  <p style={styles.detailLabel}>Fraud Score</p>
                  <p style={{
                    ...styles.detailValue,
                    color: '#ef4444'
                  }}>
                    {alert.fraudProbability}%
                  </p>
                </div>
                <div style={styles.alertDetail}>
                  <p style={styles.detailLabel}>Status</p>
                  <span style={styles.blockedBadge}>
                    🔒 BLOCKED
                  </span>
                </div>
                <div style={styles.alertDetail}>
                  <p style={styles.detailLabel}>ML Message</p>
                  <p style={{
                    ...styles.detailValue,
                    fontSize: '12px',
                    color: '#94a3b8'
                  }}>
                    {alert.mlMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  )
}

const styles = {
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '16px',
    marginBottom: '20px'
  },
  summaryCard: {
    background: 'rgba(239,68,68,0.05)',
    border: '1px solid rgba(239,68,68,0.15)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  summaryIcon: {
    fontSize: '28px'
  },
  summaryValue: {
    margin: '0 0 2px',
    fontSize: '22px',
    fontWeight: '700',
    color: '#f1f5f9'
  },
  summaryLabel: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600'
  },
  filterRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
    gap: '16px'
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid rgba(239,68,68,0.2)',
    borderTop: '3px solid #ef4444',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
    gap: '12px',
    background: 'rgba(34,197,94,0.03)',
    border: '1px solid rgba(34,197,94,0.1)',
    borderRadius: '14px'
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#22c55e',
    margin: 0
  },
  emptySubtitle: {
    fontSize: '13px',
    color: '#475569',
    margin: 0
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  alertCard: {
    background: 'rgba(239,68,68,0.04)',
    border: '1px solid rgba(239,68,68,0.15)',
    borderRadius: '12px',
    padding: '16px',
    transition: 'all 0.2s'
  },
  alertHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px'
  },
  alertLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  alertIcon: {
    fontSize: '24px'
  },
  alertTitle: {
    margin: '0 0 2px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#fca5a5'
  },
  alertTime: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b'
  },
  alertRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  alertDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '12px',
    padding: '14px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px'
  },
  alertDetail: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  detailLabel: {
    margin: 0,
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase'
  },
  detailValue: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#e2e8f0'
  },
  blockedBadge: {
    padding: '3px 8px',
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '5px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#ef4444'
  }
}

export default Alerts