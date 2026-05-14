import { useState, useEffect } from 'react'
import PageLayout from '../components/layout/PageLayout'
import { getDashboardStats } from '../services/api'
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

function Analytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await getDashboardStats()
      setStats(res.data.data)
    } catch (err) {
      console.log('Error:', err)
    }
    setLoading(false)
  }

  // Format daily trend data
  const formatTrendData = () => {
    if (!stats?.dailyTrend) return []
    const dateMap = {}
    stats.dailyTrend.forEach(item => {
      const date = item._id.date
      if (!dateMap[date]) {
        dateMap[date] = { date, fraud: 0, normal: 0, total: 0 }
      }
      if (item._id.isFraud) {
        dateMap[date].fraud = item.count
      } else {
        dateMap[date].normal = item.count
      }
      dateMap[date].total += item.count
    })
    return Object.values(dateMap).slice(-7)
  }

  // Format risk distribution
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

  // Format transaction type data
  const formatTypeData = () => {
    if (!stats?.recentTransactions) return []
    const typeMap = {}
    stats.recentTransactions.forEach(tx => {
      if (!typeMap[tx.transactionType]) {
        typeMap[tx.transactionType] = { type: tx.transactionType, count: 0, fraud: 0 }
      }
      typeMap[tx.transactionType].count++
      if (tx.isFraud) typeMap[tx.transactionType].fraud++
    })
    return Object.values(typeMap)
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.tooltip}>
          <p style={styles.tooltipLabel}>{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{
              ...styles.tooltipItem,
              color: p.color
            }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <PageLayout title="Analytics" subtitle="Fraud detection insights">
        <div style={styles.loadingState}>
          <div style={styles.spinner} />
          <p style={{ color: '#64748b' }}>Loading analytics...</p>
        </div>
      </PageLayout>
    )
  }

  const trendData = formatTrendData()
  const riskData = formatRiskData()
  const typeData = formatTypeData()

  return (
    <PageLayout
      title="📊 Analytics"
      subtitle="Detailed fraud detection insights"
    >
      {/* ─── Summary Row ──────────────────────── */}
      <div style={styles.summaryRow}>
        {[
          {
            label: 'Total Transactions',
            value: stats?.stats?.total || 0,
            color: '#7c3aed',
            icon: '💳'
          },
          {
            label: 'Fraud Rate',
            value: stats?.stats?.total > 0
              ? `${((stats.stats.fraudCount / stats.stats.total) * 100).toFixed(1)}%`
              : '0%',
            color: '#ef4444',
            icon: '🚨'
          },
          {
            label: 'Safe Rate',
            value: stats?.stats?.total > 0
              ? `${((stats.stats.safeCount / stats.stats.total) * 100).toFixed(1)}%`
              : '0%',
            color: '#22c55e',
            icon: '✅'
          },
          {
            label: 'Total Amount',
            value: `$${stats?.stats?.totalAmount || '0.00'}`,
            color: '#f59e0b',
            icon: '💰'
          }
        ].map((s) => (
          <div key={s.label} style={{
            ...styles.summaryCard,
            borderColor: `${s.color}25`
          }}>
            <span style={styles.summaryIcon}>{s.icon}</span>
            <div>
              <p style={{
                ...styles.summaryValue,
                color: s.color
              }}>
                {s.value}
              </p>
              <p style={styles.summaryLabel}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Charts Grid ──────────────────────── */}
      <div style={styles.chartsGrid}>

        {/* Area Chart - Transaction Volume */}
        <div style={{ ...styles.chartCard, gridColumn: 'span 2' }}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>
              📈 Transaction Volume Trend
            </h3>
            <span style={styles.chartSubtitle}>Last 7 days</span>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient
                    id="fraudGrad"
                    x1="0" y1="0" x2="0" y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#ef4444"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#ef4444"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="normalGrad"
                    x1="0" y1="0" x2="0" y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#22c55e"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#22c55e"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(v) => (
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                      {v}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="normal"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#normalGrad)"
                  name="Normal"
                />
                <Area
                  type="monotone"
                  dataKey="fraud"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#fraudGrad)"
                  name="Fraud"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.emptyChart}>
              <p>📊 No trend data yet</p>
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
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {riskData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
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
                  formatter={(v) => (
                    <span style={{
                      color: '#94a3b8',
                      fontSize: '12px'
                    }}>
                      {v}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.emptyChart}>
              <p>🎯 No risk data yet</p>
            </div>
          )}
        </div>

        {/* Bar Chart - Transaction Types */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>
              📊 Transaction Types
            </h3>
            <span style={styles.chartSubtitle}>By category</span>
          </div>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={typeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="type"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(v) => (
                    <span style={{
                      color: '#94a3b8',
                      fontSize: '12px'
                    }}>
                      {v}
                    </span>
                  )}
                />
                <Bar
                  dataKey="count"
                  fill="#7c3aed"
                  radius={[4, 4, 0, 0]}
                  name="Total"
                />
                <Bar
                  dataKey="fraud"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  name="Fraud"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.emptyChart}>
              <p>📊 No type data yet</p>
            </div>
          )}
        </div>

      </div>

      {/* ─── ML Model Performance ─────────────── */}
      {stats?.mlStats && (
        <div style={styles.mlCard}>
          <h3 style={styles.mlTitle}>
            🤖 ML Model Performance Metrics
          </h3>
          <div style={styles.mlGrid}>
            {[
              {
                label: 'Accuracy',
                value: stats.mlStats.accuracy,
                color: '#22c55e',
                desc: 'Overall correct predictions'
              },
              {
                label: 'Precision',
                value: stats.mlStats.precision,
                color: '#7c3aed',
                desc: 'True positive rate'
              },
              {
                label: 'Recall',
                value: stats.mlStats.recall,
                color: '#f59e0b',
                desc: 'Fraud detection rate'
              },
              {
                label: 'F1 Score',
                value: stats.mlStats.f1_score,
                color: '#3b82f6',
                desc: 'Balanced metric'
              }
            ].map((m) => (
              <div key={m.label} style={styles.mlMetric}>
                <div style={styles.mlMetricHeader}>
                  <span style={styles.mlMetricLabel}>
                    {m.label}
                  </span>
                  <span style={{
                    ...styles.mlMetricValue,
                    color: m.color
                  }}>
                    {m.value}%
                  </span>
                </div>
                <div style={styles.mlBar}>
                  <div style={{
                    ...styles.mlBarFill,
                    width: `${m.value}%`,
                    background: m.color
                  }} />
                </div>
                <p style={styles.mlDesc}>{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Confusion Matrix */}
          {stats.mlStats.confusion_matrix && (
            <div style={styles.confusionSection}>
              <h4 style={styles.confusionTitle}>
                🔢 Confusion Matrix
              </h4>
              <div style={styles.confusionGrid}>
                {[
                  {
                    label: 'True Negatives',
                    value: stats.mlStats.confusion_matrix.true_negatives,
                    color: '#22c55e',
                    desc: 'Normal correctly identified'
                  },
                  {
                    label: 'False Positives',
                    value: stats.mlStats.confusion_matrix.false_positives,
                    color: '#f59e0b',
                    desc: 'Normal flagged as fraud'
                  },
                  {
                    label: 'False Negatives',
                    value: stats.mlStats.confusion_matrix.false_negatives,
                    color: '#ef4444',
                    desc: 'Fraud missed'
                  },
                  {
                    label: 'True Positives',
                    value: stats.mlStats.confusion_matrix.true_positives,
                    color: '#7c3aed',
                    desc: 'Fraud correctly caught'
                  }
                ].map((c) => (
                  <div key={c.label} style={{
                    ...styles.confusionCard,
                    borderColor: `${c.color}30`
                  }}>
                    <p style={{
                      ...styles.confusionValue,
                      color: c.color
                    }}>
                      {c.value?.toLocaleString()}
                    </p>
                    <p style={styles.confusionLabel}>
                      {c.label}
                    </p>
                    <p style={styles.confusionDesc}>
                      {c.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  )
}

// ─── Styles ────────────────────────────────────────
const styles = {
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    gap: '16px'
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid rgba(124,58,237,0.2)',
    borderTop: '3px solid #7c3aed',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '16px',
    marginBottom: '20px'
  },
  summaryCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  summaryIcon: { fontSize: '28px' },
  summaryValue: {
    margin: '0 0 2px',
    fontSize: '22px',
    fontWeight: '700'
  },
  summaryLabel: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600'
  },
  chartsGrid: {
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
    height: '250px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#475569'
  },
  tooltip: {
    background: '#1e1e2e',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '10px 14px'
  },
  tooltipLabel: {
    margin: '0 0 6px',
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600'
  },
  tooltipItem: {
    margin: '2px 0',
    fontSize: '13px',
    fontWeight: '600'
  },
  mlCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(124,58,237,0.2)',
    borderRadius: '14px',
    padding: '24px'
  },
  mlTitle: {
    margin: '0 0 20px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#e2e8f0'
  },
  mlGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '20px',
    marginBottom: '24px'
  },
  mlMetric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  mlMetricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  mlMetricLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#94a3b8'
  },
  mlMetricValue: {
    fontSize: '18px',
    fontWeight: '700'
  },
  mlBar: {
    height: '6px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  mlBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 1s ease'
  },
  mlDesc: {
    margin: 0,
    fontSize: '11px',
    color: '#475569'
  },
  confusionSection: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: '20px'
  },
  confusionTitle: {
    margin: '0 0 16px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#94a3b8'
  },
  confusionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '12px'
  },
  confusionCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid',
    borderRadius: '10px',
    padding: '14px',
    textAlign: 'center'
  },
  confusionValue: {
    margin: '0 0 4px',
    fontSize: '24px',
    fontWeight: '700'
  },
  confusionLabel: {
    margin: '0 0 4px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#94a3b8'
  },
  confusionDesc: {
    margin: 0,
    fontSize: '11px',
    color: '#475569'
  }
}

export default Analytics