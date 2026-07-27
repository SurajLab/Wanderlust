import { Link } from 'react-router-dom'
import { useState } from 'react'

const BADGES = ['Superhost', 'Popular', 'New', 'Top Rated', 'Staff Pick']

function getBadge(listing) {
  if (!listing._id) return null
  const code = listing._id.charCodeAt(listing._id.length - 1)
  if (code % 5 === 0) return { label: 'Superhost', color: 'bg-yellow-400 text-yellow-900' }
  if (code % 5 === 1) return { label: 'Popular', color: 'bg-orange-500 text-white' }
  if (code % 5 === 2) return { label: 'New', color: 'bg-green-500 text-white' }
  return null
}

function getRating(listing) {
  if (!listing._id) return null
  const code = listing._id.charCodeAt(0) + listing._id.charCodeAt(1)
  const rating = (4.5 + (code % 10) * 0.05).toFixed(1)
  const reviews = 50 + (code % 100)
  return { rating, reviews }
}

export default function ListingCard({ listing, showTax }) {
  const [imgError, setImgError] = useState(false)
  const [liked, setLiked] = useState(false)
  const price = listing.price?.toLocaleString('en-IN') || '0'
  const taxPrice = Math.round(listing.price * 1.18).toLocaleString('en-IN')
  const coverImage = listing.coverImage?.url || listing.images?.[0]?.url || listing.image?.url
  const badge = getBadge(listing)
  const ratingInfo = getRating(listing)

  return (
    <div className="group relative">
      <Link to={`/listings/${listing._id}`} className="block no-underline text-gray-900">
        {/* Image */}
        <div className="relative overflow-hidden rounded-2xl aspect-square">
          <img
            src={imgError ? 'https://placehold.co/600x600?text=No+Image' : coverImage}
            alt={listing.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badge */}
          {badge && (
            <div className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${badge.color}`}>
              {badge.label === 'Superhost' && <i className="fa-solid fa-star text-[10px]" />}
              {badge.label}
            </div>
          )}

          {/* Rating */}
          {ratingInfo && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full">
              <i className="fa-solid fa-star text-yellow-400 text-xs" />
              <span className="text-xs font-bold text-gray-900">{ratingInfo.rating}</span>
              <span className="text-xs text-gray-500">({ratingInfo.reviews})</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pt-3">
          <p className="font-semibold text-gray-900 truncate">{listing.title}</p>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{listing.propertyType || listing.location}</p>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            ₹{showTax ? taxPrice : price}
            <span className="font-normal text-gray-500 text-xs"> / night</span>
            {showTax && <span className="text-xs text-gray-400 ml-1">incl. GST</span>}
          </p>

          {/* Guests / Beds / Baths */}
          {(listing.guests || listing.beds || listing.baths) && (
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              {listing.guests && (
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-user text-gray-400" />
                  {listing.guests} Guests
                </span>
              )}
              {listing.beds && (
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-bed text-gray-400" />
                  {listing.beds} Beds
                </span>
              )}
              {listing.baths && (
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-bath text-gray-400" />
                  {listing.baths} Baths
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Heart button */}
      <button
        onClick={() => setLiked(l => !l)}
        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all"
      >
        <i className={`fa-${liked ? 'solid' : 'regular'} fa-heart text-sm ${liked ? 'text-primary' : 'text-gray-600'}`} />
      </button>
    </div>
  )
}