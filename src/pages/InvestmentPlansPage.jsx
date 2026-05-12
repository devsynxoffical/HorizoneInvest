import { motion } from 'motion/react'
import { useState } from 'react'
import { FaGem } from 'react-icons/fa6'
import { FiArrowUpRight, FiClock, FiDollarSign, FiTrendingUp } from 'react-icons/fi'
import { RiCheckboxCircleFill, RiRocket2Line, RiVipCrownLine } from 'react-icons/ri'
import { IoFlashOutline } from 'react-icons/io5'
import { toast } from 'sonner'
import { useAppContext } from '../context/AppContext.jsx'
import { API_BASE } from '../lib/api.js'

const toAssetUrl = (path) => {
  if (!path) return ''
  if (path.includes('/plan-logos/') || path.includes('/bank-logos/')) {
    const fileName = path.split('/').filter(Boolean).pop()
    const folder = path.includes('/plan-logos/') ? 'plan-logos' : 'bank-logos'
    const base = import.meta.env.BASE_URL || '/'
    return `${base}${folder}/${fileName}`
  }
  if (/^https?:\/\//i.test(path)) return path
  if (path.startsWith('/uploads/')) {
    const base = API_BASE.replace(/\/api\/?$/, '')
    return `${base}${path}`
  }
  const base = API_BASE.replace(/\/api\/?$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

function InvestmentPlansPage() {
  const { investmentPlans, invest } = useAppContext()
  const [draft, setDraft] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const iconMap = { starter: IoFlashOutline, professional: RiVipCrownLine, elite: RiRocket2Line }
  const toneMap = {
    starter: 'starter',
    professional: 'pro',
    elite: 'elite',
  }

  const planCoverImage = (plan) => {
    if (plan?.imagePath) return toAssetUrl(plan.imagePath)
    const slug = String(plan?.slug || '').toLowerCase()
    const name = String(plan?.name || '').toLowerCase()
    if (slug === 'starter' || name.includes('starter')) return '/images/worker_site.png'
    if (slug === 'professional' || name.includes('professional')) return '/images/crypto_trading.png'
    if (slug === 'elite' || name.includes('elite')) return '/images/solar_energy.png'
    if (name.includes('solar')) return '/images/solar_energy.png'
    if (name.includes('crypto') || name.includes('btc') || name.includes('usdt')) return '/images/crypto_trading.png'
    return '/images/worker_site.png'
  }

  const quickInvest = (plan) => {
    setDraft({
      plan,
      amount: String(Number(plan.minAmount || 0)),
    })
  }

  const confirmInvest = async () => {
    if (!draft?.plan) return
    const { plan } = draft
    const minAmount = Number(plan.minAmount || 0)
    const maxAmount = plan.maxAmount ? Number(plan.maxAmount) : null
    const amount = Number(draft.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (amount < minAmount) {
      toast.error(`Minimum investment for this plan is $${minAmount.toFixed(2)}`)
      return
    }
    if (maxAmount !== null && amount > maxAmount) {
      toast.error(`Maximum investment for this plan is $${maxAmount.toFixed(2)}`)
      return
    }

    setSubmitting(true)
    const response = await invest(plan.id, amount)
    setSubmitting(false)
    if (response.ok) toast.success(response.message)
    else toast.error(response.message)
    if (response.ok) setDraft(null)
  }

  return (
    <section className="page-grid investment-page">
      <div className="glass-card plans-header">
        <span className="pill-badge">
          <FiTrendingUp size={14} />
          Investment Opportunities
        </span>
        <h2 className="page-title">Choose Your Investment Plan</h2>
        <p className="muted">
          Select the perfect plan that matches your investment goals and start earning today.
        </p>
      </div>

      <div className="plans-grid">
        {investmentPlans.map((plan, index) => {
          const PlanIcon = iconMap[plan.slug] || FiTrendingUp
          const coverImage = planCoverImage(plan)
          return (
            <motion.article
              key={plan.id}
              className={`glass-card plan-card-v2 ${toneMap[plan.slug]} ${plan.popular ? 'popular' : ''}`}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="plan-top">
                <div className="plan-hero">
                  <img className="plan-hero-img" src={coverImage} alt={plan.name} loading="lazy" />
                  <div className="plan-hero-overlay">
                    <div className="plan-hero-corners">
                      <span className="plan-icon-square">
                        <PlanIcon size={18} />
                      </span>
                      <FaGem size={20} className="plan-gem" />
                    </div>
                    <div className="plan-hero-center">
                      <h3 className="plan-hero-title">{plan.name}</h3>
                      <p className="plan-hero-daily">{plan.dailyReturn}% Daily</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="plan-details">
                <div className="detail-row">
                  <span>
                    <FiDollarSign size={14} /> Minimum
                  </span>
                  <strong>${plan.minAmount.toLocaleString()}</strong>
                </div>
                <div className="detail-row">
                  <span>
                    <FiDollarSign size={14} /> Maximum
                  </span>
                  <strong>{plan.maxAmount ? `$${plan.maxAmount.toLocaleString()}` : 'Unlimited'}</strong>
                </div>
                <div className="detail-row">
                  <span>
                    <FiClock size={14} /> Duration
                  </span>
                  <strong>{plan.durationDays} Days</strong>
                </div>
              </div>

              <div className="total-return">
                <span>Total Return</span>
                <strong>{plan.totalReturn}%</strong>
              </div>

              <ul className="features-v2">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <RiCheckboxCircleFill size={15} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`btn plan-invest-btn ${toneMap[plan.slug]}`}
                onClick={() => quickInvest(plan)}
              >
                Invest Now <FiArrowUpRight size={15} />
              </button>
            </motion.article>
          )
        })}
      </div>

      <div className="glass-card info-block plans-why">
        <h3>Why Choose HorizonInvest?</h3>
        <div className="why-grid">
          <p>
            <RiCheckboxCircleFill size={16} />
            Secure and transparent investment platform
          </p>
          <p>
            <RiCheckboxCircleFill size={16} />
            Proven track record of consistent returns
          </p>
          <p>
            <RiCheckboxCircleFill size={16} />
            24/7 customer support and guidance
          </p>
          <p>
            <RiCheckboxCircleFill size={16} />
            Easy withdrawal process with no hidden fees
          </p>
        </div>
      </div>

      {draft ? (
        <div className="invest-dialog-backdrop" onClick={() => setDraft(null)}>
          <div className="invest-dialog-card" onClick={(event) => event.stopPropagation()}>
            <h3>Confirm Investment</h3>
            <p className="muted">
              Plan: <strong>{draft.plan.name}</strong>
            </p>
            <p className="muted small">
              Min: ${Number(draft.plan.minAmount || 0).toFixed(2)}
              {draft.plan.maxAmount ? ` | Max: $${Number(draft.plan.maxAmount).toFixed(2)}` : ''}
            </p>
            <label>Investment Amount (USD)</label>
            <input
              type="number"
              min={Number(draft.plan.minAmount || 0)}
              step="0.01"
              value={draft.amount}
              onChange={(e) => setDraft((prev) => ({ ...prev, amount: e.target.value }))}
            />
            <div className="plan-actions">
              <button className="primary-btn" onClick={confirmInvest} disabled={submitting}>
                {submitting ? 'Processing...' : 'Done / Invest'}
              </button>
              <button className="mini-btn" onClick={() => setDraft(null)} disabled={submitting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default InvestmentPlansPage
