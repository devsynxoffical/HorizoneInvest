import { useState } from 'react'
import { toast } from 'sonner'
import { useAdmin } from '../state/AdminContext.jsx'

function LoginPage() {
  const brandLogo = `${import.meta.env.BASE_URL}logo.png`
  const { login } = useAdmin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    const result = await login({ email, password })
    setLoading(false)
    if (result.ok) toast.success(result.message)
    else toast.error(result.message)
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <img className="admin-login-logo" src={brandLogo} alt="HorizoneInvest" />
        <h2>
          Admin Login
        </h2>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="primary-btn" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
