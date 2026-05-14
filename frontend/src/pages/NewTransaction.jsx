import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import RiskBadge from '../components/ui/RiskBadge'
import { submitTransaction } from '../services/api'

function NewTransaction() {
  const navigate = useNavigate()

  // Form state
  const [form, setForm] = useState({
    amount: '',
    transactionType: 'online',
    merchantCategory: 'retail',
    description: ''
  })

  // Result state
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      console.log('Submitting transaction...')
      const res = await submitTransaction(form)
      console.log('Result:', res.data)
      setResult(res.data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed')
    }

    setLoading(false)
  }

  const handleReset = () => {
    setForm({
      amount: '',
      transactionType: 'online',
      merchantCategory: 'retail',
      description: ''
    })
    setResult(null)
    setError('')
  }

  return (
    <PageLayout
      title="New Transaction"
      subtitle="Submit transaction for AI fraud analysis"
    >
      <div style={styles.container}>

        {/* LEFT — Form */}
        <div style={styles.formCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>💳 Transaction Details</h3>
            <p style={styles.cardSubtitle}>
              Fill in the details below
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>

            {/* Amount */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Transaction Amount ($)
              </label>
              <div style={styles.amountWrapper}>
                <span style={styles.currencySign}>$</span>
                <input
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={handleChange}
                  style={styles.amountInput}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Transaction Type */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Transaction Type</label>
              <div style={styles.optionsGrid}>
                {[
                  { value: 'online', icon: '🌐', label: 'Online' },
                  { value: 'pos', icon: '🏪', label: 'POS' },
                  { value: 'atm', icon: '🏧', label: 'ATM' },
                  { value: 'transfer', icon: '🔄', label: 'Transfer' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      transactionType: opt.value
                    }))}
                    style={{
                      ...styles.optionBtn,
                      background: form.transactionType === opt.value
                        ? 'rgba(124,58,237,0.2)'
                        : 'rgba(255,255,255,0.03)',
                      border: form.transactionType === opt.value
                        ? '1px solid rgba(124,58,237,0.5)'
                        : '1px solid rgba(255,255,255,0.08)',
                      color: form.transactionType === opt.value
                        ? '#c4b5fd'
                        : '#64748b'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>
                      {opt.icon}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Merchant Category */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Merchant Category</label>
              <div style={styles.optionsGrid}>
                {[
                  { value: 'retail', icon: '🛒', label: 'Retail' },
                  { value: 'food', icon: '🍔', label: 'Food' },
                  { value: 'travel', icon: '✈️', label: 'Travel' },
                  { value: 'entertainment', icon: '🎮', label: 'Entertainment' },
                  { value: 'other', icon: '📦', label: 'Other' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      merchantCategory: opt.value
                    }))}
                    style={{
                      ...styles.optionBtn,
                      background: form.merchantCategory === opt.value
                        ? 'rgba(124,58,237,0.2)'
                        : 'rgba(255,255,255,0.03)',
                      border: form.merchantCategory === opt.value
                        ? '1px solid rgba(124,58,237,0.5)'
                        : '1px solid rgba(255,255,255,0.08)',
                      color: form.merchantCategory === opt.value
                        ? '#c4b5fd'
                        : '#64748b'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>
                      {opt.icon}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Description (Optional)
              </label>
              <input
                type="text"
                name="description"
                placeholder="e.g. Amazon purchase, Grocery shopping..."
                value={form.description}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={styles.error}>⚠️ {error}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <>
                  <div style={styles.spinner} />
                  Analyzing with AI...
                </>
              ) : (
                <>🔍 Analyze Transaction</>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT — Result */}
        <div style={styles.resultCard}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>🤖 AI Analysis Result</h3>
            <p style={styles.cardSubtitle}>
              Real-time fraud detection
            </p>
          </div>

          {/* Empty state */}
          {!result && !loading && (
            <div style={styles.emptyResult}>
              <div style={styles.emptyIcon}>🔍</div>
              <p style={styles.emptyTitle}>
                Awaiting Analysis
              </p>
              <p style={styles.emptySubtitle}>
                Fill in transaction details and click
                Analyze to get AI prediction
              </p>
              <div style={styles.featureList}>
                {[
                  '✅ Real-time ML prediction',
                  '✅ Risk level assessment',
                  '✅ Fraud probability score',
                  '✅ Instant result'
                ].map((f, i) => (
                  <p key={i} style={styles.featureItem}>{f}</p>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={styles.emptyResult}>
              <div style={styles.analyzingIcon}>🤖</div>
              <p style={styles.emptyTitle}>
                AI is analyzing...
              </p>
              <p style={styles.emptySubtitle}>
                ML model is processing your transaction
              </p>
              <div style={styles.loadingBars}>
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    style={{
                      ...styles.loadingBar,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div style={styles.resultContent}>

              {/* Main Result Banner */}
              <div style={{
                ...styles.resultBanner,
                background: result.prediction.isFraud
                  ? 'rgba(239,68,68,0.1)'
                  : 'rgba(34,197,94,0.1)',
                border: `1px solid ${result.prediction.isFraud
                  ? 'rgba(239,68,68,0.3)'
                  : 'rgba(34,197,94,0.3)'}`
              }}>
                <div style={styles.resultIconBig}>
                  {result.prediction.isFraud ? '🚨' : '✅'}
                </div>
                <div>
                  <p style={{
                    ...styles.resultMainText,
                    color: result.prediction.isFraud
                      ? '#ef4444'
                      : '#22c55e'
                  }}>
                    {result.prediction.isFraud
                      ? 'FRAUD DETECTED'
                      : 'TRANSACTION SAFE'}
                  </p>
                  <p style={styles.resultMessage}>
                    {result.prediction.message}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div style={styles.detailsGrid}>

                {/* Fraud Probability */}
                <div style={styles.detailCard}>
                  <p style={styles.detailLabel}>
                    Fraud Probability
                  </p>
                  <p style={{
                    ...styles.detailValue,
                    color: result.prediction.fraudProbability > 50
                      ? '#ef4444'
                      : '#22c55e'
                  }}>
                    {result.prediction.fraudProbability}%
                  </p>
                  {/* Probability bar */}
                  <div style={styles.probBar}>
                    <div style={{
                      ...styles.probFill,
                      width: `${result.prediction.fraudProbability}%`,
                      background: result.prediction.fraudProbability > 50
                        ? '#ef4444'
                        : '#22c55e'
                    }} />
                  </div>
                </div>

                {/* Risk Level */}
                <div style={styles.detailCard}>
                  <p style={styles.detailLabel}>Risk Level</p>
                  <div style={{ marginTop: '8px' }}>
                    <RiskBadge risk={result.prediction.riskLevel} />
                  </div>
                </div>

                {/* Amount */}
                <div style={styles.detailCard}>
                  <p style={styles.detailLabel}>Amount</p>
                  <p style={{
                    ...styles.detailValue,
                    color: result.prediction.isFraud
                      ? '#ef4444'
                      : '#f1f5f9'
                  }}>
                    ${parseFloat(form.amount).toFixed(2)}
                  </p>
                </div>

                {/* Status */}
                <div style={styles.detailCard}>
                  <p style={styles.detailLabel}>Status</p>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    marginTop: '8px',
                    display: 'inline-block',
                    background: result.transaction.status === 'blocked'
                      ? 'rgba(239,68,68,0.1)'
                      : 'rgba(34,197,94,0.1)',
                    color: result.transaction.status === 'blocked'
                      ? '#ef4444'
                      : '#22c55e'
                  }}>
                    {result.transaction.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={styles.actionBtns}>
                <button
                  onClick={handleReset}
                  style={styles.newBtn}
                >
                  + New Transaction
                </button>
                <button
                  onClick={() => navigate('/transactions')}
                  style={styles.historyBtn}
                >
                  View History →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}

// ─── Styles ────────────────────────────────────────
const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    alignItems: 'start'
  },
  formCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '24px'
  },
  resultCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '24px',
    minHeight: '500px'
  },
  cardHeader: {
    marginBottom: '24px'
  },
  cardTitle: {
    margin: '0 0 4px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#e2e8f0'
  },
  cardSubtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#94a3b8'
  },
  amountWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  currencySign: {
    position: 'absolute',
    left: '14px',
    color: '#7c3aed',
    fontWeight: '700',
    fontSize: '16px'
  },
  amountInput: {
    width: '100%',
    padding: '14px 16px 14px 32px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(167,139,250,0.25)',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '18px',
    fontWeight: '700',
    outline: 'none',
    fontFamily: 'inherit'
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px'
  },
  optionBtn: {
    padding: '12px 8px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s'
  },
  input: {
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit'
  },
  error: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px',
    padding: '12px',
    color: '#f87171',
    fontSize: '13px'
  },
  submitBtn: {
    padding: '14px',
    background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: 'inherit',
    boxShadow: '0 4px 25px rgba(124,58,237,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  emptyResult: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    textAlign: 'center',
    gap: '12px'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '8px'
  },
  analyzingIcon: {
    fontSize: '48px',
    animation: 'pulse 1s ease infinite'
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#475569',
    margin: 0
  },
  emptySubtitle: {
    fontSize: '13px',
    color: '#334155',
    margin: 0,
    maxWidth: '260px'
  },
  featureList: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  featureItem: {
    margin: 0,
    fontSize: '13px',
    color: '#475569'
  },
  loadingBars: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px'
  },
  loadingBar: {
    width: '40px',
    height: '6px',
    background: '#7c3aed',
    borderRadius: '3px',
    animation: 'pulse 1s ease infinite'
  },
  resultContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  resultBanner: {
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  resultIconBig: {
    fontSize: '40px',
    flexShrink: 0
  },
  resultMainText: {
    margin: '0 0 4px',
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: '1px'
  },
  resultMessage: {
    margin: 0,
    fontSize: '13px',
    color: '#94a3b8'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  detailCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px',
    padding: '14px'
  },
  detailLabel: {
    margin: '0 0 6px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  detailValue: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    color: '#f1f5f9'
  },
  probBar: {
    height: '4px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '2px',
    marginTop: '8px',
    overflow: 'hidden'
  },
  probFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.8s ease'
  },
  actionBtns: {
    display: 'flex',
    gap: '12px'
  },
  newBtn: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  historyBtn: {
    flex: 1,
    padding: '12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit'
  }
}

export default NewTransaction