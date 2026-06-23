import { useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext.jsx'

function TransactionsPage() {
  const { transactions } = useAppContext()
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return transactions.filter((txn) => {
      if (typeFilter !== 'all' && txn.type !== typeFilter) return false
      if (statusFilter !== 'all' && txn.status !== statusFilter) return false
      if (!keyword) return true
      return [txn.id, txn.type, txn.method, txn.status, txn.date]
        .map((item) => String(item || '').toLowerCase())
        .some((item) => item.includes(keyword))
    })
  }, [transactions, typeFilter, statusFilter, query])
  const summary = useMemo(() => {
    const earning = filtered
      .filter((txn) => txn.rawType === 'earning' || txn.rawType === 'commission')
      .reduce((sum, txn) => sum + Number(txn.amount || 0), 0)
    const invested = filtered
      .filter((txn) => txn.rawType === 'investment')
      .reduce((sum, txn) => sum + Number(txn.amount || 0), 0)
    const withdrawn = filtered
      .filter((txn) => txn.rawType === 'withdrawal')
      .reduce((sum, txn) => sum + Number(txn.amount || 0), 0)
    return { earning, invested, withdrawn }
  }, [filtered])

  return (
    <section className="page-grid mobile-friendly-page">
      <div className="glass-card">
        <h2 className="page-title">Transaction History</h2>
        <p className="muted">Complete record of deposits, investments, earnings, commissions, and withdrawals.</p>
        <div className="plan-actions mobile-filter-stack">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="investment">Investment</option>
            <option value="earning">Earning</option>
            <option value="commission">Commission</option>
            <option value="withdraw">Withdraw</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <input
            placeholder="Search by id, method, status, date..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="metrics-grid">
        <article className="glass-card metric success">
          <div className="metric-head">
            <p className="muted">Filtered Records</p>
          </div>
          <h3>{filtered.length}</h3>
        </article>
        <article className="glass-card metric violet">
          <div className="metric-head">
            <p className="muted">Earnings + Commissions</p>
          </div>
          <h3>${summary.earning.toFixed(2)}</h3>
        </article>
        <article className="glass-card metric cyan">
          <div className="metric-head">
            <p className="muted">Invested Amount</p>
          </div>
          <h3>${summary.invested.toFixed(2)}</h3>
        </article>
        <article className="glass-card metric rose">
          <div className="metric-head">
            <p className="muted">Withdrawal Amount</p>
          </div>
          <h3>${summary.withdrawn.toFixed(2)}</h3>
        </article>
      </div>

      <div className="glass-card">
        <div className="mobile-record-list">
          {filtered.length ? (
            filtered.map((txn) => (
              <article key={txn.id} className="mobile-record-card">
                <div className="mobile-record-row">
                  <span className="muted small">ID</span>
                  <strong>{txn.id}</strong>
                </div>
                <div className="mobile-record-row">
                  <span className="muted small">Type</span>
                  <strong className="capitalize">{txn.type}</strong>
                </div>
                <div className="mobile-record-row">
                  <span className="muted small">Method</span>
                  <span>{txn.method}</span>
                </div>
                <div className="mobile-record-row">
                  <span className="muted small">Amount</span>
                  <strong>${Number(txn.amount).toFixed(2)}</strong>
                </div>
                <div className="mobile-record-row">
                  <span className="muted small">Status</span>
                  <span className={`status ${txn.status}`}>{txn.status}</span>
                </div>
                <div className="mobile-record-row">
                  <span className="muted small">Date</span>
                  <span>{txn.date}</span>
                </div>
              </article>
            ))
          ) : (
            <p className="muted">No transactions match your filters.</p>
          )}
        </div>

        <div className="table-wrap table-wrap--desktop">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Method / Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn) => (
                <tr key={txn.id}>
                  <td>{txn.id}</td>
                  <td className="capitalize">{txn.type}</td>
                  <td>{txn.method}</td>
                  <td>${Number(txn.amount).toFixed(2)}</td>
                  <td>
                    <span className={`status ${txn.status}`}>{txn.status}</span>
                  </td>
                  <td>{txn.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default TransactionsPage
