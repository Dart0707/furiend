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
		<main className="auth-page dashboard-page">
			<section className="auth-card dashboard-card" aria-labelledby="dashboard-title">
				<h1 id="dashboard-title" className="dashboard-title">
					Dashboard
				</h1>
				<p className="dashboard-email">Signed in as {session.user.email}</p>
				<button className="dashboard-signout" type="button" onClick={handleSignOut}>
					Sign Out
				</button>
			</section>
		</main>
	)
}

export default Dashboard
