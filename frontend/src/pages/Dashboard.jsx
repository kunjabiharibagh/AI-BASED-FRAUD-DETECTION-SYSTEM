import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import StatCard from '../components/ui/StatCard'
import RiskBadge from '../components/ui/RiskBadge'
import { getDashboardStats } from '../services/api'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await getDashboardStats()
      setStats(res.data.data)
    } catch (err) {
      console.log('Stats error:', err)
    }
    setLoading(false)
  }

  // Format daily trend for chart
  const formatTrendData = () => {
    if (!stats?.dailyTrend) return []

    const dateMap = {}
    stats.dailyTrend.forEach(item => {
      const date = item._id.date
      if (!dateMap[date]) {
        dateMap[date] = { date, fraud: 0, normal: 0 }
      }
      if (item._id.isFraud) {
        dateMap[date].fraud = item.count
      } else {
        dateMap[date].normal = item.count
      }
    })

    return Object.values(dateMap).slice(-7)
  }

  // Format risk distribution for pie chart
  const formatRiskData = () => {
    if (!stats?.riskDistribution) return []

    const colors = {
      safe: '#22c55e',
      low: '#84cc16',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    }

    return stats.riskDistribution.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
      color: colors[item._id] || '#64748b'
    }))
  }

  if (loading) {
    return (
      <PageLayout title="Dashboard" subtitle="AI Fraud Detection Overview">
        <div style={styles.loadingState}>
          <div style={styles.loadingSpinner} />
          <p style={styles.loadingText}>Loading dashboard...</p>
        </div>
      </PageLayout>
    )
  }

  const trendData = formatTrendData()
  const riskData = formatRiskData()

  return (
    <PageLayout
      title="Dashboard"
      subtitle="AI Fraud Detection Overview"
    >
      {/* ─── Stat Cards ─────────────────────────── */}
      <div style={styles.statsGrid}>
        <StatCard
          title="Total Transactions"
          value={stats?.stats?.total || 0}
          subtitle="All time"
          icon="💳"
          color="#7c3aed"
        />
        <StatCard
          title="Fraud Detected"
          value={stats?.stats?.fraudCount || 0}
          subtitle={`$${stats?.stats?.fraudAmount || '0.00'} blocked`}
          icon="🚨"
          color="#ef4444"
        />
        <StatCard
          title="Safe Transactions"
          value={stats?.stats?.safeCount || 0}
          subtitle="Verified normal"
          icon="✅"
          color="#22c55e"
        />
        <StatCard
          title="Detection Rate"
          value={`${stats?.stats?.accuracyRate || 0}%`}
          subtitle="AI accuracy"
          icon="🎯"
          color="#f59e0b"
        />
      </div>

      {/* ─── Charts Row ─────────────────────────── */}
      <div style={styles.chartsRow}>

        {/* Line Chart - Daily Trend */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>📈 Fraud Trend</h3>
            <span style={styles.chartSubtitle}>Last 7 days</span>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1e1e2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="fraud"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                  name="Fraud"
                />
                <Line
                  type="monotone"
                  dataKey="normal"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 4 }}
                  name="Normal"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.emptyChart}>
              <p>📊 No trend data yet</p>
              <p style={{ fontSize: '12px', color: '#475569' }}>
                Submit transactions to see trends
              </p>
            </div>
          )}
        </div>

        {/* Pie Chart - Risk Distribution */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>🎯 Risk Distribution</h3>
            <span style={styles.chartSubtitle}>By risk level</span>
          </div>
          {riskData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1e1e2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.emptyChart}>
              <p>🎯 No risk data yet</p>
              <p style={{ fontSize: '12px', color: '#475569' }}>
                Submit transactions to see distribution
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── ML Model Stats ──────────────────────── */}
      {stats?.mlStats && (
        <div style={styles.mlStatsCard}>
          <h3 style={styles.sectionTitle}>
            🤖 ML Model Performance
          </h3>
          <div style={styles.mlStatsGrid}>
            {[
              {
                label: 'Accuracy',
                value: `${stats.mlStats.accuracy}%`,
                color: '#22c55e'
              },
              {
                label: 'Precision',
                value: `${stats.mlStats.precision}%`,
                color: '#7c3aed'
              },
              {
                label: 'Recall',
                value: `${stats.mlStats.recall}%`,
                color: '#f59e0b'
              },
              {
                label: 'F1 Score',
                value: `${stats.mlStats.f1_score}%`,
                color: '#3b82f6'
              }
            ].map((metric) => (
              <div key={metric.label} style={styles.mlMetric}>
                <p style={{
                  ...styles.mlValue,
                  color: metric.color
                }}>
                  {metric.value}
                </p>
                <p style={styles.mlLabel}>{metric.label}</p>
                {/* Progress bar */}
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: metric.value,
                    background: metric.color
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Recent Transactions ─────────────────── */}
      <div style={styles.recentCard}>
        <div style={styles.recentHeader}>
          <h3 style={styles.sectionTitle}>
            🕐 Recent Transactions
          </h3>
          <button
            onClick={() => navigate('/transactions')}
            style={styles.viewAllBtn}
          >
            View All →
          </button>
        </div>

        {stats?.recentTransactions?.length > 0 ? (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[
                    'Amount', 'Type',
                    'Category', 'Risk',
                    'Status', 'Time'
                  ].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.map((tx) => (
                  <tr key={tx._id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={{
                        fontWeight: '700',
                        color: tx.isFraud ? '#ef4444' : '#22c55e'
                      }}>
                        ${tx.amount.toFixed(2)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.typeBadge}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: '#94a3b8' }}>
                        {tx.merchantCategory}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <RiskBadge risk={tx.riskLevel} />
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: tx.status === 'blocked'
                          ? 'rgba(239,68,68,0.1)'
                          : 'rgba(34,197,94,0.1)',
                        color: tx.status === 'blocked'
                          ? '#ef4444'
                          : '#22c55e'
                      }}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: '#475569', fontSize: '12px' }}>
                        {new Date(tx.createdAt).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>💳</p>
            <p style={styles.emptyTitle}>No transactions yet</p>
            <p style={styles.emptySubtitle}>
              Submit your first transaction for fraud analysis
            </p>
            <button
              onClick={() => navigate('/new-transaction')}
              style={styles.newTxBtn}
            >
              + New Transaction
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

// ─── Styles ────────────────────────────────────────
const styles = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '20px'
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '20px'
  },
  chartCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '14px',
    padding: '20px'
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  chartTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '700',
    color: '#e2e8f0'
  },
  chartSubtitle: {
    fontSize: '12px',
    color: '#475569'
  },
  emptyChart: {
    height: '220px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#475569',
    gap: '8px'
  },
  mlStatsCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(124,58,237,0.2)',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '20px'
  },
  mlStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginTop: '16px'
  },
  mlMetric: {
    textAlign: 'center'
  },
  mlValue: {
    margin: '0 0 4px',
    fontSize: '24px',
    fontWeight: '700'
  },
  mlLabel: {
    margin: '0 0 8px',
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600'
  },
  progressBar: {
    height: '4px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 1s ease'
  },
  recentCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '14px',
    padding: '20px'
  },
  recentHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '700',
    color: '#e2e8f0'
  },
  viewAllBtn: {
    padding: '6px 14px',
    background: 'rgba(124,58,237,0.1)',
    border: '1px solid rgba(124,58,237,0.3)',
    borderRadius: '8px',
    color: '#a78bfa',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid rgba(255,255,255,0.06)'
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    transition: 'background 0.2s'
  },
  td: {
    padding: '12px 14px',
    fontSize: '13px',
    color: '#e2e8f0'
  },
  typeBadge: {
    padding: '3px 8px',
    background: 'rgba(124,58,237,0.1)',
    border: '1px solid rgba(124,58,237,0.2)',
    borderRadius: '5px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#a78bfa'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  emptyIcon: {
    fontSize: '40px',
    margin: '0 0 12px'
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#475569',
    margin: '0 0 6px'
  },
  emptySubtitle: {
    fontSize: '13px',
    color: '#334155',
    margin: '0 0 20px'
  },
  newTxBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    gap: '16px'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(124,58,237,0.2)',
    borderTop: '3px solid #7c3aed',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  loadingText: {
    color: '#64748b',
    fontSize: '14px'
  }
}

export default Dashboard