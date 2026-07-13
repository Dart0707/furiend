import { useState, useEffect, useRef } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import './Dashboard.css'

// Vector SVGs matching Figma Image 3 Layout
const StarIcon = () => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2">
		<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
	</svg>
)

const PinIcon = () => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
		<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
		<circle cx="12" cy="10" r="3" />
	</svg>
)

const PhoneIcon = () => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
		<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
	</svg>
)

const ClockIcon = () => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
		<circle cx="12" cy="12" r="10" />
		<polyline points="12 6 12 12 16 14" />
	</svg>
)

const SearchIcon = () => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
		<circle cx="11" cy="11" r="8" />
		<line x1="21" y1="21" x2="16.65" y2="16.65" />
	</svg>
)

const FilterIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
		<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
	</svg>
)

const HeartIcon = ({ filled }) => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#EF4444" : "none"} stroke={filled ? "#EF4444" : "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
		<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
	</svg>
)

// Complete 8 Places directly from Figma Image 3 Mockups
const initialPlaces = [
	{
		id: 1,
		name: 'Coffee Project España',
		category: 'restaurant',
		rating: 4.6,
		reviewsCount: 142,
		address: 'España Boulevard, Sampaloc, Manila',
		phone: '(02) 8244-8888',
		hours: '7:00 AM - 11:00 PM',
		features: ['Aesthetic Interior', 'A/C Area', 'Pet Treats'],
		bannerColor: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)'
	},
	{
		id: 2,
		name: 'Basa Veterinary Clinic',
		category: 'veterinarian',
		rating: 4.8,
		reviewsCount: 75,
		address: 'A.H. Lacson Ave, Sampaloc, Manila',
		phone: '(02) 8731-1234',
		hours: '9:00 AM - 6:00 PM',
		features: ['Consultations', 'Deworming', 'Vaccines'],
		bannerColor: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)'
	},
	{
		id: 3,
		name: 'Pet Express SM San Lazaro',
		category: 'pet-store',
		rating: 4.7,
		reviewsCount: 203,
		address: 'SM City San Lazaro, Lacson Ave, Manila',
		phone: '(02) 8740-9999',
		hours: '10:00 AM - 9:00 PM',
		features: ['Pet Grooming', 'Premium Food', 'Pet Toys'],
		bannerColor: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)'
	},
	{
		id: 4,
		name: 'The Barn Manila (Dapitan)',
		category: 'restaurant',
		rating: 4.5,
		reviewsCount: 188,
		address: 'Dapitan St, Sampaloc, Manila',
		phone: '(0917) 123-4567',
		hours: '8:00 AM - 10:00 PM',
		features: ['Student Friendly', 'Water Bowls', 'Wi-Fi'],
		bannerColor: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)'
	},
	{
		id: 5,
		name: 'Lacson Animal Care Clinic',
		category: 'veterinarian',
		rating: 4.6,
		reviewsCount: 94,
		address: 'A.H. Lacson Ave, Sampaloc, Manila',
		phone: '(02) 8781-5678',
		hours: '8:00 AM - 7:00 PM',
		features: ['24/7 Emergency', 'Pet Boarding', 'Surgery'],
		bannerColor: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)'
	},
	{
		id: 6,
		name: 'Dapitan Pet Depot & Grooming',
		category: 'pet-store',
		rating: 4.4,
		reviewsCount: 56,
		address: 'Dapitan St, Sampaloc, Manila',
		phone: '(0922) 888-2233',
		hours: '9:00 AM - 7:00 PM',
		features: ['Dog Grooming', 'Pet Supplies', 'Affordable'],
		bannerColor: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
	},
	{
		id: 7,
		name: 'UST P. Noval Food Park (Pet Area)',
		category: 'restaurant',
		rating: 4.7,
		reviewsCount: 298,
		address: 'P. Noval St, Sampaloc, Manila',
		phone: 'N/A',
		hours: '11:00 AM - 10:00 PM',
		features: ['Outdoor Seating', 'Budget Friendly', 'Social Area'],
		bannerColor: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
	},
	{
		id: 8,
		name: 'Sampaloc Veterinary Hospital',
		category: 'veterinarian',
		rating: 4.5,
		reviewsCount: 112,
		address: 'G. Tolentino St (near España), Sampaloc, Manila',
		phone: '(02) 8741-2345',
		hours: '9:00 AM - 6:00 PM',
		features: ['X-Ray & Lab', 'Pharmacy', 'Pet Food'],
		bannerColor: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
	}
]

