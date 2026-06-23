import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { Activity, ArrowUpRight, DollarSign, Lock, Users, Wallet } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAppContext } from '../context/AppContext.jsx'

function buildChartData(transactions, balance) {
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const monthlyEarnings = monthLabels.map((month) => ({ month, earnings: 0 }))
  transactions.forEach((txn) => {
    const date = new Date(txn.date)
    if (Number.isNaN(date.getTime())) return
    const monthIndex = date.getMonth()
    if (monthIndex < 0 || monthIndex > 5) return
    if (txn.rawType === 'commission' || txn.rawType === 'earning') {
      monthlyEarnings[monthIndex].earnings += Number(txn.amount || 0)
    }
  })
  let running = Math.max(0, Number(balance || 0) * 0.7)
  const growthData = monthLabels.map((month, index) => {
    running += monthlyEarnings[index].earnings + 250
    return { month, value: Number(running.toFixed(2)) }
  })
  return { growthData, earningsData: monthlyEarnings }
}

function DashboardPage() {
  const { user, transactions, referralCount, referralEarnings, investments, deposits, withdrawals } =
    useAppContext()
  const { growthData, earningsData } = buildChartData(transactions, user.balance)
  const lockedDepositBalance = Number(user.lockedBalance || 0)
  const withdrawableBalance = Math.max(0, Number(user.balance || 0) - lockedDepositBalance)
  const monitor = useMemo(() => {
    const totalInvested = investments.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const activeInvested = investments
      .filter((item) => item.status === 'active')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const totalExpectedReturn = investments.reduce((sum, item) => sum + Number(item.expectedReturn || 0), 0)
    const totalDeposits = deposits.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const totalWithdrawn = withdrawals.reduce((sum, item) => {
      const parsed = Number(String(item.amount || '0').replace(/[^0-9.-]/g, ''))
      return sum + Math.abs(Number.isFinite(parsed) ? parsed : 0)
    }, 0)
    const totalProfitCredited = transactions
      .filter((item) => item.rawType === 'earning' || item.rawType === 'commission')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
    return {
      totalInvested,
      activeInvested,
      totalExpectedReturn,
      totalDeposits,
      totalWithdrawn,
      totalProfitCredited,
      activePlans: investments.filter((item) => item.status === 'active').length,
      completedPlans: investments.filter((item) => item.status === 'completed').length,
      pendingWithdrawals: withdrawals.filter((item) => item.status === 'pending').length,
    }
  }, [investments, deposits, withdrawals, transactions])

  const cards = [
    {
      label: 'Withdrawable Balance',
      value: `$${withdrawableBalance.toFixed(2)}`,
      icon: Wallet,
      tone: 'success',
      change: '+0.0%',
    },
    {
      label: 'Active Investments',
      value: user.activeInvestments,
      icon: Activity,
      tone: 'info',
      change: 'Live',
    },
    {
      label: 'Total Earnings',
      value: `$${user.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      tone: 'violet',
      change: '+8.2%',
    },
    {
      label: 'Referrals',
      value: referralCount,
      icon: Users,
      tone: 'rose',
      change: 'View tree',
      to: '/referral-tree',
    },
    {
      label: 'Locked Deposits',
      value: `$${lockedDepositBalance.toFixed(2)}`,
      icon: Lock,
      tone: 'info',
      change: 'Frozen',
    },
  ]

  return (
    <section className="page-grid">
      <div className="glass-card">
        <h2 className="page-title">Welcome back, {user.name.split(' ')[0]}!</h2>
        <p className="muted dashboard-subtitle">Here&apos;s what&apos;s happening with your portfolio today.</p>
      </div>

      <div className="metrics-grid">
        {cards.map((item) => {
          const body = (
            <>
              <div className="metric-head">
                <span className="icon-box">
                  <item.icon size={18} />
                </span>
                <p className="muted">{item.label}</p>
              </div>
              <h3>{item.value}</h3>
              <p className="metric-change">
                <ArrowUpRight size={14} /> {item.change}
              </p>
            </>
          )
          if (item.to) {
            return (
              <Link key={item.label} to={item.to} className={`glass-card metric metric-link ${item.tone}`}>
                {body}
              </Link>
            )
          }
          return (
            <article key={item.label} className={`glass-card metric ${item.tone}`}>
              {body}
            </article>
          )
        })}
      </div>

      <div className="chart-grid">
        <article className="glass-card chart-card">
          <h3>
            <Activity size={16} /> Portfolio Growth
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ background: '#0f172acc', border: '1px solid #ffffff1f' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorGrowth)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </article>
        <article className="glass-card chart-card">
          <h3>
            <DollarSign size={16} /> Monthly Earnings
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ background: '#0f172acc', border: '1px solid #ffffff1f' }}
              />
              <Bar dataKey="earnings" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </div>

      <div className="glass-card">
        <h3>Recent Transactions</h3>
        <div className="transaction-list">
          {transactions.slice(0, 8).map((txn) => (
            <article key={txn.id} className="transaction-item">
              <div>
                <p className="capitalize">{txn.type}</p>
                <p className="muted small">{txn.date}</p>
              </div>
              <div className="tx-right">
                <strong>{txn.type === 'withdraw' ? '-' : '+'}${Number(txn.amount).toFixed(2)}</strong>
                <span className={`status ${txn.status}`}>{txn.status}</span>
              </div>
            </article>
          ))}
        </div>
        <div className="plan-actions">
          <Link className="mini-btn" to="/transactions">
            View Full Transaction History
          </Link>
        </div>
      </div>

      <div className="glass-card">
        <h3>Portfolio Monitor</h3>
        <div className="portfolio-monitor-grid">
          <article className="summary-card">
            <p>Total Invested</p>
            <h4>${monitor.totalInvested.toFixed(2)}</h4>
          </article>
          <article className="summary-card">
            <p>Active Investment Amount</p>
            <h4>${monitor.activeInvested.toFixed(2)}</h4>
          </article>
          <article className="summary-card">
            <p>Total Profit Credited</p>
            <h4>${monitor.totalProfitCredited.toFixed(2)}</h4>
          </article>
          <article className="summary-card">
            <p>Expected Return (All Plans)</p>
            <h4>${monitor.totalExpectedReturn.toFixed(2)}</h4>
          </article>
          <article className="summary-card">
            <p>Total Deposits</p>
            <h4>${monitor.totalDeposits.toFixed(2)}</h4>
          </article>
          <article className="summary-card">
            <p>Total Withdrawals Requested</p>
            <h4>${monitor.totalWithdrawn.toFixed(2)}</h4>
          </article>
          <article className="summary-card">
            <p>Active Plans</p>
            <h4>{monitor.activePlans}</h4>
          </article>
          <article className="summary-card">
            <p>Completed Plans</p>
            <h4>{monitor.completedPlans}</h4>
          </article>
          <article className="summary-card">
            <p>Pending Withdrawals</p>
            <h4>{monitor.pendingWithdrawals}</h4>
          </article>
        </div>
      </div>

      <div className="quick-actions-grid">
        <Link className="action-card emerald" to="/deposit">
          <h4>Make a Deposit</h4>
          <p>Fund your wallet securely.</p>
        </Link>
        <Link className="action-card cyan" to="/investment-plans">
          <h4>Browse Plans</h4>
          <p>Compare all opportunities.</p>
        </Link>
        <Link className="action-card violet" to="/referral-tree">
          <h4>Refer & Earn</h4>
          <p>Grow your network rewards.</p>
        </Link>
      </div>
      <div className="glass-card">
        <p className="muted small">
          Referral earnings so far: ${referralEarnings.toFixed(2)} | Current wallet balance: $
          {user.balance.toFixed(2)}
        </p>
      </div>
    </section>
  )
}

export default DashboardPage
