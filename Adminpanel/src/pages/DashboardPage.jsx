import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BadgeCheck,
  CircleAlert,
  CreditCard,
  MessageSquare,
  Shield,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { useAdmin } from '../state/AdminContext.jsx'

function StatCard({ label, value, icon: Icon }) {
  return (
    <article className="stat-card">
      <div className="stat-head">
        <Icon size={16} />
        <span>{label}</span>
      </div>
      <h3>{value}</h3>
    </article>
  )
}

function DashboardPage() {
  const { metrics, users, deposits, withdrawals, transactions, chatRooms, plans, paymentAccounts, socialLinks } =
    useAdmin()

  const stats = useMemo(() => {
    const pendingDeposits = deposits.filter((item) => item.status === 'pending').length
    const pendingWithdrawals = withdrawals.filter((item) => item.status === 'pending').length
    const blockedUsers = users.filter((item) => item.isBlocked).length
    const openChats = chatRooms.filter((item) => item.status === 'open').length
    return { pendingDeposits, pendingWithdrawals, blockedUsers, openChats }
  }, [deposits, withdrawals, users, chatRooms])

  const recentActivity = useMemo(() => transactions.slice(0, 8), [transactions])

  return (
    <section className="panel-grid">
      <header className="panel-head">
        <h2>Dashboard</h2>
        <p>Control center to manage users, money flow, plans, support, and moderation.</p>
      </header>

      <div className="stats-grid">
        <StatCard label="Total Users" value={metrics?.totalUsers ?? 0} icon={Users} />
        <StatCard label="Active Investments" value={metrics?.activeInvestments ?? 0} icon={TrendingUp} />
        <StatCard
          label="Total Deposits"
          value={`$${Number(metrics?.totalDeposits || 0).toFixed(2)}`}
          icon={Wallet}
        />
        <StatCard
          label="Total Withdrawals"
          value={`$${Number(metrics?.totalWithdrawals || 0).toFixed(2)}`}
          icon={ArrowDownCircle}
        />
      </div>

      <div className="stats-grid admin-stats-extended">
        <StatCard label="Pending Deposits" value={stats.pendingDeposits} icon={ArrowUpCircle} />
        <StatCard label="Pending Withdrawals" value={stats.pendingWithdrawals} icon={Wallet} />
        <StatCard label="Blocked Users" value={stats.blockedUsers} icon={Shield} />
        <StatCard label="Open Support Chats" value={stats.openChats} icon={MessageSquare} />
      </div>

      <div className="table-card dashboard-actions">
        <h3>Quick Actions</h3>
        <div className="dashboard-action-grid">
          <Link to="/users" className="dashboard-action-link">
            <Users size={15} /> Manage Users
          </Link>
          <Link to="/deposits" className="dashboard-action-link">
            <ArrowUpCircle size={15} /> Review Deposits
          </Link>
          <Link to="/withdrawals" className="dashboard-action-link">
            <ArrowDownCircle size={15} /> Review Withdrawals
          </Link>
          <Link to="/transactions" className="dashboard-action-link">
            <Wallet size={15} /> Transactions
          </Link>
          <Link to="/payment-accounts" className="dashboard-action-link">
            <CreditCard size={15} /> Payment Methods
          </Link>
          <Link to="/chat-rooms" className="dashboard-action-link">
            <MessageSquare size={15} /> Support Chat
          </Link>
          <Link to="/plans" className="dashboard-action-link">
            <TrendingUp size={15} /> Investment Plans
          </Link>
          <Link to="/social-links" className="dashboard-action-link">
            <BadgeCheck size={15} /> Social Links
          </Link>
        </div>
      </div>

      <div className="dashboard-split">
        <div className="table-card">
          <h3>System Summary</h3>
          <ul className="dashboard-health-list">
            <li>
              <span>Total configured plans</span>
              <strong>{plans.length}</strong>
            </li>
            <li>
              <span>Total payment accounts</span>
              <strong>{paymentAccounts.length}</strong>
            </li>
            <li>
              <span>Total social links</span>
              <strong>{socialLinks.items?.length || 0}</strong>
            </li>
            <li>
              <span>Escalation required</span>
              <strong>{stats.pendingDeposits + stats.pendingWithdrawals + stats.openChats}</strong>
            </li>
          </ul>
        </div>

        <div className="table-card">
          <h3>Attention Board</h3>
          <ul className="dashboard-alert-list">
            {stats.pendingDeposits > 0 ? (
              <li>
                <CircleAlert size={14} /> {stats.pendingDeposits} pending deposit request(s).
              </li>
            ) : null}
            {stats.pendingWithdrawals > 0 ? (
              <li>
                <CircleAlert size={14} /> {stats.pendingWithdrawals} pending withdrawal request(s).
              </li>
            ) : null}
            {stats.openChats > 0 ? (
              <li>
                <CircleAlert size={14} /> {stats.openChats} open support chat room(s).
              </li>
            ) : null}
            {stats.blockedUsers > 0 ? (
              <li>
                <CircleAlert size={14} /> {stats.blockedUsers} blocked user(s) currently.
              </li>
            ) : null}
            {!stats.pendingDeposits && !stats.pendingWithdrawals && !stats.openChats && !stats.blockedUsers ? (
              <li>
                <BadgeCheck size={14} /> Everything looks healthy.
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="table-card">
        <h3>Recent Financial Activity</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Type</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.length ? (
              recentActivity.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.userId}</td>
                  <td>{item.type}</td>
                  <td>{item.method || '-'}</td>
                  <td>${Number(item.amount || 0).toFixed(2)}</td>
                  <td>{item.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="table-empty">
                  No recent activity yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default DashboardPage
