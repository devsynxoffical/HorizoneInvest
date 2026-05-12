import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  FiArrowRight,
  FiGift,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from 'react-icons/fi'
import { RiBarChartLine, RiMoneyDollarCircleLine, RiShieldCheckLine } from 'react-icons/ri'
import { toast } from 'sonner'
import { useAppContext } from '../context/AppContext.jsx'
import { getSupportedSocialLinks } from '../lib/socialPlatforms.js'

function SignUpPage() {
  const brandLogo = `${import.meta.env.BASE_URL}logo.png`
  const navigate = useNavigate()
  const { signup, sendOTP, socialLinks } = useAppContext()
  const supportedSocialLinks = getSupportedSocialLinks(socialLinks)
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1) // 1: Info, 2: OTP
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    referralCode: searchParams.get('ref') || '',
    otp: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    
    if (step === 1) {
      if (form.password.length < 8) {
        setError('Password must be at least 8 characters.')
        return
      }
      setSubmitting(true)
      const response = await sendOTP(form.email)
      setSubmitting(false)
      if (response.ok) {
        toast.success(response.message)
        setStep(2)
      } else {
        setError(response.message)
      }
      return
    }

    // Step 2: Register
    if (form.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.')
      return
    }

    setSubmitting(true)
    const response = await signup(form)
    setSubmitting(false)
    if (response.ok) {
      toast.success(response.message)
      navigate('/dashboard')
      return
    }
    setError(response.message)
  }

  return (
    <div className="auth-page premium-bg signup-page">
      <div className="orb orb-cyan" />
      <div className="orb orb-emerald" />
      <div className="auth-grid">
        <motion.section
          className="brand-pane"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="brand-lockup">
            <img className="brand-logo-full" src={brandLogo} alt="HorizoneInvest" />
          </div>
          <h2>
            Start Your <span>Investment Journey</span>
          </h2>
          <div className="benefit-grid">
            <article className="glass-card benefit-item">
              <RiMoneyDollarCircleLine size={17} />
              <span>Smart plan matching</span>
            </article>
            <article className="glass-card benefit-item">
              <FiGift size={16} />
              <span>Referral commissions</span>
            </article>
            <article className="glass-card benefit-item">
              <RiShieldCheckLine size={17} />
              <span>Secure infrastructure</span>
            </article>
            <article className="glass-card benefit-item">
              <RiBarChartLine size={17} />
              <span>Live performance tracking</span>
            </article>
          </div>
          {supportedSocialLinks.length ? (
            <div className="auth-social-links">
              {supportedSocialLinks.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noreferrer" aria-label={link.label} title={link.label}>
                  <link.Icon size={15} />
                </a>
              ))}
            </div>
          ) : null}
        </motion.section>
        <motion.form
          className="auth-card glass-card"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>{step === 1 ? 'Create Account' : 'Verify Email'}</h3>
          <p className="muted">
            {step === 1 
              ? 'Start earning with HorizonInvest today.' 
              : `We've sent a 6-digit code to ${form.email}`}
          </p>

          {step === 1 ? (
            <>
              <label>Full Name</label>
              <div className="input-wrap cyan">
                <FiUser size={17} />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <label>Email</label>
              <div className="input-wrap cyan">
                <FiMail size={17} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <label>Phone Number</label>
              <div className="input-wrap cyan">
                <FiPhone size={17} />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>

              <label>Password</label>
              <div className="input-wrap cyan">
                <FiLock size={17} />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <label>Referral Code (optional)</label>
              <div className="input-wrap cyan">
                <FiGift size={17} />
                <input
                  type="text"
                  value={form.referralCode}
                  onChange={(e) => setForm((prev) => ({ ...prev, referralCode: e.target.value }))}
                />
              </div>
            </>
          ) : (
            <>
              <label>Enter 6-Digit OTP</label>
              <div className="input-wrap cyan">
                <FiLock size={17} />
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={form.otp}
                  onChange={(e) => setForm((prev) => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                  required
                />
              </div>
              <p className="muted center" style={{ marginTop: '10px' }}>
                Didn't receive code? <button type="button" className="btn-link" onClick={() => setStep(1)} style={{ color: 'var(--cyan-primary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}>Edit email</button>
              </p>
            </>
          )}

          <p className="muted">By signing up, you agree to Terms and Privacy Policy.</p>
          {error ? <p className="alert alert-error">{error}</p> : null}

          <button className="btn btn-cyan" type="submit" disabled={submitting}>
            {submitting 
              ? (step === 1 ? 'Sending...' : 'Verifying...') 
              : (step === 1 ? 'Create Account' : 'Verify & Register')} 
            <FiArrowRight size={15} />
          </button>
          <p className="muted center">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </motion.form>
      </div>
    </div>
  )
}

export default SignUpPage
