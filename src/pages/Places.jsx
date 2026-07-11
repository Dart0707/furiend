import { useState, useEffect, useRef } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import './Dashboard.css'

const initialPlaces = [
	{
		id: 1,
		name: 'Central Bark Park',
		category: 'Park',
		rating: '4.8 ★',
		address: '123 Meadow Lane, Green City',
		description: 'A large, fully fenced off-leash dog park with water stations, agility equipment, and shaded seating areas for humans.'
	},
	{
		id: 2,
		name: 'Paws & Cup Cafe',
		category: 'Cafe',
		rating: '4.9 ★',
		address: '456 Bean Boulevard, Uptown',
		description: 'Super pet-friendly coffee shop serving artisanal drinks for you and complimentary "pupcups" (whipped cream) for your dog.'
	},
	{
		id: 3,
		name: 'Happy Tails Veterinary Clinic',
		category: 'Vet',
		rating: '4.7 ★',
		address: '789 Wellness Road, Heights',
		description: 'Highly trusted full-service pet hospital offering routine checkups, emergency care, and friendly, caring staff.'
	}
]

const Places = () => {
	const navigate = useNavigate()
	const { session, signOutUser } = UserAuth()
	const [showDropdown, setShowDropdown] = useState(false)
	const dropdownRef = useRef(null)

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setShowDropdown(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const handleSignOut = async () => {
		await signOutUser()
		navigate('/signin')
	}

	if (!session) {
		return <Navigate to="/signin" replace />
	}

	const userEmail = session.user.email
	const displayName = session.user?.user_metadata?.full_name || userEmail.split('@')[0]
	const formattedDisplayName = displayName.charAt(0).toUpperCase() + displayName.slice(1)
	const userInitials = displayName.slice(0, 2).toUpperCase()

	return (
		<div className="dashboard-container">
			{/* Top Header */}
			<header className="dashboard-header">
				<Link className="header-logo" to="/">
					Furiend
				</Link>

				<nav className="header-nav">
					<Link className="header-nav-link" to="/dashboard">newsfeed</Link>
					<Link className="header-nav-link" to="/places" style={{ borderBottom: '2px solid #FAEDCD', paddingBottom: '4px' }}>places</Link>
				</nav>

				<div className="header-profile" ref={dropdownRef}>
					<span className="profile-name">{formattedDisplayName}</span>
					<button
						className="profile-avatar-btn"
						onClick={() => setShowDropdown(!showDropdown)}
						aria-label="Toggle user menu"
						type="button"
					>
						{userInitials}
					</button>

					{showDropdown && (
						<div className="profile-dropdown">
							<div className="dropdown-user-info">
								<span className="dropdown-email-label">Signed in as</span>
								<p className="dropdown-email">{userEmail}</p>
							</div>
							<button
								className="dropdown-btn"
								onClick={handleSignOut}
								type="button"
							>
								Sign Out
							</button>
						</div>
					)}
				</div>
			</header>

			{/* Main Feed Container */}
			<main className="dashboard-feed">
				<h1 style={{ fontFamily: "'Comfortaa', cursive", fontWeight: '700', fontSize: '28px', color: '#1B4332', marginBottom: '24px', textAlign: 'center' }}>
					Pet-Friendly Places
				</h1>

				{initialPlaces.map(place => (
					<section className="feed-card" key={place.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<h2 style={{ fontFamily: "'Niramit', sans-serif", fontWeight: '700', fontSize: '18px', color: '#1B4332', margin: 0 }}>
								{place.name}
							</h2>
							<span style={{ background: '#1B4332', color: '#FAEDCD', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontFamily: "'Niramit', sans-serif", fontWeight: '700' }}>
								{place.category}
							</span>
						</div>
						<div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#8A8A8A', fontFamily: "'Carme', sans-serif" }}>
							<span style={{ color: '#EAB308', fontWeight: '700' }}>{place.rating}</span>
							<span>•</span>
							<span>{place.address}</span>
						</div>
						<p style={{ fontFamily: "'Carme', sans-serif", fontSize: '14px', color: '#212529', margin: '6px 0 0 0', lineHeight: '1.5' }}>
							{place.description}
						</p>
					</section>
				))}
			</main>
		</div>
	)
}

export default Places
