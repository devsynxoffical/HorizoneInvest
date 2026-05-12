import { useEffect, useState } from 'react'
import {
  Bell,
  Camera,
  Eye,
  EyeOff,
  Lock,
  Save,
  Shield,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAppContext } from '../context/AppContext.jsx'

function SettingsPage() {
  const { user, updateProfile, changePassword, setTwoFactor, updateNotifications } = useAppContext()
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    password: '',
    currentPassword: '',
    confirmPassword: '',
    paymentDetails: 'Meezan Bank - **** 3498',
    twoFactorEnabled: user.isTwoFactorEnabled,
  })
  const [message, setMessage] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    email: user.settings?.emailNotifications ?? true,
    sms: user.settings?.smsNotifications ?? false,
    investments: user.settings?.investmentUpdates ?? true,
    referrals: user.settings?.referralActivity ?? true,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: user.name,
      email: user.email,
      phone: user.phone,
      twoFactorEnabled: user.isTwoFactorEnabled,
    }))
    setNotifications({
      email: user.settings?.emailNotifications ?? true,
      sms: user.settings?.smsNotifications ?? false,
      investments: user.settings?.investmentUpdates ?? true,
      referrals: user.settings?.referralActivity ?? true,
    })
  }, [user])

  const handleNotificationToggle = async (key) => {
    const next = { ...notifications, [key]: !notifications[key] }
    setNotifications(next)
    const response = await updateNotifications({
      emailNotifications: next.email,
      smsNotifications: next.sms,
      investmentUpdates: next.investments,
      referralActivity: next.referrals,
    })
    if (!response.ok) toast.error(response.message)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    const response = await updateProfile({
      name: form.name,
      email: form.email,
      phone: form.phone,
    })
    setSubmitting(false)
    if (response.ok) {
      setMessage('Settings saved successfully.')
      toast.success('Profile saved')
      return
    }
    setMessage(response.message)
    toast.error(response.message)
  }

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

  const Toggle = ({ checked, onClick }) => (
    <button type="button" onClick={onClick} className={`switch ${checked ? 'on' : ''}`}>
      <span />
    </button>
  )

  return (
    <section className="page-grid settings-page">
      <div className="glass-card settings-header">
        <h2 className="page-title">Settings</h2>
        <p className="muted">Manage your account settings and preferences.</p>
      </div>

      <form className="glass-card settings-section" onSubmit={handleSubmit}>
        <h3 className="section-title">
          <User size={16} /> Profile Information
        </h3>
        <div className="profile-top">
          <span className="profile-avatar">{initials}</span>
          <div>
            <button type="button" className="btn btn-outline btn-sm">
              <Camera size={14} /> Change Photo
            </button>
            <p className="muted small">JPG, PNG or GIF. Max size 2MB.</p>
          </div>
        </div>
        <div className="two-col-grid">
          <div>
            <label>Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label>Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>
          <div>
            <label>Country</label>
            <input value="Pakistan" readOnly />
          </div>
        </div>
        <button className="btn btn-primary settings-action-btn" type="submit" disabled={submitting}>
          <Save size={16} /> Save Changes
        </button>
        {message ? <p className="alert">{message}</p> : null}
      </form>

      <div className="glass-card settings-section">
        <h3 className="section-title">
          <Lock size={16} /> Security
        </h3>
        <label>Current Password</label>
        <div className="password-row">
          <input
            type={showCurrentPassword ? 'text' : 'password'}
            placeholder="Enter current password"
            value={form.currentPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
          />
          <button type="button" className="password-eye" onClick={() => setShowCurrentPassword((s) => !s)}>
            {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        <label>New Password</label>
        <div className="password-row">
          <input
            type={showNewPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          <button type="button" className="password-eye" onClick={() => setShowNewPassword((s) => !s)}>
            {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <label>Confirm New Password</label>
        <input
          type="password"
          placeholder="Confirm new password"
          value={form.confirmPassword}
          onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
        />
        <button
          className="btn btn-cyan settings-action-btn"
          type="button"
          onClick={async () => {
            if (!form.password || form.password.length < 8) {
              toast.error('New password must be at least 8 characters.')
              return
            }
            if (!form.currentPassword) {
              toast.error('Enter your current password.')
              return
            }
            if (form.password !== form.confirmPassword) {
              toast.error('New password and confirm password do not match.')
              return
            }
            const response = await changePassword({
              currentPassword: form.currentPassword,
              newPassword: form.password,
            })
            if (response.ok) {
              toast.success(response.message)
              setForm((prev) => ({ ...prev, currentPassword: '', password: '', confirmPassword: '' }))
            } else toast.error(response.message)
          }}
        >
          <Lock size={15} /> Change Password
        </button>
      </div>

      <div className="glass-card settings-section">
        <h3 className="section-title">
          <Shield size={16} /> Two-Factor Authentication
        </h3>
        <div className="switch-card">
          <div>
            <strong>Enable 2FA</strong>
            <p className="muted">Add an extra layer of security to your account</p>
          </div>
          <Toggle
            checked={form.twoFactorEnabled}
            onClick={async () => {
              const next = !form.twoFactorEnabled
              setForm((prev) => ({ ...prev, twoFactorEnabled: next }))
              const response = await setTwoFactor(next)
              if (response.ok) toast.success(response.message)
              else toast.error(response.message)
            }}
          />
        </div>
      </div>

      <div className="glass-card settings-section">
        <h3 className="section-title">
          <Bell size={16} /> Notifications
        </h3>
        <div className="settings-notify-grid">
          {[
            {
              id: 'email',
              title: 'Email Notifications',
              desc: 'Receive updates via email',
            },
            {
              id: 'sms',
              title: 'SMS Notifications',
              desc: 'Receive updates via SMS',
            },
            {
              id: 'investments',
              title: 'Investment Updates',
              desc: 'Get notified about your investments',
            },
            {
              id: 'referrals',
              title: 'Referral Activity',
              desc: 'Get notified when someone joins via your link',
            },
          ].map((item) => (
            <article key={item.id} className="switch-card">
              <div>
                <strong>{item.title}</strong>
                <p className="muted">{item.desc}</p>
              </div>
              <Toggle
                checked={notifications[item.id]}
                onClick={() => handleNotificationToggle(item.id)}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SettingsPage
