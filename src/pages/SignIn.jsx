import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import './Auth.css'

const SignIn = () => {
  const navigate = useNavigate()
  const { signInUser } = UserAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const { success, error: authError } = await signInUser(email, password)

      if (!success) {
        setError(authError?.message ?? 'Unable to sign in')
        return
      }

      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="signin-title">
        <h1 id="signin-title">Login?</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="signin-email">Email</label>
          <input
            id="signin-email"
            name="email"
            type="email"
            placeholder="example@something.com"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="signin-password">Password</label>
          <input
            id="signin-password"
            name="password"
            type="password"
            placeholder="************"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Press Here'}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>

        <p className="auth-back">
          <Link to="/">Back to Home</Link>
        </p>
      </section>
    </main>
  )
}

export default SignIn
