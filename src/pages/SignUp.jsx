import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import './Auth.css'

const SignUp = () => {
  const navigate = useNavigate()
  const { signUpNewUser } = UserAuth()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setLoading(true)

    try {
      const { success, error: authError, data } = await signUpNewUser(email, password, {
        full_name: name,
      })

      if (!success) {
        setError(authError?.message ?? 'Unable to create account')
        return
      }

      if (data?.session) {
        navigate('/dashboard')
        return
      }

      setError('Account created. Please check your email to confirm your account, then sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="signup-title">
        <h1 id="signup-title">Sign Up</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            placeholder="example@something.com"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            name="name"
            type="text"
            placeholder="Enter your first name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <label htmlFor="signup-password">Create password</label>
          <input
            id="signup-password"
            name="password"
            type="password"
            placeholder="************"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <label htmlFor="signup-confirm-password">Confirm password</label>
          <input
            id="signup-confirm-password"
            name="confirmPassword"
            type="password"
            placeholder="************"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Press Here'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>

        <p className="auth-back">
          <Link to="/">Back to Home</Link>
        </p>
      </section>
    </main>
  )
}

export default SignUp
