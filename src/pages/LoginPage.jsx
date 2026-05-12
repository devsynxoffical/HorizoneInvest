import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useAppContext } from '../context/AppContext.jsx'
import { getSupportedSocialLinks } from '../lib/socialPlatforms.js'

function LoginPage() {
  const brandLogo = `${import.meta.env.BASE_URL}logo.png`
  const navigate = useNavigate()
  const { login, socialLinks } = useAppContext()
  const supportedSocialLinks = getSupportedSocialLinks(socialLinks)
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    const response = await login(form)
    setSubmitting(false)
    if (response.ok) {
      toast.success(response.message)
      navigate('/dashboard')
      return
    }
    toast.error(response.message)
  }

  return (
    <div className="auth-page premium-bg">
      <div className="orb orb-emerald" />
      <div className="orb orb-cyan" />
      <div className="auth-grid">
        <motion.section
          className="brand-pane"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="brand-lockup">
            <img className="brand-logo-full" src={brandLogo} alt="HorizoneInvest" />
          </div>
          <h2>
            Grow Your Wealth <span>with Smart Investing</span>
          </h2>
          <p>Join thousands of investors earning passive income through curated plans.</p>
          <ul className="feature-list">
            <li>Secure platform with advanced protection</li>
            <li>Transparent returns and tracking</li>
            <li>Referral rewards for community growth</li>
          </ul>
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
          <h3>Welcome Back</h3>
          <p className="muted">Sign in to your account</p>
          <label>Email</label>
          <div className="input-wrap">
            <Mail size={18} />
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <label>Password</label>
          <div className="input-wrap">
            <Lock size={18} />
            <input
              type="password"
              placeholder="********"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>
          <div className="row space-between">
            <span className="muted">Remember me</span>
            <Link to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'} <ArrowRight size={16} />
          </button>
          <div className="divider">
            <span>Or continue with</span>
          </div>
          <div className="social-row">
            <button type="button" className="btn btn-outline">
              Google
            </button>
            <button type="button" className="btn btn-outline">
              Facebook
            </button>
          </div>
          <p className="muted center">
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </motion.form>
      </div>
    </div>
  )
}

export default LoginPage
