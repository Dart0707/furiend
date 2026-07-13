import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { UserAuth } from '../context/AuthContext'
import './Auth.css'

const SignUp = () => {
  const navigate = useNavigate()
  const { signUpNewUser } = UserAuth()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [otpToken, setOtpToken] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [sentOtp, setSentOtp] = useState('')

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => {
      setResendCooldown(prev => prev - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prevShowPassword) => !prevShowPassword)
  }

  const sendEmailCode = async (toEmail, toName, code) => {
    // Calculate expiration time (15 minutes from now)
    const now = new Date()
    const expiration = new Date(now.getTime() + 15 * 60 * 1000)
    const expirationTimeStr = expiration.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    console.log(`[Furiend Email Service] Sending OTP to ${toEmail}: ${code}`)

    try {
      const data = {
        service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID,
        template_id: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        user_id: import.meta.env.VITE_EMAILJS_USER_ID,
        template_params: {
          email: toEmail,
          name: toName,
          passcode: code,
          time: expirationTimeStr
        }
      }

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`EmailJS Error (${response.status}): ${errorText}`)
      }

      console.log('Verification email dispatched successfully via EmailJS!')
    } catch (err) {
      console.warn('Real email dispatcher failed, displaying simulated fallback:', err.message)
      // Fallback so developers can always bypass even if their EmailJS keys are not configured yet
      alert(`[Furiend Verification Simulator]\n\nAn email is being simulated for ${toName} (${toEmail})\n\nVerification Code: ${code}\nExpires at: ${expirationTimeStr}`)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setLoading(true)

    try {
      // 1. Generate 6-digit code in the client
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
      setSentOtp(generatedCode)

      // 2. Trigger email helper
      await sendEmailCode(email, name, generatedCode)

      // 3. Open OTP entry screen
      setShowOtp(true)
      setResendCooldown(60) // Start rate limit timer
    } catch (err) {
      setError('Failed to initiate sign up: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (event) => {
    event.preventDefault()
    if (otpToken.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    // Check OTP in client before creating the account!
    if (otpToken !== sentOtp) {
      setError('Invalid verification code. Please check the code and try again.')
      return
    }

    setError('')
    setLoading(true)

    try {
      // 4. Create account in Supabase ONLY when OTP is verified!
      const { success, error: authError, data } = await signUpNewUser(email, password, {
        full_name: name,
      })

      if (!success) {
        setError(authError?.message ?? 'Unable to create account')
        return
      }

      // Automatically logs in and routes to newsfeed since Confirm Email is disabled in Supabase
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return

    setError('')
    setLoading(true)
    try {
      // Generate and send new OTP
      const newGeneratedCode = Math.floor(100000 + Math.random() * 900000).toString()
      setSentOtp(newGeneratedCode)
      await sendEmailCode(email, name, newGeneratedCode)

      setResendCooldown(60)
    } catch (err) {
      setError('Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  if (showOtp) {
    return (
      <main className="auth-page">
        <section className="auth-card" aria-labelledby="verify-title">
          <h1 id="verify-title">Verify Email</h1>
          <p className="auth-instructions" style={{ fontFamily: 'Carme, sans-serif', fontSize: '14px', color: '#666', marginBottom: '20px', lineHeight: '1.5', textAlign: 'center' }}>
            We've sent a 6-digit verification code to <strong>{email}</strong>. Please enter the code below to activate your account.
          </p>

          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <label htmlFor="otp-code">Verification Code</label>
            <input
              id="otp-code"
              name="otpCode"
              type="text"
              pattern="\d*"
              maxLength="6"
              placeholder="123456"
              required
              value={otpToken}
              onChange={(event) => setOtpToken(event.target.value)}
              style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
            />

            {error ? <p className="auth-error">{error}</p> : null}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Didn't get the code?{' '}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || loading}
              style={{
                background: 'none',
                border: 'none',
                color: resendCooldown > 0 ? '#8A8A8A' : '#1B4332',
                fontWeight: 'bold',
                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                padding: 0,
                textDecoration: resendCooldown > 0 ? 'none' : 'underline'
              }}
            >
              {resendCooldown > 0 ? `Resend Code (in ${resendCooldown}s)` : 'Resend Code'}
            </button>
          </p>

          <p className="auth-back">
            <button type="button" onClick={() => setShowOtp(false)} style={{ background: 'none', border: 'none', color: '#8A8A8A', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Go Back</button>
          </p>
        </section>
      </main>
    )
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

          <label htmlFor="signup-name">Username</label>
          <input
            id="signup-name"
            name="name"
            type="text"
            placeholder="Enter your username"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <label htmlFor="signup-password">Create password</label>
          <div className="password-field">
            <input
              id="signup-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="************"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <label htmlFor="signup-confirm-password">Confirm password</label>
          <div className="password-field">
            <input
              id="signup-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="************"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={toggleConfirmPasswordVisibility}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Submit'}
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
