import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getListing, deleteListing, createReview, deleteReview } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import StarRating from '../components/StarRating'
import MapBox from '../components/MapBox'

export default function ShowListingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [reviewLoading, setReviewLoading] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

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
    e.preventDefault()
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

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
    </div>
  )

  if (!listing) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-4">{listing.title}</h1>

      {/* Image carousel */}
      <div className="mb-6">
        <div className="rounded-3xl overflow-hidden bg-gray-100 h-[420px] mb-4 relative">
          <img
            src={imgError ? 'https://placehold.co/800x500?text=No+Image' : images[selectedImageIndex] || 'https://placehold.co/800x500?text=No+Image'}
            onError={() => setImgError(true)}
            alt={`${listing.title} image ${selectedImageIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setLightboxOpen(true)}
          />
          {images.length > 1 && (
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center gap-2 px-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
                  setImgError(false)
                }}
                className="rounded-full bg-white/90 p-2 text-gray-700 shadow-md hover:bg-white"
              >
                <i className="fa-solid fa-chevron-left" />
              </button>
              <span className="rounded-full bg-black/60 px-3 py-1 text-xs text-white">{selectedImageIndex + 1}/{images.length}</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedImageIndex((prev) => (prev + 1) % images.length)
                  setImgError(false)
                }}
                className="rounded-full bg-white/90 p-2 text-gray-700 shadow-md hover:bg-white"
              >
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => {
                  setSelectedImageIndex(idx)
                  setImgError(false)
                }}
                className={`flex-shrink-0 rounded-2xl overflow-hidden border ${selectedImageIndex === idx ? 'border-primary' : 'border-transparent'} shadow-sm`}
              >
                <img src={img} alt={`${listing.title} thumb ${idx + 1}`} className="h-24 w-32 object-cover" />
              </button>
            ))}
          </div>
        )}

        {lightboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-50 rounded-full bg-white/90 p-3 text-gray-700 shadow-lg"
            >
              <i className="fa-solid fa-xmark" />
            </button>
            <img
              src={images[selectedImageIndex] || 'https://placehold.co/1200x800?text=No+Image'}
              alt={`${listing.title} fullscreen`}
              className="max-h-full max-w-full rounded-3xl shadow-2xl"
            />
          </div>
        )}
      </div>

      {/* Details card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">
          Owned by <span className="font-semibold text-gray-800">{listing.ownerName || listing.owner?.username || 'Host'}</span>
          {listing.owner?.username && listing.ownerName && listing.ownerName !== listing.owner.username && (
            <span className="text-gray-400"> (@{listing.owner.username})</span>
          )}
          {!listing.ownerName && listing.owner?.username && <span className="font-semibold text-gray-800">@{listing.owner.username}</span>}
        </p>
        <p className="text-gray-700 mt-3 leading-relaxed">{listing.description}</p>
        <div className="mt-4 grid gap-4 text-sm text-gray-600 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <i className="fa-solid fa-indian-rupee-sign text-primary" />
              <strong className="text-gray-900 text-base">{listing.price?.toLocaleString('en-IN')}</strong>
              <span className="text-gray-400">/ night</span>
            </div>
            <div className="flex items-center gap-1.5">
              <i className="fa-solid fa-location-dot text-primary" />
              {listing.location}
            </div>
            <div className="flex items-center gap-1.5">
              <i className="fa-solid fa-earth-asia text-primary" />
              {listing.country}
            </div>
            {listing.propertyType && (
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-house-chimney text-primary" />
                {listing.propertyType}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <i className="fa-solid fa-users text-primary" />
              Guests: {listing.guests ?? 'N/A'}
            </div>
            <div className="flex items-center gap-1.5">
              <i className="fa-solid fa-bed text-primary" />
              Beds: {listing.beds ?? 'N/A'}
            </div>
            <div className="flex items-center gap-1.5">
              <i className="fa-solid fa-bath text-primary" />
              Baths: {listing.baths ?? 'N/A'}
            </div>
            {listing.contactEmail && (
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-envelope text-primary" />
                <a href={`mailto:${listing.contactEmail}`} className="text-gray-700 hover:text-primary">{listing.contactEmail}</a>
              </div>
            )}
            {listing.contactPhone && (
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-phone text-primary" />
                <a href={`tel:${listing.contactPhone}`} className="text-gray-700 hover:text-primary">
                  {listing.contactPhone}
                </a>
              </div>
            )}
          </div>
        </div>
        {listing.amenities?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {listing.amenities.map((amenity, idx) => (
                <span key={idx} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Owner actions */}
      {isOwner && (
        <div className="flex gap-3 mb-8">
          <Link to={`/listings/${id}/edit`} className="btn-outline text-sm">
            <i className="fa-solid fa-pen mr-2" />Edit
          </Link>
          <button onClick={handleDelete} className="btn-primary text-sm">
            <i className="fa-solid fa-trash mr-2" />Delete
          </button>
        </div>
      )}

      {/* Review form */}
      {user && (
        <div className="mb-8">
          <hr className="mb-6" />
          <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
          <form onSubmit={handleReviewSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-br from-white to-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm">
            {/* Left column - Rating */}
            <div className="flex flex-col items-center justify-center py-2">
              <label className="block text-xs font-semibold text-gray-900 mb-3 text-center">Rate your stay</label>
              <div className="flex flex-col items-center gap-2">
                <StarRating rating={reviewForm.rating} onChange={r => setReviewForm(p => ({ ...p, rating: r }))} />
                <p className="text-center text-xs text-gray-600">
                  <span className="text-lg font-bold text-primary">{reviewForm.rating}</span>
                  <span className="text-gray-400">/5</span>
                </p>
              </div>
            </div>

            {/* Right column - Comment */}
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-900 mb-2">Your Review</label>
              <textarea
                value={reviewForm.comment}
                onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                rows={2}
                required
                placeholder="Share your experience..."
                className="input-field resize-none flex-grow text-sm"
              />
              <button 
                type="submit" 
                disabled={reviewLoading} 
                className="mt-3 btn-primary text-xs font-medium disabled:opacity-60 transition-all hover:shadow-md"
              >
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
          <hr className="mt-6" />
        </div>
      )}

      {/* Reviews list */}
      {listing.reviews?.length > 0 && (
        <div className="mb-10">
          <h3 className="text-base font-semibold mb-3">
            All Reviews <span className="text-gray-400 font-normal text-sm">({listing.reviews.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {listing.reviews.map(review => (
              <div key={review._id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-xs">@{review.author?.username}</p>
                  {user && review.author?._id === user._id && (
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  )}
                </div>
                <StarRating rating={review.rating} readOnly size="text-2xl" />
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map */}
      {listing.geometry && <MapBox listing={listing} />}
    </div>
  )
}
