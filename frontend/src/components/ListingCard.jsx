import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function ListingCard({ listing, showTax }) {
  const [imgError, setImgError] = useState(false)
  const price = listing.price?.toLocaleString('en-IN') || '0'
  const taxPrice = Math.round(listing.price * 1.18).toLocaleString('en-IN')
  const coverImage = listing.coverImage?.url || listing.images?.[0]?.url || listing.image?.url

  return (
    <Link to={`/listings/${listing._id}`} className="block group no-underline text-gray-900">
      <div className="card-hover">
        <div className="relative overflow-hidden rounded-2xl aspect-square">
          <img
            src={imgError ? 'https://placehold.co/600x600?text=No+Image' : coverImage}
            alt={listing.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-300"
          />
        </div>
        <div className="pt-3">
          <p className="font-semibold text-base truncate">{listing.title}</p>
          <p className="text-sm text-gray-600 mt-0.5 truncate">{listing.propertyType || listing.location || listing.country}</p>
          <p className="text-sm text-gray-600 mt-1">
            &#8377;{showTax ? taxPrice : price} / night
            {showTax && <span className="text-xs text-gray-400 ml-1">incl. 18% GST</span>}
          </p>
        </div>
      </div>
    </Link>
  )
}
