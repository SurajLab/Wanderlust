import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import ListingCard from '../components/ListingCard'
import { getAllListings } from '../utils/api'
import poster1 from '../public/poster1.png'
import poster2 from '../public/poster2.png'
import poster3 from '../public/poster3.png'
import poster4 from '../public/poster4.png'

const FILTERS = [
  { label: 'Rooms',         icon: 'fa-bed' },
  { label: 'Apartment',     icon: 'fa-building' },
  { label: 'Mountain',      icon: 'fa-mountain' },
  { label: 'Villa',         icon: 'fa-house-flag' },
  { label: 'Farmhouse',     icon: 'fa-cow' },
  { label: 'Chalet',        icon: 'fa-house-chimney' },
  { label: 'Resort',        icon: 'fa-hotel' },
  { label: 'Lodge',         icon: 'fa-house' },
  { label: 'Cottage',       icon: 'fa-house-chimney-window' },
  { label: 'Penthouse',     icon: 'fa-building-columns' },
  { label: 'Camping',      icon: 'fa-campground' },
  { label: 'Boathouse',    icon: 'fa-sailboat' },
  { label: 'Lakefront',    icon: 'fa-water' },
]

const HERO_SLIDES = [
  {
    img: poster1,
    title: 'Find your perfect stay,',
    highlight: 'anywhere in the world',
    sub: 'Explore unique properties and unforgettable experiences with Wanderlust.',
  },
  {
    img: poster2,
    title: 'Luxury meets',
    highlight: 'breathtaking nature',
    sub: 'Wake up to views that take your breath away, every single morning.',
  },
  {
    img: poster3,
    title: 'Your dream vacation',
    highlight: 'starts right here',
    sub: 'Thousands of handpicked properties waiting for your next adventure.',
  },
  {
    img: poster4,
    title: 'Escape the ordinary,',
    highlight: 'embrace the extraordinary',
    sub: 'From mountain cabins to beachfront villas — find your perfect escape.',
  },
]

const TRUST_ITEMS = [
  { icon: 'fa-tag',          color: 'bg-violet-100 text-violet-600', title: 'Best Price Guarantee', sub: 'Get the best prices on all properties' },
  { icon: 'fa-users',        color: 'bg-blue-100 text-blue-600',     title: 'Trusted by Millions',  sub: 'Over 2M+ happy travelers worldwide' },
  { icon: 'fa-shield-halved',color: 'bg-green-100 text-green-600',   title: 'Secure Payments',      sub: 'Your payments are 100% safe with us' },
  { icon: 'fa-headset',      color: 'bg-orange-100 text-orange-600', title: '24/7 Support',         sub: "We're here to help you anytime" },
]

const PAGE_SIZE = 8

export default function ListingsPage() {
  const [listings, setListings]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [activeFilter, setActiveFilter] = useState(null)
  const [showTax, setShowTax]           = useState(false)
  const [searchParams]                  = useSearchParams()
  const [page, setPage]                 = useState(1)
  const [slide, setSlide]               = useState(0)
  const [filterVisible, setFilterVisible] = useState(true)
  const lastScrollY = useRef(0)
  const searchQuery = searchParams.get('search') || ''

  useEffect(() => {
    getAllListings()
      .then(res => setListings(res.data.listings))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Auto-slide hero
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  // Hide filter on scroll down, show on scroll up
  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY
      if (current < 80) {
        setFilterVisible(true)
      } else if (current > lastScrollY.current + 8) {
        setFilterVisible(false)
      } else if (current < lastScrollY.current - 8) {
        setFilterVisible(true)
      }
      lastScrollY.current = current
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
    if (activeFilter) {
      const f = activeFilter.toLowerCase()
      result = result.filter(l =>
        l.propertyType?.toLowerCase().includes(f) ||
        l.title?.toLowerCase().includes(f) ||
        l.description?.toLowerCase().includes(f) ||
        l.amenities?.some(a => a.toLowerCase().includes(f))
      )
    }
    return result
  }, [listings, searchQuery, activeFilter])

  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = paginated.length < filtered.length
  const currentSlide = HERO_SLIDES[slide]

  return (
    <div className="bg-white">

      {/* ── Filter Bar — hides on scroll down, pops up on scroll up ── */}
      <div
        className="sticky z-30 bg-white border-b border-gray-100 shadow-sm"
        style={{
          top: '56px', // sits just below navbar
          transform: filterVisible ? 'translateY(0)' : 'translateY(-110%)',
          opacity: filterVisible ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease',
          pointerEvents: filterVisible ? 'auto' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-6 overflow-x-auto py-3 scrollbar-hide">
            {FILTERS.map(f => (
              <button
                key={f.label}
                onClick={() => { setActiveFilter(activeFilter === f.label ? null : f.label); setPage(1) }}
                className={`flex flex-col items-center gap-1 flex-shrink-0 pb-1 border-b-2 transition-all ${
                  activeFilter === f.label
                    ? 'border-primary text-primary opacity-100'
                    : 'border-transparent text-gray-500 opacity-60 hover:opacity-100 hover:text-gray-800'
                }`}
              >
                <i className={`fa-solid ${f.icon} text-xl`} />
                <span className="text-xs font-medium whitespace-nowrap">{f.label}</span>
              </button>
            ))}

            {/* Tax toggle */}
            <div className="flex-shrink-0 ml-auto border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3 bg-white min-w-max">
              <span className="text-sm text-gray-600 whitespace-nowrap">Display total after taxes</span>
              <button
                role="switch"
                aria-checked={showTax}
                onClick={() => setShowTax(p => !p)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${showTax ? 'bg-primary' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${showTax ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Hero Slider ── */}
      {!searchQuery && !activeFilter && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="relative rounded-3xl overflow-hidden h-80 md:h-[420px]">
            {HERO_SLIDES.map((s, i) => (
              <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === slide ? 'opacity-100' : 'opacity-0'}`}>
                <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              </div>
            ))}
            <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-16">
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-2">
                {currentSlide.title}<br />
                <span className="text-primary">{currentSlide.highlight}</span>
              </h1>
              <p className="text-white/80 text-sm md:text-base max-w-md mb-6">{currentSlide.sub}</p>
              <Link
                to="/listings"
                onClick={() => setActiveFilter(null)}
                className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-full w-fit hover:bg-red-500 transition-all shadow-lg"
              >
                Explore Stays <i className="fa-solid fa-arrow-right" />
              </Link>
            </div>
            <button onClick={() => setSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full flex items-center justify-center text-white transition-all">
              <i className="fa-solid fa-chevron-left text-sm" />
            </button>
            <button onClick={() => setSlide(s => (s + 1) % HERO_SLIDES.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full flex items-center justify-center text-white transition-all">
              <i className="fa-solid fa-chevron-right text-sm" />
            </button>
            <div className="absolute bottom-4 left-14 flex gap-2">
              {HERO_SLIDES.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === slide ? 'bg-primary w-6' : 'bg-white/60 w-2'}`} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Listings Grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {searchQuery && (
          <p className="text-sm text-gray-500 mb-6">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<strong>{searchQuery}</strong>"
          </p>
        )}

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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginated.map(listing => (
                <ListingCard key={listing._id} listing={listing} showTax={showTax} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="flex items-center gap-2 px-8 py-3 border-2 border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  Load More <i className="fa-solid fa-chevron-down" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Trust Section ── */}
      {!searchQuery && (
        <div className="max-w-7xl mx-auto px-6 pb-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_ITEMS.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-2xl p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <i className={`fa-solid ${item.icon}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}