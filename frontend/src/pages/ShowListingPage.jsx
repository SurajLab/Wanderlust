import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getListing, deleteListing, createReview, deleteReview } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import StarRating from '../components/StarRating'
import MapBox from '../components/MapBox'

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-3">{star}</span>
      <i className="fa-solid fa-star text-yellow-400 text-xs" />
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-4 text-right">{count}</span>
    </div>
  )
}

export default function ShowListingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [listing, setListing]               = useState(null)
  const [loading, setLoading]               = useState(true)
  const [reviewForm, setReviewForm]         = useState({ rating: 5, comment: '' })
  const [reviewLoading, setReviewLoading]   = useState(false)
  const [imgError, setImgError]             = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen]     = useState(false)
  const [saved, setSaved]                   = useState(false)
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [checkIn, setCheckIn]               = useState('')
  const [checkOut, setCheckOut]             = useState('')
  const [guests, setGuests]                 = useState(1)

  useEffect(() => {
    getListing(id)
      .then(res => setListing(res.data.listing))
      .catch(() => navigate('/listings'))
      .finally(() => setLoading(false))
  }, [id])

  const images = listing ? [
    ...(listing.coverImage ? [listing.coverImage] : []),
    ...(listing.images?.filter(img => img.url !== listing.coverImage?.url) || []),
    ...(listing.image ? [listing.image] : []),
  ].map(img => img.url || img).filter(Boolean) : []

  const isOwner = user && listing?.owner && user._id === listing.owner._id

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return
    try {
      await deleteListing(id)
      addToast('Listing deleted!')
      navigate('/listings')
    } catch (e) {
      addToast(e.response?.data?.error || 'Delete failed', 'error')
    }
  }

  const handleReviewSubmit = async (e) => {
    if (!reviewForm.comment.trim()) return addToast('Please add a comment', 'error')
    setReviewLoading(true)
    try {
      const res = await createReview(id, reviewForm)
      setListing(prev => ({ ...prev, reviews: [...prev.reviews, res.data.review] }))
      setReviewForm({ rating: 5, comment: '' })
      addToast('Review added!')
    } catch (e) {
      addToast(e.response?.data?.error || 'Review failed', 'error')
    } finally {
      setReviewLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(id, reviewId)
      setListing(prev => ({ ...prev, reviews: prev.reviews.filter(r => r._id !== reviewId) }))
      addToast('Review deleted!')
    } catch (e) {
      addToast(e.response?.data?.error || 'Delete failed', 'error')
    }
  }

  // Compute rating stats
  const reviews = listing?.reviews || []
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }))

  const amenities = listing?.amenities || []
  const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, 6)

  const whyLoveItems = [
    listing?.guests && { icon: 'fa-users', text: `Great for families — up to ${listing.guests} guests` },
    listing?.location && { icon: 'fa-mountain', text: `${listing.location} view` },
    amenities.some(a => /hot.?tub/i.test(a)) && { icon: 'fa-hot-tub-person', text: 'Hot tub' },
    amenities.some(a => /park/i.test(a)) && { icon: 'fa-square-parking', text: 'Free parking' },
    amenities.some(a => /self.?check/i.test(a)) && { icon: 'fa-key', text: 'Self check-in' },
    amenities.some(a => /wifi/i.test(a)) && { icon: 'fa-wifi', text: 'High-speed WiFi' },
  ].filter(Boolean).slice(0, 5)

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
    </div>
  )
  if (!listing) return null

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* ── Breadcrumb + Save/Share ── */}
        <div className="flex items-center justify-between mb-3">
          <nav className="flex items-center gap-1 text-xs text-gray-400">
            <Link to="/listings" className="hover:text-gray-600">Home</Link>
            <i className="fa-solid fa-chevron-right text-[10px]" />
            <Link to="/listings" className="hover:text-gray-600">Listings</Link>
            <i className="fa-solid fa-chevron-right text-[10px]" />
            <span className="text-gray-600 truncate max-w-[180px]">{listing.title}</span>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => setSaved(s => !s)} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              <i className={`fa-${saved ? 'solid' : 'regular'} fa-heart ${saved ? 'text-primary' : ''}`} />
              Save
            </button>
            <button onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => addToast('Link copied!'))}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              <i className="fa-solid fa-share-nodes" />
              Share
            </button>
          </div>
        </div>

        {/* ── Title + Rating ── */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{listing.title}</h1>
        <div className="flex items-center gap-3 mb-5 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-location-dot text-primary text-xs" />
            {listing.location}, {listing.country}
          </span>
          {avgRating && (
            <span className="flex items-center gap-1">
              <i className="fa-solid fa-star text-yellow-400 text-xs" />
              <span className="font-semibold text-gray-800">{avgRating}</span>
              <span>({reviews.length} reviews)</span>
            </span>
          )}
        </div>

        {/* ── Main layout: left content + right booking card ── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0">

            {/* Image Gallery */}
            <div className="mb-5">
              <div className="rounded-2xl overflow-hidden bg-gray-100 h-72 md:h-[420px] relative">
                <img
                  src={imgError ? 'https://placehold.co/800x500?text=No+Image' : images[selectedImageIndex] || 'https://placehold.co/800x500?text=No+Image'}
                  onError={() => setImgError(true)}
                  alt={listing.title}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                />
                {images.length > 1 && (
                  <>
                    <button onClick={() => { setSelectedImageIndex(p => (p - 1 + images.length) % images.length); setImgError(false) }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all">
                      <i className="fa-solid fa-chevron-left text-gray-700 text-sm" />
                    </button>
                    <button onClick={() => { setSelectedImageIndex(p => (p + 1) % images.length); setImgError(false) }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all">
                      <i className="fa-solid fa-chevron-right text-gray-700 text-sm" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {images.slice(0, 5).map((img, idx) => (
                    <button key={idx} onClick={() => { setSelectedImageIndex(idx); setImgError(false) }}
                      className={`flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-primary' : 'border-transparent'}`}>
                      <img src={img} alt={`thumb ${idx + 1}`} className="h-20 w-28 object-cover" />
                    </button>
                  ))}
                  {images.length > 5 && (
                    <button onClick={() => setLightboxOpen(true)}
                      className="flex-shrink-0 h-20 w-28 rounded-xl bg-gray-100 border-2 border-transparent flex flex-col items-center justify-center gap-1 hover:bg-gray-200 transition-all">
                      <i className="fa-regular fa-images text-gray-500" />
                      <span className="text-xs text-gray-500">View all</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* About */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">About this place</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <i className="fa-solid fa-indian-rupee-sign text-primary w-4" />
                <span><strong className="text-gray-900">₹{listing.price?.toLocaleString('en-IN')}</strong> / night</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <i className="fa-solid fa-location-dot text-primary w-4" />
                <span>{listing.location}, {listing.country}</span>
              </div>
              {listing.propertyType && (
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fa-solid fa-house-chimney text-primary w-4" />
                  <span>{listing.propertyType}</span>
                </div>
              )}
              {listing.guests && (
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fa-solid fa-users text-primary w-4" />
                  <span>Guests: {listing.guests}</span>
                </div>
              )}
              {listing.beds && (
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fa-solid fa-bed text-primary w-4" />
                  <span>Beds: {listing.beds}</span>
                </div>
              )}
              {listing.baths && (
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fa-solid fa-bath text-primary w-4" />
                  <span>Baths: {listing.baths}</span>
                </div>
              )}
              {listing.contactEmail && (
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fa-solid fa-envelope text-primary w-4" />
                  <a href={`mailto:${listing.contactEmail}`} className="hover:text-primary truncate">{listing.contactEmail}</a>
                </div>
              )}
              {listing.contactPhone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fa-solid fa-phone text-primary w-4" />
                  <a href={`tel:${listing.contactPhone}`} className="hover:text-primary">{listing.contactPhone}</a>
                </div>
              )}
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-900 mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {visibleAmenities.map((a, i) => (
                    <span key={i} className="px-3 py-1.5 border border-gray-200 rounded-full text-xs text-gray-700 bg-gray-50">{a}</span>
                  ))}
                  {amenities.length > 6 && (
                    <button onClick={() => setShowAllAmenities(s => !s)}
                      className="px-3 py-1.5 border border-gray-200 rounded-full text-xs text-gray-500 hover:bg-gray-50 flex items-center gap-1 transition-all">
                      {showAllAmenities ? 'Show less' : `Show all`}
                      <i className={`fa-solid fa-chevron-${showAllAmenities ? 'up' : 'down'} text-[10px]`} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Owner actions */}
            {isOwner && (
              <div className="flex gap-3 mb-8">
                <Link to={`/listings/${id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                  <i className="fa-solid fa-pen" /> Edit Listing
                </Link>
                <button onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-100 transition-all">
                  <i className="fa-solid fa-trash" /> Delete Listing
                </button>
              </div>
            )}

            {/* ── Reviews ── */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Guest Reviews</h2>

              {reviews.length > 0 ? (
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  {/* Avg rating */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                      <i className="fa-solid fa-star text-yellow-400 text-xl" />
                      <span className="text-3xl font-bold text-gray-900">{avgRating}</span>
                      <span className="text-sm text-gray-500">out of 5</span>
                    </div>
                    <p className="text-xs text-gray-400">Based on {reviews.length} reviews</p>
                  </div>
                  {/* Rating bars */}
                  <div className="flex-1 space-y-1.5">
                    {ratingCounts.map(({ star, count }) => (
                      <RatingBar key={star} star={star} count={count} total={reviews.length} />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-4">No reviews yet. Be the first to review!</p>
              )}

              {/* Review cards */}
              {reviews.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {reviews.map(review => (
                    <div key={review._id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary text-xs font-bold">{review.author?.username?.[0]?.toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{review.author?.username}</p>
                            <p className="text-xs text-gray-400">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Recently'}
                            </p>
                          </div>
                        </div>
                        {user && review.author?._id === user._id && (
                          <button onClick={() => handleDeleteReview(review._id)}
                            className="text-gray-300 hover:text-red-500 transition-colors">
                            <i className="fa-solid fa-trash text-xs" />
                          </button>
                        )}
                      </div>
                      <div className="flex mb-2">
                        {[1,2,3,4,5].map(s => (
                          <i key={s} className={`fa-solid fa-star text-xs ${s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Review form — always visible, login check on submit */}
              <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Share your experience</h3>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  if (!user) {
                    addToast('Please log in to submit a review', 'error')
                    navigate('/login')
                    return
                  }
                  handleReviewSubmit(e)
                }}>
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setReviewForm(p => ({ ...p, rating: s }))}>
                        <i className={`fa-solid fa-star text-2xl transition-colors ${s <= reviewForm.rating ? 'text-primary' : 'text-gray-200'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                    rows={3}
                    placeholder="Write your review..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white mb-3 resize-none"
                  />
                  {!user && (
                    <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                      <i className="fa-solid fa-circle-info" />
                      You need to <Link to="/login" className="font-semibold underline hover:text-amber-700">log in</Link> to submit a review
                    </p>
                  )}
                  <button type="submit" disabled={reviewLoading}
                    className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-red-500 disabled:opacity-60 transition-all">
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>

            {/* Map */}
            {listing.geometry && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Where you'll be</h2>
                <div className="rounded-2xl overflow-hidden">
                  <MapBox listing={listing} />
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — Booking Card ── */}
          <div className="lg:w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-24">
              <div className="border border-gray-200 rounded-2xl p-6 shadow-lg bg-white">
                {/* Price */}
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-gray-900">₹{listing.price?.toLocaleString('en-IN')}</span>
                  <span className="text-gray-500 text-sm">/ night</span>
                </div>

                {/* Check-in / Check-out */}
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
                  <div className="grid grid-cols-2 divide-x divide-gray-200">
                    <div className="p-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Check-in</p>
                      <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                        className="w-full text-xs text-gray-600 focus:outline-none bg-transparent" />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Check-out</p>
                      <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                        className="w-full text-xs text-gray-600 focus:outline-none bg-transparent" />
                    </div>
                  </div>
                  <div className="border-t border-gray-200 p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Guests</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{guests} guest{guests > 1 ? 's' : ''}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setGuests(g => Math.max(1, g - 1))}
                          className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xs">
                          <i className="fa-solid fa-minus" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{guests}</span>
                        <button onClick={() => setGuests(g => Math.min(listing.guests || 10, g + 1))}
                          className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xs">
                          <i className="fa-solid fa-plus" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Book Now */}
                <button
                  onClick={() => addToast('Booking feature coming soon!')}
                  className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-red-500 transition-all shadow-md text-sm"
                >
                  Book Now
                </button>
                <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                  <i className="fa-solid fa-shield-halved text-gray-300" />
                  You won't be charged yet
                </p>

                {/* Host info */}
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">
                        {(listing.ownerName || listing.owner?.username || 'H')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Hosted by {listing.ownerName || listing.owner?.username || 'Host'}
                      </p>
                      <p className="text-xs text-gray-400">Joined in 2025</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Response rate</span>
                      <span className="font-semibold text-gray-700">98%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Response time</span>
                      <span className="font-semibold text-gray-700">within an hour</span>
                    </div>
                  </div>
                </div>

                {/* Why you'll love it */}
                {whyLoveItems.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <p className="text-sm font-bold text-gray-900 mb-3">Why you'll love it here</p>
                    <div className="space-y-2">
                      {whyLoveItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                          <i className={`fa-solid ${item.icon} text-primary w-4`} />
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white">
            <i className="fa-solid fa-xmark" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(p => (p - 1 + images.length) % images.length) }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white">
            <i className="fa-solid fa-chevron-left" />
          </button>
          <img src={images[selectedImageIndex]} alt={listing.title}
            className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain" onClick={e => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(p => (p + 1) % images.length) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white">
            <i className="fa-solid fa-chevron-right" />
          </button>
          <div className="absolute bottom-4 text-white text-sm bg-black/40 px-4 py-1 rounded-full">
            {selectedImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  )
}