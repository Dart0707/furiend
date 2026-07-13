import { useState, useEffect, useRef } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import { supabase } from '../supabaseclient'
import './Dashboard.css'

// Inline SVG Icon components
const ImageIcon = () => (
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
		<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
		<circle cx="8.5" cy="8.5" r="1.5" />
		<polyline points="21 15 16 10 5 21" />
	</svg>
)

const HeartIcon = ({ filled }) => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#EF4444" : "none"} stroke={filled ? "#EF4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
	</svg>
)

const CommentIcon = () => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
	</svg>
)

const ShareIcon = () => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<circle cx="18" cy="5" r="3" />
		<circle cx="6" cy="12" r="3" />
		<circle cx="18" cy="19" r="3" />
		<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
		<line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
	</svg>
)

const SendIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
		<line x1="22" y1="2" x2="11" y2="13" />
		<polygon points="22 2 15 22 11 13 2 9 22 2" />
	</svg>
)

const TrashIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
		<polyline points="3 6 5 6 21 6" />
		<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
		<line x1="10" y1="11" x2="10" y2="17" />
		<line x1="14" y1="11" x2="14" y2="17" />
	</svg>
)

const Dashboard = () => {
	const navigate = useNavigate()
	const { session, loading: authLoading, signOutUser } = UserAuth()

	const [showDropdown, setShowDropdown] = useState(false)
	const [toast, setToast] = useState({ show: false, message: '' })
	const [newPostText, setNewPostText] = useState('')
	const [selectedFile, setSelectedFile] = useState(null)
	const [selectedImagePreview, setSelectedImagePreview] = useState(null)
	const [posts, setPosts] = useState([])
	const [loading, setLoading] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const dropdownRef = useRef(null)
	const fileInputRef = useRef(null)

	// Fetch posts on load
	useEffect(() => {
		if (session) {
			fetchPosts()
		}
	}, [session])

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setShowDropdown(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const showToastMessage = (message) => {
		setToast({ show: true, message })
		setTimeout(() => {
			setToast({ show: false, message: '' })
		}, 2500)
	}

	const fetchPosts = async () => {
		try {
			const { data, error } = await supabase
				.from('posts')
				.select(`
					*,
					likes (user_id),
					comments (*)
				`)
				.order('created_at', { ascending: false })

			if (error) throw error

			const currentUserId = session?.user?.id

			if (!data || data.length === 0) {
				setPosts([])
				setLoading(false)
				return
			}

			const formattedPosts = data.map(post => {
				// Sort comments by created_at ascending
				const sortedComments = (post.comments || []).sort((a, b) =>
					new Date(a.created_at) - new Date(b.created_at)
				).map(c => ({
					id: c.id,
					author: c.author_name,
					text: c.comment_text,
					createdAt: c.created_at
				}))

				const likes = post.likes || []
				const hasLiked = likes.some(l => l.user_id === currentUserId)
				const authorInitials = post.author_name ? post.author_name.slice(0, 2).toUpperCase() : 'UP'

				return {
					id: post.id,
					userId: post.user_id,
					author: {
						name: post.author_name,
						avatar: authorInitials
					},
					text: post.caption,
					image: post.image_url,
					likesCount: likes.length,
					commentsCount: sortedComments.length,
					hasLiked: hasLiked,
					comments: sortedComments,
					showComments: false
				}
			})

			setPosts(formattedPosts)
		} catch (error) {
			console.error('Error fetching posts:', error.message)
			showToastMessage('Failed to load posts from server.')
		} finally {
			setLoading(false)
		}
	}



	const handleSignOut = async () => {
		await signOutUser()
		navigate('/signin')
	}

	const handleLike = async (postId) => {
		const currentUserId = session?.user?.id
		if (!currentUserId) return

		// Find the target post to determine if we are liking or unliking
		const targetPost = posts.find(p => p.id === postId)
		if (!targetPost) return

		const isLiking = !targetPost.hasLiked

		// Optimistic UI updates
		setPosts(prevPosts =>
			prevPosts.map(post => {
				if (post.id === postId) {
					return {
						...post,
						hasLiked: isLiking,
						likesCount: isLiking ? post.likesCount + 1 : post.likesCount - 1
					}
				}
				return post
			})
		)

		try {
			if (!isLiking) {
				// Delete like from db
				const { error } = await supabase
					.from('likes')
					.delete()
					.match({ post_id: postId, user_id: currentUserId })
				if (error) throw error
			} else {
				// Insert like into db
				const { error } = await supabase
					.from('likes')
					.insert([{ post_id: postId, user_id: currentUserId }])
				if (error) throw error
			}
		} catch (err) {
			console.error('Error toggling like:', err.message)
			// Revert state on error
			fetchPosts()
		}
	}

	const toggleComments = (postId) => {
		setPosts(prevPosts =>
			prevPosts.map(post => {
				if (post.id === postId) {
					return { ...post, showComments: !post.showComments }
				}
				return post
			})
		)
	}

	const handleAddComment = async (postId, text, authorName) => {
		if (!text.trim()) return
		const currentUserId = session?.user?.id
		if (!currentUserId) return

		// Optimistic UI update
		const tempCommentId = `temp-${Date.now()}`
		setPosts(prevPosts =>
			prevPosts.map(post => {
				if (post.id === postId) {
					const newComment = {
						id: tempCommentId,
						author: authorName,
						text: text
					}
					return {
						...post,
						comments: [...post.comments, newComment],
						commentsCount: post.commentsCount + 1
					}
				}
				return post
			})
		)

		try {
			const { error } = await supabase
				.from('comments')
				.insert([
					{
						post_id: postId,
						user_id: currentUserId,
						author_name: authorName,
						comment_text: text
					}
				])
			if (error) throw error

			// Refresh to get actual comment ID and state
			fetchPosts()
		} catch (err) {
			console.error('Error adding comment:', err.message)
			showToastMessage('Could not save comment.')
			// Revert state
			fetchPosts()
		}
	}

	const handleFileChange = (e) => {
		const file = e.target.files[0]
		if (file) {
			setSelectedFile(file)
			const previewUrl = URL.createObjectURL(file)
			setSelectedImagePreview(previewUrl)
		}
	}

	const triggerFileSelect = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click()
		}
	}

	const uploadImage = async (file) => {
		try {
			// Generate safe file name
			const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
			const { data, error } = await supabase.storage
				.from('post-images')
				.upload(`public/${fileName}`, file, {
					cacheControl: '3600',
					upsert: false
				})

			if (error) throw error

			const { data: { publicUrl } } = supabase.storage
				.from('post-images')
				.getPublicUrl(data.path)

			return publicUrl
		} catch (err) {
			console.warn('Storage upload failed, falling back to random photo:', err.message)
			showToastMessage(`Storage error: ${err.message}. Using fallback photo.`)
			// Graceful fallback to Unsplash random pet image so app works even if user did not create the bucket
			const randomIndex = Math.floor(Math.random() * petImages.length)
			return petImages[randomIndex]
		}
	}

	const handleCreatePost = async (e) => {
		e.preventDefault()
		if (!newPostText.trim() && !selectedFile) return

		const displayName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'User'
		const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1)

		setIsSubmitting(true)
		showToastMessage("Sharing post to community...")

		try {
			let imageUrl = null
			if (selectedFile) {
				imageUrl = await uploadImage(selectedFile)
			}

			const { error } = await supabase
				.from('posts')
				.insert([
					{
						user_id: session.user.id,
						author_name: formattedName,
						caption: newPostText,
						image_url: imageUrl
					}
				])

			if (error) throw error

			setNewPostText('')
			setSelectedFile(null)
			setSelectedImagePreview(null)
			showToastMessage("Post shared successfully!")
			fetchPosts()
		} catch (err) {
			console.error('Error creating post:', err.message)
			showToastMessage(`Failed to share post: ${err.message}`)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleDeletePost = async (postId) => {
		const confirmDelete = window.confirm("Are you sure you want to delete this post?")
		if (!confirmDelete) return

		// Optimistic UI update
		setPosts(prevPosts => prevPosts.filter(p => p.id !== postId))

		try {
			const { error } = await supabase
				.from('posts')
				.delete()
				.eq('id', postId)

			if (error) throw error

			showToastMessage("Post deleted successfully!")
		} catch (err) {
			console.error('Error deleting post:', err.message)
			showToastMessage(`Failed to delete post: ${err.message}`)
			fetchPosts()
		}
	}

	const handleShare = (postId) => {
		const shareUrl = `${window.location.origin}/dashboard#post-${postId}`
		navigator.clipboard.writeText(shareUrl).then(() => {
			showToastMessage("Post link copied to clipboard!")
		}).catch(() => {
			showToastMessage("Could not copy link")
		})
	}

	if (authLoading) {
		return (
			<div className="dashboard-container" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
				<div style={{ fontFamily: "'Carme', sans-serif", color: '#1B4332', fontSize: '18px', fontWeight: '700' }}>Loading...</div>
			</div>
		)
	}

	if (!session) {
		return <Navigate to="/signin" replace />
	}

	// Extract display details for profile
	const userEmail = session.user.email
	const userMetadataName = session.user?.user_metadata?.full_name
	const displayName = userMetadataName || userEmail.split('@')[0]
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
					<Link className="header-nav-link" to="/dashboard" style={{ borderBottom: '2px solid #FAEDCD', paddingBottom: '4px' }}>newsfeed</Link>
					<Link className="header-nav-link" to="/places">places</Link>
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

				{/* "What's on your mind?" Input Card */}
				<section className="feed-card create-post-card">
					<form onSubmit={handleCreatePost}>
						<div className="create-post-row">
							<div className="create-post-avatar">{userInitials}</div>
							<div className="create-post-input-wrapper">
								<input
									type="text"
									placeholder="What's on your mind?"
									className="create-post-input"
									value={newPostText}
									onChange={(e) => setNewPostText(e.target.value)}
									disabled={isSubmitting}
								/>
								<button
									type="button"
									className="create-post-image-btn"
									onClick={triggerFileSelect}
									aria-label="Upload photo"
									disabled={isSubmitting}
								>
									<ImageIcon />
								</button>
								{/* Hidden File Input */}
								<input
									type="file"
									ref={fileInputRef}
									onChange={handleFileChange}
									accept="image/*"
									style={{ display: 'none' }}
								/>
							</div>
						</div>

						{selectedImagePreview && (
							<div className="create-post-row" style={{ marginTop: '14px' }}>
								<div className="create-post-image-preview">
									<img src={selectedImagePreview} alt="Attached Pet Preview" />
									<button
										type="button"
										className="remove-preview-btn"
										onClick={() => {
											setSelectedFile(null)
											setSelectedImagePreview(null)
										}}
										aria-label="Remove image"
										disabled={isSubmitting}
									>
										&times;
									</button>
								</div>
							</div>
						)}

						{(newPostText.trim() || selectedFile) && (
							<div className="create-post-row" style={{ marginTop: '14px', justifyContent: 'flex-end' }}>
								<button
									type="submit"
									className="dropdown-btn"
									style={{ padding: '8px 20px', borderRadius: '20px' }}
									disabled={isSubmitting}
								>
									{isSubmitting ? 'Posting...' : 'Post'}
								</button>
							</div>
						)}
					</form>
				</section>

				{/* Loading skeletons */}
				{loading ? (
					<div className="loading-container">
						<div className="feed-card skeleton-card">
							<div className="skeleton-avatar"></div>
							<div className="skeleton-line-1"></div>
							<div className="skeleton-line-2"></div>
							<div className="skeleton-rect"></div>
						</div>
						<div className="feed-card skeleton-card">
							<div className="skeleton-avatar"></div>
							<div className="skeleton-line-1"></div>
							<div className="skeleton-line-2"></div>
						</div>
					</div>
				) : posts.length === 0 ? (
					<div className="feed-card empty-feed-card" style={{ textAlign: 'center', padding: '40px 20px', color: '#8A8A8A' }}>
						<p style={{ fontFamily: "'Carme', sans-serif", fontSize: '16px', margin: '0 0 10px 0' }}>
							No posts yet.
						</p>
						<p style={{ fontFamily: "'Carme', sans-serif", fontSize: '14px', margin: 0, opacity: 0.8 }}>
							Be the first to share something with the community!
						</p>
					</div>
				) : (
					/* Posts Feed */
					posts.map(post => {
						return (
							<article className="feed-card post-card" key={post.id} id={`post-${post.id}`}>
								<div className="create-post-row" style={{ gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
									<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
										<div className="create-post-avatar" style={{ width: '38px', height: '38px', fontSize: '13px' }}>
											{post.author.avatar}
										</div>
										<div style={{ display: 'flex', flexDirection: 'column' }}>
											<span style={{ fontFamily: "'Niramit', sans-serif", fontWeight: '700', fontSize: '14px', color: '#1B4332' }}>
												{post.author.name}
											</span>
											<span style={{ fontFamily: "'Carme', sans-serif", fontSize: '11px', color: '#8A8A8A' }}>
												Pet Parent
											</span>
										</div>
									</div>

									{post.userId === session.user.id && (
										<button
											type="button"
											className="post-delete-btn"
											onClick={() => handleDeletePost(post.id)}
											aria-label="Delete post"
										>
											<TrashIcon />
										</button>
									)}
								</div>

								<p className="post-text">{post.text}</p>

								{post.image && (
									<div className="post-image-wrapper">
										<img src={post.image} className="post-image" alt="Post attachment" loading="lazy" />
									</div>
								)}

								<div className="post-stats">
									<span>{post.likesCount} Likes</span>
									<span>•</span>
									<span>{post.commentsCount} Comments</span>
								</div>

								<hr className="post-divider" />

								<div className="post-actions">
									<button
										type="button"
										className={`post-action-btn ${post.hasLiked ? 'active-like' : ''}`}
										onClick={() => handleLike(post.id)}
									>
										<HeartIcon filled={post.hasLiked} />
										<span>Like</span>
									</button>

									<button
										type="button"
										className="post-action-btn"
										onClick={() => toggleComments(post.id)}
									>
										<CommentIcon />
										<span>Comment</span>
									</button>

									<button
										type="button"
										className="post-action-btn"
										onClick={() => handleShare(post.id)}
									>
										<ShareIcon />
										<span>Share</span>
									</button>
								</div>

								{post.showComments && (
									<section className="comment-section">
										<div className="comments-list">
											{post.comments.map(comment => (
												<div className="comment-item" key={comment.id}>
													<div className="comment-avatar">
														{comment.author ? comment.author.slice(0, 2).toUpperCase() : 'UP'}
													</div>
													<div className="comment-bubble">
														<h4 className="comment-author">{comment.author}</h4>
														<p className="comment-text">{comment.text}</p>
													</div>
												</div>
											))}
										</div>

										<CommentInputForm
											postId={post.id}
											userInitials={userInitials}
											onAddComment={(text) => handleAddComment(post.id, text, formattedDisplayName)}
										/>
									</section>
								)}
							</article>
						)
					})
				)}

			</main>

			{/* Toast Alerts */}
			{toast.show && (
				<div className="toast-notification" role="alert">
					{toast.message}
				</div>
			)}
		</div>
	)
}

// Separate component for comment inputs to prevent full feed re-renders when typing a comment
const CommentInputForm = ({ postId, userInitials, onAddComment }) => {
	const [commentText, setCommentText] = useState('')

	const handleSubmit = (e) => {
		e.preventDefault()
		if (!commentText.trim()) return
		onAddComment(commentText)
		setCommentText('')
	}

	return (
		<form onSubmit={handleSubmit} className="add-comment-form">
			<div className="comment-avatar" style={{ width: '28px', height: '28px', fontSize: '10px' }}>
				{userInitials}
			</div>
			<div className="comment-input-wrapper">
				<input
					type="text"
					placeholder="Write a comment..."
					className="comment-input"
					value={commentText}
					onChange={(e) => setCommentText(e.target.value)}
				/>
			</div>
			<button type="submit" className="comment-submit-btn" aria-label="Send comment">
				<SendIcon />
			</button>
		</form>
	)
}

export default Dashboard