const Places = () => {
	const navigate = useNavigate()
	const { session, loading, signOutUser } = UserAuth()
	const [showDropdown, setShowDropdown] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('all')
	const [selectedLocation, setSelectedLocation] = useState('all')
	const [favorites, setFavorites] = useState(() => {
		const stored = localStorage.getItem('furiend-favorites')
		return stored ? JSON.parse(stored) : []
	})
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

	const toggleFavorite = (placeId) => {
		setFavorites(prev => {
			const updated = prev.includes(placeId)
				? prev.filter(id => id !== placeId)
				: [...prev, placeId]
			localStorage.setItem('furiend-favorites', JSON.stringify(updated))
			return updated
		})
	}

	if (loading) {
		return (
			<div className="dashboard-container" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
				<div style={{ fontFamily: "'Carme', sans-serif", color: '#1B4332', fontSize: '18px', fontWeight: '700' }}>Loading...</div>
			</div>
		)
	}

	if (!session) {
		return <Navigate to="/signin" replace />
	}

	const userEmail = session.user.email
	const displayName = session.user?.user_metadata?.full_name || userEmail.split('@')[0]
	const formattedDisplayName = displayName.charAt(0).toUpperCase() + displayName.slice(1)
	const userInitials = displayName.slice(0, 2).toUpperCase()

	// Dynamic client-side filtering for Search, Categories and Locations
	const filteredPlaces = initialPlaces.filter(place => {
		const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			place.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
			place.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))

		const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory

		const matchesLocation = selectedLocation === 'all' || place.address.toLowerCase().includes(selectedLocation.toLowerCase())

		return matchesSearch && matchesCategory && matchesLocation
	})

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
			<main className="places-feed">
				<div className="places-header-section">
					<h1 className="places-main-title">Discover Pet-Friendly Places</h1>
					<p className="places-subtitle">Find restaurants, vets, and pet stores perfect for your furry friend</p>
				</div>

				{/* Search Container */}
				<div className="places-search-container">
					<div className="places-search-input-wrapper">
						<span className="places-search-icon">
							<SearchIcon />
						</span>
						<input 
							type="text" 
							placeholder="Search places, categories, features..." 
							className="places-search-input"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>

				{/* Filter & Counter Row */}
				<div className="places-controls-row">
					<div className="places-filters">
						<span className="places-filter-label">
							<FilterIcon />
							Filters:
						</span>
						<select 
							className="places-select"
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
						>
							<option value="all">All Categories</option>
							<option value="restaurant">Restaurant</option>
							<option value="veterinarian">Veterinarian</option>
							<option value="pet-store">Pet Store</option>
						</select>
						<select 
							className="places-select"
							value={selectedLocation}
							onChange={(e) => setSelectedLocation(e.target.value)}
						>
							<option value="all">All Locations</option>
							<option value="españa">España</option>
							<option value="dapitan">Dapitan</option>
							<option value="lacson">Lacson</option>
							<option value="p. noval">P. Noval</option>
							<option value="san lazaro">San Lazaro</option>
						</select>
					</div>
					<div className="places-count">
						Showing <strong>{filteredPlaces.length}</strong> places
					</div>
				</div>

				{/* Dynamic Places Grid */}
				<div className="places-grid">
					{filteredPlaces.map(place => {
						const isFav = favorites.includes(place.id)
						return (
							<article className="place-card" key={place.id}>
								<div 
									className="place-card-banner" 
									style={{ background: place.bannerColor }}
								>
									<button 
										type="button" 
										className={`place-fav-btn ${isFav ? 'active' : ''}`}
										onClick={() => toggleFavorite(place.id)}
										aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
									>
										<HeartIcon filled={isFav} />
									</button>
								</div>
								
								<div className="place-card-body">
									<span className={`place-badge ${place.category}`}>
										{place.category === 'pet-store' ? 'Pet Store' : place.category}
									</span>
									
									<h2 className="place-title">{place.name}</h2>
									
									<div className="place-rating-row">
										<StarIcon />
										<strong>{place.rating}</strong>
										<span>({place.reviewsCount} reviews)</span>
									</div>
									
									<p className="place-description">
										Explore pet friendly {place.category} locations with options suited for both pets and owners! Enjoy quality time here.
									</p>
									
									<div className="place-info-list">
										<div className="place-info-item">
											<span className="place-info-icon"><PinIcon /></span>
											<span>{place.address}</span>
										</div>
										<div className="place-info-item">
											<span className="place-info-icon"><PhoneIcon /></span>
											<span>{place.phone}</span>
										</div>
										<div className="place-info-item">
											<span className="place-info-icon"><ClockIcon /></span>
											<span>{place.hours}</span>
										</div>
									</div>
									
									<div className="place-features-list">
										{place.features.map((feature, idx) => (
											<span className="place-feature-tag" key={idx}>{feature}</span>
										))}
									</div>
									
									<button 
										type="button" 
										className="place-btn"
										onClick={() => alert(`Opening details for ${place.name}...`)}
									>
										View Details
									</button>
								</div>
							</article>
						)
					})}
				</div>

				{/* Empty State */}
				{filteredPlaces.length === 0 && (
					<div className="place-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#8A8A8A', marginTop: '20px' }}>
						<p style={{ fontFamily: "'Carme', sans-serif", fontSize: '16px', margin: '0 0 10px 0' }}>
							No places found matching your filters.
						</p>
						<p style={{ fontFamily: "'Carme', sans-serif", fontSize: '14px', margin: 0, opacity: 0.8 }}>
							Try searching for something else or resetting your filters!
						</p>
					</div>
				)}
			</main>
		</div>
	)
}

export default Places
