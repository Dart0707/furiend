import { useState, useEffect, useRef } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import { supabase } from '../supabaseclient'
import { Star, MapPin, Phone, Clock, Search, Filter, Heart } from 'lucide-react'
import './Dashboard.css'

const Places = () => {
	const navigate = useNavigate()
	const { session, loading, signOutUser } = UserAuth()
	const [places, setPlaces] = useState([])
	const [loadingPlaces, setLoadingPlaces] = useState(true)
	const [showDropdown, setShowDropdown] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('all')
	const [selectedLocation, setSelectedLocation] = useState('all')
	const [favorites, setFavorites] = useState(() => {
		try {
			const stored = localStorage.getItem('furiend-favorites')
			return stored ? JSON.parse(stored) : []
		} catch {
			return []
		}
	})
	const dropdownRef = useRef(null)

	useEffect(() => {
		const fetchPlaces = async () => {
			try {
				const { data, error } = await supabase
					.from('places')
					.select('*, place_reviews(rating)')
					.order('id', { ascending: true })
				if (error) throw error

				const processed = (data || []).map(place => {
					const reviewsList = place.place_reviews || []
					const count = reviewsList.length
					const avg = count > 0 ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1) : '0.0'
					return {
						...place,
						rating: parseFloat(avg),
						reviews_count: count
					}
				})
				setPlaces(processed)
			} catch (err) {
				console.error('Error fetching places:', err.message)
			} finally {
				setLoadingPlaces(false)
			}
		}
		fetchPlaces()
	}, [])

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
	const filteredPlaces = places.filter(place => {
		const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			place.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
			place.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))

		const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory

		const matchesLocation = selectedLocation === 'all' || (() => {
			const addressLower = place.address.toLowerCase()
			if (selectedLocation === 'quezon city') {
				return addressLower.includes('quezon city') || addressLower.includes(', qc') || addressLower.includes(' qc')
			}
			return addressLower.includes(selectedLocation.toLowerCase())
		})()

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
							<Search size={18} />
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
							<Filter size={16} style={{ marginRight: '6px' }} />
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
							<option value="hotel">Hotel</option>
						</select>
						<select
							className="places-select"
							value={selectedLocation}
							onChange={(e) => setSelectedLocation(e.target.value)}
						>
							<option value="all">All Cities</option>
							<option value="manila">Manila</option>
							<option value="quezon city">Quezon City</option>
							<option value="makati">Makati</option>
							<option value="pasig">Pasig</option>
							<option value="mandaluyong">Mandaluyong</option>
							<option value="san juan">San Juan</option>
						</select>
					</div>
					<div className="places-count">
						Showing <strong>{filteredPlaces.length}</strong> places
					</div>
				</div>

				{/* Dynamic Places Grid */}
				{loadingPlaces ? (
					<div className="places-grid">
						{[1, 2, 3].map(i => (
							<div className="place-card skeleton" key={i} style={{ height: '420px', opacity: 0.7 }}>
								<div className="place-card-banner" style={{ background: '#E2E8F0', height: '140px' }} />
								<div className="place-card-body" style={{ padding: '20px' }}>
									<div style={{ background: '#E2E8F0', height: '20px', width: '30%', marginBottom: '10px', borderRadius: '4px' }} />
									<div style={{ background: '#E2E8F0', height: '24px', width: '70%', marginBottom: '15px', borderRadius: '4px' }} />
									<div style={{ background: '#E2E8F0', height: '16px', width: '90%', marginBottom: '10px', borderRadius: '4px' }} />
									<div style={{ background: '#E2E8F0', height: '16px', width: '50%', marginBottom: '10px', borderRadius: '4px' }} />
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="places-grid">
						{filteredPlaces.map(place => {
							const isFav = favorites.includes(place.id)
							return (
								<article className="place-card" key={place.id}>
									<div
										className="place-card-banner"
										style={{ background: place.banner_color }}
									>
										<button
											type="button"
											className={`place-fav-btn ${isFav ? 'active' : ''}`}
											onClick={() => toggleFavorite(place.id)}
											aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
										>
											<Heart size={18} fill={isFav ? "#EF4444" : "none"} color={isFav ? "#EF4444" : "currentColor"} />
										</button>
									</div>

									<div className="place-card-body">
										<span className={`place-badge ${place.category}`}>
											{place.category === 'pet-store' ? 'Pet Store' : place.category.charAt(0).toUpperCase() + place.category.slice(1)}
										</span>

										<h2 className="place-title">{place.name}</h2>

										<div className="place-rating-row">
											<Star size={14} fill="#F59E0B" color="#F59E0B" />
											<strong>{place.rating}</strong>
											<span>({place.reviews_count} reviews)</span>
										</div>

										<p className="place-description">
											Explore pet friendly {place.category} locations with options suited for both pets and owners! Enjoy quality time here.
										</p>

										<div className="place-info-list">
											<div className="place-info-item">
												<span className="place-info-icon"><MapPin size={14} /></span>
												<span>{place.address}</span>
											</div>
											<div className="place-info-item">
												<span className="place-info-icon"><Phone size={14} /></span>
												<span>{place.phone}</span>
											</div>
											<div className="place-info-item">
												<span className="place-info-icon"><Clock size={14} /></span>
												<span>{place.hours}</span>
											</div>
										</div>

										<div className="place-features-list">
											{place.features.map((feature, idx) => (
												<span className="place-feature-tag" key={idx}>{feature}</span>
											))}
										</div>

										<Link
											to={`/places/${place.id}`}
											className="place-btn"
											style={{ textDecoration: 'none', display: 'block', boxSizing: 'border-box' }}
										>
											View Details
										</Link>
									</div>
								</article>
							)
						})}
					</div>
				)}

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
