import { useState, useEffect } from 'react'
import PageLayout from '../components/layout/PageLayout'
import RiskBadge from '../components/ui/RiskBadge'
import { getTransactions } from '../services/api'

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [pagination, setPagination] = useState({})
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadTransactions()
  }, [filter, page])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (filter !== 'all') params.status = filter

      const res = await getTransactions(params)
      setTransactions(res.data.data.transactions)
      setPagination(res.data.data.pagination)
    } catch (err) {
      console.log('Error:', err)
    }
    setLoading(false)
  }

  return (
    <PageLayout
      title="Transaction History"
      subtitle="All your past transactions"
    >
      {/* ─── Filter Tabs ──────────────────────── */}
      <div style={styles.filterRow}>
        {[
          { value: 'all', label: '📋 All' },
          { value: 'approved', label: '✅ Approved' },
          { value: 'blocked', label: '🚨 Blocked' },
          { value: 'pending', label: '⏳ Pending' }
        ].map(f => (
          <button
            key={f.value}
            onClick={() => {
              setFilter(f.value)
              setPage(1)
            }}
            style={{
              ...styles.filterBtn,
              background: filter === f.value
                ? 'linear-gradient(135deg,#7c3aed,#6d28d9)'
                : 'rgba(255,255,255,0.04)',
              color: filter === f.value
                ? '#fff'
                : '#64748b',
              border: filter === f.value
                ? 'none'
                : '1px solid rgba(255,255,255,0.08)'
            }}
          >
            {f.label}
          </button>
        ))}

        {/* Total count */}
        <div style={styles.totalBadge}>
          {pagination.total || 0} total
        </div>
      </div>

      {/* ─── Table Card ───────────────────────── */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>📋</p>
            <p style={styles.emptyTitle}>No transactions found</p>
            <p style={styles.emptySubtitle}>
              {filter !== 'all'
                ? `No ${filter} transactions`
                : 'Submit your first transaction'}
            </p>
          </div>
        ) : (
          <>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {[
                      '#', 'Amount', 'Type',
                      'Category', 'Description',
                      'Risk', 'Fraud %',
                      'Status', 'Date'
                    ].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, index) => (
                    <tr
                      key={tx._id}
                      style={{
                        ...styles.tr,
                        background: tx.isFraud
                          ? 'rgba(239,68,68,0.04)'
                          : 'transparent'
                      }}
                    >
                      {/* Index */}
                      <td style={styles.td}>
                        <span style={styles.indexNum}>
                          {(page - 1) * 10 + index + 1}
                        </span>
                      </td>

                      {/* Amount */}
                      <td style={styles.td}>
                        <span style={{
                          fontWeight: '700',
                          fontSize: '15px',
                          color: tx.isFraud
                            ? '#ef4444'
                            : '#22c55e'
                        }}>
                          ${tx.amount.toFixed(2)}
                        </span>
                      </td>

                      {/* Type */}
                      <td style={styles.td}>
                        <span style={styles.typeBadge}>
                          {tx.transactionType}
                        </span>
                      </td>

                      {/* Category */}
                      <td style={styles.td}>
                        <span style={{ color: '#94a3b8' }}>
                          {tx.merchantCategory}
                        </span>
                      </td>

                      {/* Description */}
                      <td style={styles.td}>
                        <span style={{
                          color: '#64748b',
                          fontSize: '12px'
                        }}>
                          {tx.description || '—'}
                        </span>
                      </td>

                      {/* Risk */}
                      <td style={styles.td}>
                        <RiskBadge risk={tx.riskLevel} />
                      </td>

                      {/* Fraud % */}
                      <td style={styles.td}>
                        <div style={styles.fraudProbRow}>
                          <span style={{
                            color: tx.fraudProbability > 50
                              ? '#ef4444'
                              : '#22c55e',
                            fontWeight: '700',
                            fontSize: '13px'
                          }}>
                            {tx.fraudProbability}%
                          </span>
                          <div style={styles.miniBar}>
                            <div style={{
                              ...styles.miniBarFill,
                              width: `${tx.fraudProbability}%`,
                              background: tx.fraudProbability > 50
                                ? '#ef4444'
                                : '#22c55e'
                            }} />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={styles.td}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: tx.status === 'blocked'
                            ? 'rgba(239,68,68,0.1)'
                            : tx.status === 'approved'
                            ? 'rgba(34,197,94,0.1)'
                            : 'rgba(245,158,11,0.1)',
                          color: tx.status === 'blocked'
                            ? '#ef4444'
                            : tx.status === 'approved'
                            ? '#22c55e'
                            : '#f59e0b'
                        }}>
                          {tx.status?.toUpperCase()}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={styles.td}>
                        <span style={{
                          color: '#475569',
                          fontSize: '12px'
                        }}>
                          {new Date(tx.createdAt)
                            .toLocaleDateString()}
                        </span>
                        <br />
                        <span style={{
                          color: '#334155',
                          fontSize: '11px'
                        }}>
                          {new Date(tx.createdAt)
                            .toLocaleTimeString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={styles.pagination}>
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                  style={{
                    ...styles.pageBtn,
                    opacity: page === 1 ? 0.4 : 1
                  }}
                >
                  ← Prev
                </button>
                <span style={styles.pageInfo}>
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === pagination.pages}
                  style={{
                    ...styles.pageBtn,
                    opacity: page === pagination.pages ? 0.4 : 1
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  )
}

const styles = {
  filterRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    alignItems: 'center',
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
  totalBadge: {
    marginLeft: 'auto',
    padding: '6px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '600'
  },
  tableCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '14px',
    overflow: 'hidden',
    minHeight: '400px'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
    whiteSpace: 'nowrap'
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    transition: 'background 0.2s'
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    color: '#e2e8f0',
    whiteSpace: 'nowrap'
  },
  indexNum: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.06)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b'
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
  fraudProbRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '80px'
  },
  miniBar: {
    height: '3px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  miniBarFill: {
    height: '100%',
    borderRadius: '2px'
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '16px',
    borderTop: '1px solid rgba(255,255,255,0.06)'
  },
  pageBtn: {
    padding: '8px 16px',
    background: 'rgba(124,58,237,0.1)',
    border: '1px solid rgba(124,58,237,0.2)',
    borderRadius: '8px',
    color: '#a78bfa',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  pageInfo: {
    fontSize: '13px',
    color: '#64748b'
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
    border: '3px solid rgba(124,58,237,0.2)',
    borderTop: '3px solid #7c3aed',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  loadingText: {
    color: '#64748b',
    fontSize: '14px'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
    gap: '10px'
  },
  emptyIcon: {
    fontSize: '40px',
    margin: 0
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#475569',
    margin: 0
  },
  emptySubtitle: {
    fontSize: '13px',
    color: '#334155',
    margin: 0
  }
}

export default Transactions