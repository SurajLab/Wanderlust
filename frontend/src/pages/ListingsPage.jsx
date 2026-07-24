import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ListingCard from '../components/ListingCard'
import { getAllListings } from '../utils/api'

const FILTERS = [
  { label: 'Trending',      icon: 'fa-fire' },
  { label: 'Rooms',         icon: 'fa-bed' },
  { label: 'Iconic Cities', icon: 'fa-mountain-city' },
  { label: 'Mountain',      icon: 'fa-mountain' },
  { label: 'Castles',       icon: 'fa-chess-rook' },
  { label: 'Amazing Pools', icon: 'fa-person-swimming' },
  { label: 'Camping',       icon: 'fa-campground' },
  { label: 'Farms',         icon: 'fa-cow' },
  { label: 'Arctic',        icon: 'fa-snowflake' },
  { label: 'Domes',         icon: 'fa-igloo' },
  { label: 'House Boat',    icon: 'fa-sailboat' },
]

export default function ListingsPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState(null)
  const [showTax, setShowTax] = useState(false)
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  useEffect(() => {
    getAllListings()
      .then(res => setListings(res.data.listings))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let result = listings
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(l =>
        l.title?.toLowerCase().includes(q) ||
        l.location?.toLowerCase().includes(q) ||
        l.country?.toLowerCase().includes(q)
      )
    }
    return result
  }, [listings, searchQuery])

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Filters bar */}
      <div className="flex items-center gap-8 overflow-x-auto pb-4 scrollbar-hide border-b border-gray-200 mb-8">
        {FILTERS.map(f => (
          <button
            key={f.label}
            onClick={() => setActiveFilter(activeFilter === f.label ? null : f.label)}
            className={`flex flex-col items-center gap-1.5 flex-shrink-0 pb-1 border-b-2 transition-all ${
              activeFilter === f.label
                ? 'border-gray-900 opacity-100'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <i className={`fa-solid ${f.icon} text-2xl`} />
            <span className="text-xs font-medium whitespace-nowrap">{f.label}</span>
          </button>
        ))}

        {/* Tax toggle */}
        <div className="flex-shrink-0 ml-auto border border-gray-300 rounded-xl px-5 py-3 flex items-center gap-4 bg-white min-w-[260px] justify-between">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap cursor-pointer" htmlFor="taxSwitch">
            Display total after taxes
          </label>
          <button
            id="taxSwitch"
            role="switch"
            aria-checked={showTax}
            onClick={() => setShowTax(p => !p)}
            className={`relative inline-flex h-6 w-14 items-center rounded-full transition-colors ${showTax ? 'bg-primary' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${showTax ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Search result info */}
      {searchQuery && (
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<strong>{searchQuery}</strong>"
        </p>
      )}

      {/* Listings grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-2xl aspect-square mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <i className="fa-solid fa-compass text-5xl mb-4 block" />
          <p className="text-lg font-medium">No listings found</p>
          <p className="text-sm">Try a different search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(listing => (
            <ListingCard key={listing._id} listing={listing} showTax={showTax} />
          ))}
        </div>
      )}
    </div>
  )
}
