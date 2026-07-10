import { Navigate, useNavigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'

const Dashboard = () => {
	const navigate = useNavigate()
	const { session, signOutUser } = UserAuth()

	const handleSignOut = async () => {
		await signOutUser()
		navigate('/signin')
	}

	if (!session) {
		return <Navigate to="/signin" replace />
	}

	return (
		<main className="auth-page">
			<section className="auth-card">
				<h1>Dashboard</h1>
				<p className="auth-switch">Signed in as {session.user.email}</p>
				<button type="button" onClick={handleSignOut}>
					Sign Out
				</button>
			</section>
		</main>
	)
}

export default Dashboard
