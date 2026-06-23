import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { FiArrowLeft, FiLock, FiMail, FiShield } from 'react-icons/fi'
import { toast } from 'sonner'
import { useAppContext } from '../context/AppContext.jsx'

function ForgotPasswordPage() {
  const brandLogo = `${import.meta.env.BASE_URL}logo.png`
  const navigate = useNavigate()
  const { forgotPassword, resetPassword } = useAppContext()
  
  const [stage, setStage] = useState('email') // email, otp, new_password
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleRequestOTP = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const trimmed = email.trim().toLowerCase()
    setEmail(trimmed)
    const response = await forgotPassword(trimmed)
    setSubmitting(false)
    if (response.ok) {
      toast.success(response.message)
      // Same response for unknown emails (anti-enumeration); only advance when a code was actually sent.
      const ambiguous = String(response.message || '').toLowerCase().includes('if an account exists')
      if (!ambiguous) setStage('otp')
    } else {
      setError(response.message)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setSubmitting(true)
    setError('')
    const response = await resetPassword({ email, code: otpCode, newPassword })
    setSubmitting(false)
    if (response.ok) {
      toast.success(response.message)
      navigate('/login')
    } else {
      setError(response.message)
    }
  }

  return (
    <div className="auth-page premium-bg">
      <div className="orb orb-emerald" />
      <div className="orb orb-cyan" />
      
      <motion.div 
        className="auth-card glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '450px', margin: '0 auto' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img src={brandLogo} alt="Logo" style={{ height: '40px', marginBottom: '1rem' }} />
          <h3>{stage === 'email' ? 'Reset Password' : stage === 'otp' ? 'Verify Code' : 'New Password'}</h3>
          <p className="muted">
            {stage === 'email' 
              ? 'Enter your email to receive a password reset code.' 
              : stage === 'otp' 
              ? `We sent a code to ${email}`
              : 'Enter your new secure password.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {stage === 'email' && (
            <motion.form
              key="email-form"
              onSubmit={handleRequestOTP}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <label>Email Address</label>
              <div className="input-wrap">
                <FiMail size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <p className="error-text">{error}</p>}
              <button type="submit" className="btn-primary full-width" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Reset Code'}
              </button>
            </motion.form>
          )}

          {stage === 'otp' && (
            <motion.div
              key="otp-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <label>6-Digit Code</label>
              <div className="input-wrap">
                <FiShield size={18} />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              {error && <p className="error-text">{error}</p>}
              <button
                type="button"
                className="btn-primary full-width"
                onClick={() => otpCode.length === 6 && setStage('new_password')}
                disabled={otpCode.length !== 6}
              >
                Continue
              </button>
              <button
                type="button"
                className="btn-ghost full-width"
                style={{ marginTop: '0.5rem' }}
                onClick={() => {
                  setOtpCode('')
                  setError('')
                  setStage('email')
                }}
              >
                Change Email
              </button>
              <button
                type="button"
                className="btn btn-outline full-width"
                style={{ marginTop: '0.5rem' }}
                disabled={submitting}
                onClick={async () => {
                  setSubmitting(true)
                  setError('')
                  const response = await forgotPassword(email)
                  setSubmitting(false)
                  if (response.ok) toast.success(response.message)
                  else setError(response.message)
                }}
              >
                {submitting ? 'Sending…' : 'Resend code'}
              </button>
            </motion.div>
          )}

          {stage === 'new_password' && (
            <motion.form
              key="password-form"
              onSubmit={handleResetPassword}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <label>New Password</label>
              <div className="input-wrap">
                <FiLock size={18} />
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <label>Confirm Password</label>
              <div className="input-wrap">
                <FiLock size={18} />
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="error-text">{error}</p>}
              <button type="submit" className="btn-primary full-width" disabled={submitting}>
                {submitting ? 'Resetting...' : 'Update Password'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="auth-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/login" className="row inline center gap-2 muted hover-primary">
            <FiArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage
