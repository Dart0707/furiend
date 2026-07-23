import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import { supabase } from '../supabaseclient'
import { ArrowLeft, Star, MapPin, Phone, Clock, Heart } from 'lucide-react'
import './PlaceDetails.css'

const PlaceDetails = () => {
	const { id } = useParams()
	const navigate = useNavigate()
	const { session, loading, signOutUser } = UserAuth()
	const [place, setPlace] = useState(null)
	const [reviews, setReviews] = useState([])
	const [loadingPlace, setLoadingPlace] = useState(true)
	const [showDropdown, setShowDropdown] = useState(false)
	const dropdownRef = useRef(null)

	// Manage favorites synced to localStorage
	const [favorites, setFavorites] = useState(() => {
		const stored = localStorage.getItem('furiend-favorites')
		return stored ? JSON.parse(stored) : []
	})

	const [newReviewText, setNewReviewText] = useState('')
	const [newReviewRating, setNewReviewRating] = useState(5)
	const [hoverRating, setHoverRating] = useState(0)
	const [newReviewPet, setNewReviewPet] = useState('')

	// Booking Form State Management
	const [bookingDate, setBookingDate] = useState('')
	const [bookingTime, setBookingTime] = useState('')
	const [bookingHumans, setBookingHumans] = useState('2')
	const [bookingPetsCount, setBookingPetsCount] = useState('1')
	const [bookingPetSizes, setBookingPetSizes] = useState({ small: true, medium: false, large: false })
	const [bookingService, setBookingService] = useState('Consultation')
	const [bookingSuccess, setBookingSuccess] = useState(false)

	useEffect(() => {
		const fetchPlaceAndReviews = async () => {
			try {
				setLoadingPlace(true)
				// Fetch specific place
				const { data: placeData, error: placeError } = await supabase
					.from('places')
					.select('*')
					.eq('id', id)
					.single()

				if (placeError) throw placeError
				setPlace(placeData)

				// Fetch reviews
				const { data: reviewsData, error: reviewsError } = await supabase
					.from('place_reviews')
					.select('*')
					.eq('place_id', id)
					.order('created_at', { ascending: false })

				if (reviewsError) throw reviewsError
				setReviews(reviewsData || [])
			} catch (err) {
				console.error('Error fetching details from Supabase:', err.message)
			} finally {
				setLoadingPlace(false)
			}
		}
		if (id) {
			fetchPlaceAndReviews()
		}
	}, [id])

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
				? prev.filter(item => item !== placeId)
				: [...prev, placeId]
			localStorage.setItem('furiend-favorites', JSON.stringify(updated))
			return updated
		})
	}

	const handleAddReview = async (e) => {
		e.preventDefault()
		if (!newReviewText.trim()) return

		const displayName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Guest User'
		const capitalizedAuthor = displayName.charAt(0).toUpperCase() + displayName.slice(1)
		const petBreedStr = newReviewPet.trim() ? `${newReviewPet} Parent` : 'Pet Parent'
		const ratingInt = parseInt(newReviewRating, 10)

		// 1. Optimistic update (for smooth instant UI experience!)
		const tempId = Date.now()
		const optimisticReview = {
			id: tempId,
			author_name: capitalizedAuthor,
			pet_breed: petBreedStr,
			rating: ratingInt,
			comment: newReviewText,
			created_at: new Date().toISOString()
		}

		setReviews(prev => [optimisticReview, ...prev])
		const textToSave = newReviewText

		// Reset inputs
		setNewReviewText('')
		setNewReviewPet('')
		setNewReviewRating(5)

		try {
			// 2. Perform DB insert
			const { data, error } = await supabase
				.from('place_reviews')
				.insert({
					place_id: parseInt(id, 10),
					author_name: capitalizedAuthor,
					pet_breed: petBreedStr,
					rating: ratingInt,
					comment: textToSave
				})
				.select()

			if (error) throw error

			// 3. Swap the tempId with the real created database record
			if (data && data[0]) {
				const insertedReview = data[0]
				setReviews(prev => {
					const updated = prev.map(r => r.id === tempId ? insertedReview : r)

					// 4. Update the places table aggregates in Supabase
					const total = updated.length
					const avg = (updated.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)

					supabase
						.from('places')
						.update({
							rating: parseFloat(avg),
							reviews_count: total
						})
						.eq('id', id)
						.then(({ error: updateErr }) => {
							if (updateErr) console.error('Error updating place aggregates:', updateErr.message)
						})

					return updated
				})
			}
		} catch (err) {
			console.error('Error inserting review:', err.message)
			// Rollback if DB failed
			setReviews(prev => prev.filter(r => r.id !== tempId))
			alert('Failed to post review: ' + err.message)
		}
	}

	const handleBookingSubmit = async (e) => {
		e.preventDefault()
		if (!bookingDate || !bookingTime) return

		try {
			const { error } = await supabase
				.from('place_bookings')
				.insert({
					place_id: parseInt(id, 10),
					user_id: session.user.id,
					booking_date: bookingDate,
					booking_time: bookingTime,
					booking_service: place.category !== 'restaurant' ? bookingService : null,
					booking_humans: place.category === 'restaurant' ? bookingHumans : null,
					booking_pets: place.category === 'restaurant' ? bookingPetsCount : null,
					booking_sizes: place.category === 'restaurant' ? bookingPetSizes : null
				})

			if (error) throw error

			setBookingSuccess(true)
			setBookingDate('')
			setBookingTime('')
			setTimeout(() => setBookingSuccess(false), 8000)
		} catch (err) {
			console.error('Error inserting booking:', err.message)
			alert('Failed to register appointment: ' + err.message)
		}
	}

	if (loading || loadingPlace) {
		return (
			<div className="dashboard-container" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
				<div style={{ fontFamily: "'Carme', sans-serif", color: '#1B4332', fontSize: '18px', fontWeight: '700' }}>Loading Details...</div>
			</div>
		)
	}

	if (!session) {
		return <Navigate to="/signin" replace />
	}

	if (!place) {
		return (
			<div className="dashboard-container" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: '24px' }}>
				<div style={{ textAlign: 'center' }}>
					<h1 style={{ fontFamily: "'Comfortaa', cursive", color: '#1B4332', marginBottom: '16px' }}>Place Not Found</h1>
					<p style={{ fontFamily: "'Carme', sans-serif", color: '#666', marginBottom: '24px' }}>The requested location does not exist in Furiend.</p>
					<Link to="/places" className="place-btn" style={{ textDecoration: 'none', padding: '10px 20px' }}>Back to Places</Link>
				</div>
			</div>
		)
	}

	const userEmail = session.user.email
	const displayName = session.user?.user_metadata?.full_name || userEmail.split('@')[0]
	const formattedDisplayName = displayName.charAt(0).toUpperCase() + displayName.slice(1)
	const userInitials = displayName.slice(0, 2).toUpperCase()
	const isFav = favorites.includes(place.id)

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

			{/* Place Details Section */}
			<main className="details-container">
				<Link to="/places" className="details-back-link">
					<ArrowLeft size={18} style={{ marginRight: '6px' }} /> Back to places
				</Link>

				{/* Hero banner section */}
				<div className="details-hero" style={{ background: place.banner_color }}>
					<button
						type="button"
						className={`details-fav-btn ${isFav ? 'active' : ''}`}
						onClick={() => toggleFavorite(place.id)}
						aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
					>
						<Heart size={22} fill={isFav ? "#EF4444" : "none"} color={isFav ? "#EF4444" : "currentColor"} />
					</button>
				</div>

				<div className="details-layout">
					{/* Left Column: Basic details, Pet policy, Reviews */}
					<div className="details-left-col">
						<section className="details-main-card">
							<span className={`details-category-badge ${place.category}`}>
								{place.category === 'pet-store' ? 'Pet Store' : place.category.charAt(0).toUpperCase() + place.category.slice(1)}
							</span>
							<h1 className="details-title">{place.name}</h1>

							<div className="details-rating-row">
								<Star size={16} fill="#F59E0B" color="#F59E0B" />
								<strong>{reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}</strong>
								<span>({reviews.length} reviews)</span>
							</div>

							<p className="details-description">{place.description}</p>

							{/* Contacts and operating hours */}
							<div className="details-contact-info">
								<div className="contact-info-item">
									<span className="contact-info-icon"><MapPin size={16} /></span>
									<span>{place.address}</span>
								</div>
								<div className="contact-info-item">
									<span className="contact-info-icon"><Phone size={16} /></span>
									<span>{place.phone}</span>
								</div>
								<div className="contact-info-item">
									<span className="contact-info-icon"><Clock size={16} /></span>
									<span>{place.hours}</span>
								</div>
							</div>
						</section>

						{/* "Pet Pass" Policy Box */}
						<section className="details-section pet-policy-card">
							<h2 className="section-title">Furiend Pet Pass & Guidelines</h2>
							<div className="policy-grid">
								<div className="policy-item">
									<span className="policy-label">Allowed Areas:</span>
									<span className="policy-value">{place.pet_policy?.allowedAreas}</span>
								</div>
								<div className="policy-item">
									<span className="policy-label">Leash Requirement:</span>
									<span className="policy-value">{place.pet_policy?.leashRequired ? 'Required at all times' : 'Off-leash area allowed'}</span>
								</div>
								<div className="policy-item">
									<span className="policy-label">Pet Diaper:</span>
									<span className="policy-value">{place.pet_policy?.diaperRequired ? 'Required inside' : 'Optional / Not required'}</span>
								</div>
								<div className="policy-item">
									<span className="policy-label">Vaccination Card:</span>
									<span className="policy-value">{place.pet_policy?.vaccinesCheck ? 'Check at entry counter' : 'Not required for entry'}</span>
								</div>
								<div className="policy-item">
									<span className="policy-label">Dog Size Limit:</span>
									<span className="policy-value">{place.pet_policy?.sizeLimit}</span>
								</div>
							</div>

							<h3 className="policy-subheading">Available Pet Amenities</h3>
							<div className="policy-amenities-tags">
								{place.pet_policy?.amenities?.map((amenity, idx) => (
									<span className="amenity-tag" key={idx}>{amenity}</span>
								))}
							</div>
						</section>

						{/* Reviews Board */}
						<section className="details-section">
							<h2 className="section-title">Pet Parents Review Board</h2>

							{/* New Review Form */}
							<form className="add-review-form" onSubmit={handleAddReview}>
								<h3>Write a Review</h3>
								<div className="review-form-row">
									<div className="form-group">
										<label htmlFor="review-pet">Your Pet's Breed (e.g. Pug, Golden)</label>
										<input
											type="text"
											id="review-pet"
											placeholder="Pomeranian, Persian Cat, etc."
											value={newReviewPet}
											onChange={(e) => setNewReviewPet(e.target.value)}
										/>
									</div>
									<div className="form-group">
										<label style={{ display: 'block', marginBottom: '8px' }}>Rating</label>
										<div className="star-rating-input" style={{ display: 'flex', gap: '6px' }}>
											{[1, 2, 3, 4, 5].map((starValue) => {
												const isActive = starValue <= (hoverRating || newReviewRating)
												return (
													<button
														key={starValue}
														type="button"
														style={{
															background: 'none',
															border: 'none',
															cursor: 'pointer',
															padding: '2px',
															transition: 'transform 0.1s ease',
															transform: hoverRating === starValue ? 'scale(1.25)' : 'scale(1)'
														}}
														onClick={() => setNewReviewRating(starValue)}
														onMouseEnter={() => setHoverRating(starValue)}
														onMouseLeave={() => setHoverRating(0)}
														aria-label={`Rate ${starValue} stars`}
													>
														<Star
															size={24}
															fill={isActive ? "#F59E0B" : "none"}
															color={isActive ? "#F59E0B" : "#CBD5E0"}
														/>
													</button>
												)
											})}
										</div>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="review-text">Share your pet experience</label>
									<textarea
										id="review-text"
										rows="3"
										placeholder="Was the staff friendly to your pet? Are there water bowls?"
										required
										value={newReviewText}
										onChange={(e) => setNewReviewText(e.target.value)}
									></textarea>
								</div>
								<button type="submit" className="place-btn" style={{ width: 'fit-content', padding: '10px 24px' }}>
									Post Review
								</button>
							</form>

							{/* Reviews list */}
							<div className="reviews-list">
								{reviews.map(review => (
									<div className="review-card" key={review.id}>
										<div className="review-card-header">
											<div>
												<span className="review-author">{review.author_name}</span>
												<span className="review-breed-badge">{review.pet_breed}</span>
											</div>
											<div className="review-stars">
												{Array.from({ length: review.rating }).map((_, i) => (
													<Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
												))}
											</div>
										</div>
										<p className="review-comment">{review.comment}</p>
									</div>
								))}
							</div>
						</section>
					</div>

					{/* Right Column: Reservation / Booking form & Map details */}
					<div className="details-right-col">
						<section className="details-section action-center-card">
							{bookingSuccess && (
								<div className="booking-alert-success">
									**Appointment Confirmed!** Your pet schedule has been registered. We are excited to see you and your furry friend!
								</div>
							)}

							{place.category === 'restaurant' ? (
								/* RESERVE TABLE FORM */
								<form className="booking-form" onSubmit={handleBookingSubmit}>
									<h2 className="booking-form-title">Reserve a Pet Table</h2>
									<p className="booking-form-subtitle">Secure a booth equipped with pet bowls in advance.</p>

									<div className="form-group">
										<label htmlFor="book-date">Reservation Date</label>
										<input
											type="date"
											id="book-date"
											required
											value={bookingDate}
											min={new Date().toISOString().split('T')[0]} // Block past dates
											onChange={(e) => setBookingDate(e.target.value)}
										/>
									</div>

									<div className="form-group">
										<label htmlFor="book-time">Arrival Time</label>
										<input
											type="time"
											id="book-time"
											required
											value={bookingTime}
											onChange={(e) => setBookingTime(e.target.value)}
										/>
									</div>

									<div className="form-group">
										<label htmlFor="book-humans">Number of Humans</label>
										<select
											id="book-humans"
											value={bookingHumans}
											onChange={(e) => setBookingHumans(e.target.value)}
										>
											<option value="1">1 Person</option>
											<option value="2">2 People</option>
											<option value="3">3 People</option>
											<option value="4">4 People</option>
											<option value="5+">5+ People</option>
										</select>
									</div>

									<div className="form-group">
										<label htmlFor="book-pets">Number of Pets</label>
										<select
											id="book-pets"
											value={bookingPetsCount}
											onChange={(e) => setBookingPetsCount(e.target.value)}
										>
											<option value="0">No Pets</option>
											<option value="1">1 Pet</option>
											<option value="2">2 Pets</option>
											<option value="3+">3+ Pets</option>
										</select>
									</div>

									<div className="form-group">
										<span className="checkboxes-label">Pet Sizes</span>
										<div className="checkboxes-row">
											<label className="checkbox-item">
												<input
													type="checkbox"
													checked={bookingPetSizes.small}
													onChange={(e) => setBookingPetSizes(prev => ({ ...prev, small: e.target.checked }))}
												/>
												Small
											</label>
											<label className="checkbox-item">
												<input
													type="checkbox"
													checked={bookingPetSizes.medium}
													onChange={(e) => setBookingPetSizes(prev => ({ ...prev, medium: e.target.checked }))}
												/>
												Medium
											</label>
											<label className="checkbox-item">
												<input
													type="checkbox"
													checked={bookingPetSizes.large}
													onChange={(e) => setBookingPetSizes(prev => ({ ...prev, large: e.target.checked }))}
												/>
												Large
											</label>
										</div>
									</div>

									<button type="submit" className="place-btn" style={{ marginTop: '16px' }}>
										Confirm Reservation
									</button>
								</form>
							) : (
								/* VET & SHOP SCHEDULER FORM */
								<form className="booking-form" onSubmit={handleBookingSubmit}>
									<h2 className="booking-form-title">Book Pet Schedule</h2>
									<p className="booking-form-subtitle">Book a check-up or grooming slot with a specialist.</p>

									<div className="form-group">
										<label htmlFor="book-service">Select Service</label>
										<select
											id="book-service"
											value={bookingService}
											onChange={(e) => setBookingService(e.target.value)}
										>
											{place.category === 'veterinarian' ? (
												<>
													<option value="Consultation">General Consultation</option>
													<option value="Vaccination">Vaccinations</option>
													<option value="Deworming">Deworming</option>
													<option value="Emergency">Emergency Surgery</option>
												</>
											) : (
												<>
													<option value="Basic Bath">Basic Pet Bath</option>
													<option value="Full Grooming">Full Haircut & Grooming</option>
													<option value="Supply Consultation">Pet Food/Supply Fitting</option>
												</>
											)}
										</select>
									</div>

									<div className="form-group">
										<label htmlFor="book-date">Appt Date</label>
										<input
											type="date"
											id="book-date"
											required
											value={bookingDate}
											onChange={(e) => setBookingDate(e.target.value)}
											min={new Date().toISOString().split('T')[0]} // Block past dates
										/>
									</div>

									<div className="form-group">
										<label htmlFor="book-time">Preferred Time</label>
										<input
											type="time"
											id="book-time"
											required
											value={bookingTime}
											onChange={(e) => setBookingTime(e.target.value)}
										/>
									</div>

									<button type="submit" className="place-btn" style={{ marginTop: '16px' }}>
										Schedule Appointment
									</button>
								</form>
							)}
						</section>

						{/* Map Location panel */}
						<section className="details-section map-card">
							<h2 className="section-title">📍 Location Map</h2>
							<div className="map-placeholder" style={{ padding: 0, overflow: 'hidden' }}>
								<iframe
									title="Google Map Location"
									width="100%"
									height="100%"
									style={{ border: 0 }}
									loading="lazy"
									src={`https://maps.google.com/maps?q=${encodeURIComponent(place.name + ' ' + place.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
								></iframe>
							</div>
							<p style={{ fontSize: '12px', color: '#666', marginTop: '12px', textAlign: 'center' }}>
								{place.address}
							</p>
						</section>
					</div>
				</div>
			</main>
		</div>
	)
}

export default PlaceDetails
