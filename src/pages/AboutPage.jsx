import { CheckCircle2, CircleDollarSign, HandCoins, ShieldCheck, Target, Users } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'

function AboutPage() {
  const { investmentPlans } = useAppContext()

  return (
    <section className="page-grid about-page">
      <div className="glass-card about-hero">
        <span className="pill-badge">About Horizoneinvest</span>
        <h2 className="page-title">Your trusted ecosystem for structured online investing</h2>
        <p className="muted">
          Horizoneinvest is designed to give users a clear path from choosing plans to tracking earnings,
          managing referrals, and withdrawing funds. The platform combines a simple user experience with
          transparent investment data so users always understand what they are doing.
        </p>
      </div>

      <div className="about-grid">
        <article className="glass-card about-card">
          <div className="about-card-title">
            <Target size={18} />
            <h3>Project Mission</h3>
          </div>
          <p className="muted">
            The mission is to make digital investing easier, more transparent, and more actionable for every
            user. Instead of confusing dashboards, Horizoneinvest focuses on clear numbers and guided actions.
          </p>
          <ul className="about-list">
            <li>
              <CheckCircle2 size={14} />
              Easy onboarding with secure login and persistent sessions
            </li>
            <li>
              <CheckCircle2 size={14} />
              Live tracking for deposits, investments, earnings, and withdrawals
            </li>
            <li>
              <CheckCircle2 size={14} />
              Clear referral structure for network-based earning opportunities
            </li>
          </ul>
        </article>

        <article className="glass-card about-card">
          <div className="about-card-title">
            <ShieldCheck size={18} />
            <h3>How The Platform Works</h3>
          </div>
          <ol className="about-steps">
            <li>
              <strong>Create account:</strong> register, complete your profile, and access your dashboard.
            </li>
            <li>
              <strong>Fund wallet:</strong> submit a deposit request through available payment methods.
            </li>
            <li>
              <strong>Choose plan:</strong> pick the plan that matches your amount and duration goals.
            </li>
            <li>
              <strong>Track performance:</strong> monitor progress, accrued earnings, and maturity timeline.
            </li>
            <li>
              <strong>Withdraw earnings:</strong> transfer available earnings to wallet and request withdrawals.
            </li>
          </ol>
        </article>
      </div>

      <div className="glass-card about-section">
        <h3>Our Ecosystem & Investment Verticals</h3>
        <p className="muted">
          At Horizoneinvest, our strength lies in our diversified investment ecosystem. We don’t just rely on a single asset class; instead, we strategically allocate our investors' capital across three distinct, highly profitable, and sustainable verticals. This multi-sector approach ensures that our portfolio remains resilient against market volatility while generating consistent, high-yield returns.
        </p>

        <div className="verticals-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '2rem' }}>

          <article className="glass-card vertical-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ width: '100%', height: '300px', position: 'relative' }}>
              <img src="/images/worker_site.png" alt="Industrial Infrastructure" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '2rem 1.5rem', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Target size={24} className="text-primary" />
                  <h4 style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>Industrial & Real Estate Infrastructure</h4>
                </div>
              </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p className="muted mb-4" style={{ lineHeight: '1.6' }}>
                Real-world assets form the bedrock of our stable investment strategy. We actively deploy capital into large-scale construction projects, commercial real estate developments, and essential public infrastructure. By participating in these physical, tangible projects globally, we bridge the gap between digital investments and real-world value creation.
              </p>
              <ul className="about-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>
                  <CheckCircle2 size={14} className="text-primary" />
                  <strong>Tangible Asset Backing:</strong> Investments are secured against physical properties and infrastructure, reducing downside risk.
                </li>
                <li>
                  <CheckCircle2 size={14} className="text-primary" />
                  <strong>Long-Term Appreciation:</strong> Commercial real estate historically provides excellent inflation hedging and steady capital appreciation.
                </li>
                <li>
                  <CheckCircle2 size={14} className="text-primary" />
                  <strong>Cash Flow Generation:</strong> Revenue streams from commercial leases and completed development sales fuel continuous daily returns.
                </li>
              </ul>
            </div>
          </article>

          <article className="glass-card vertical-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ width: '100%', height: '300px', position: 'relative' }}>
              <img src="/images/crypto_trading.png" alt="Crypto Trading" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '2rem 1.5rem', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CircleDollarSign size={24} className="text-primary" />
                  <h4 style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>Quantitative Crypto Trading</h4>
                </div>
              </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p className="muted mb-4" style={{ lineHeight: '1.6' }}>
                The cryptocurrency market presents unparalleled opportunities for aggressive growth. Our dedicated quantitative trading desk utilizes proprietary algorithms, AI-driven market analysis, and high-frequency trading (HFT) bots to exploit market inefficiencies across top-tier digital assets (Bitcoin, Ethereum, etc.) 24/7.
              </p>
              <ul className="about-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>
                  <CheckCircle2 size={14} className="text-primary" />
                  <strong>Algorithmic Precision:</strong> Removing emotion from trading, our systems execute thousands of micro-trades daily to capture small, consistent profit margins.
                </li>
                <li>
                  <CheckCircle2 size={14} className="text-primary" />
                  <strong>Market-Neutral Strategies:</strong> Utilizing arbitrage and statistical arbitrage, we generate profits regardless of whether the market is trending up or down.
                </li>
                <li>
                  <CheckCircle2 size={14} className="text-primary" />
                  <strong>High Liquidity & Scalability:</strong> Crypto markets never sleep, allowing us to compound earnings daily and maintain optimal liquidity for investor withdrawals.
                </li>
              </ul>
            </div>
          </article>

          <article className="glass-card vertical-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ width: '100%', height: '300px', position: 'relative' }}>
              <img src="/images/solar_energy.png" alt="Solar Energy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '2rem 1.5rem', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ShieldCheck size={24} className="text-primary" />
                  <h4 style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>Renewable Solar Energy</h4>
                </div>
              </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p className="muted mb-4" style={{ lineHeight: '1.6' }}>
                We believe the most profitable investments are those that build a better future. By allocating substantial capital toward the development and expansion of utility-scale solar farms globally, we tap into a heavily incentivized, rapidly growing market. Renewable energy provides incredibly stable, predictable yields over decadal timelines.
              </p>
              <ul className="about-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>
                  <CheckCircle2 size={14} className="text-primary" />
                  <strong>Government Incentives & Subsidies:</strong> Benefitting from global green-energy initiatives, tax credits, and carbon offset programs.
                </li>
                <li>
                  <CheckCircle2 size={14} className="text-primary" />
                  <strong>Power Purchase Agreements (PPAs):</strong> Ensuring guaranteed revenue through long-term contracts to supply generated electricity to governments and heavy industries.
                </li>
                <li>
                  <CheckCircle2 size={14} className="text-primary" />
                  <strong>Sustainable ESG Impact:</strong> Offering our investors a way to earn substantial passive income while directly contributing to the reduction of global carbon footprints.
                </li>
              </ul>
            </div>
          </article>

        </div>
      </div>

      <div className="glass-card about-section" style={{ marginTop: '2rem' }}>
        <h3>Available Investment Plans</h3>
        <p className="muted">
          Plan data below is loaded from your current configured plans in admin. This keeps the About page
          always updated whenever plan values are edited.
        </p>

        <div className="about-plan-grid">
          {investmentPlans.length ? (
            investmentPlans.map((plan) => (
              <article key={plan.id} className="about-plan-card">
                <div className="about-card-title">
                  <CircleDollarSign size={16} />
                  <h4>{plan.name}</h4>
                </div>
                <p className="muted small">
                  Daily Return: <strong>{plan.dailyReturn}%</strong> | Total Return:{' '}
                  <strong>{plan.totalReturn}%</strong>
                </p>
                <p className="muted small">
                  Amount Range: <strong>${plan.minAmount}</strong> to{' '}
                  <strong>{plan.maxAmount === null ? 'Unlimited' : `$${plan.maxAmount}`}</strong>
                </p>
                <p className="muted small">
                  Duration: <strong>{plan.durationDays} days</strong>
                </p>
              </article>
            ))
          ) : (
            <p className="muted">No plans are available yet.</p>
          )}
        </div>
      </div>

      <div className="about-grid">
        <article className="glass-card about-card">
          <div className="about-card-title">
            <Users size={18} />
            <h3>Referral & Community Growth</h3>
          </div>
          <p className="muted">
            Users can grow earnings through referrals. The referral tree and commission structure pages allow
            users to see their network, track levels, and review referral-based revenue clearly.
          </p>
        </article>

        <article className="glass-card about-card">
          <div className="about-card-title">
            <HandCoins size={18} />
            <h3>Important Note</h3>
          </div>
          <p className="muted">
            All investment activities involve risk. Users should invest responsibly, review plan conditions
            before investing, and use only funds they can afford to manage with market uncertainty.
          </p>
        </article>
      </div>
    </section>
  )
}

export default AboutPage
