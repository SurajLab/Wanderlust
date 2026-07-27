import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { logout } from '../utils/api'
import logo from '../public/logo.png'
import robot from '../public/robot.png'
import userImage from '../public/user.png'

function DraggablePlannerButton() {
  const [pos, setPos] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 120 })
  const [dragging, setDragging] = useState(false)
  const [hasDragged, setHasDragged] = useState(false)
  const [hovered, setHovered] = useState(false)
  const dragStart = useRef(null)
  const btnRef = useRef(null)
  const navigate = useNavigate()

  const handleMouseDown = (e) => {
    setDragging(true)
    setHasDragged(false)
    dragStart.current = { mx: e.clientX, my: e.clientY, bx: pos.x, by: pos.y }
    e.preventDefault()
  }

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    setDragging(true)
    setHasDragged(false)
    dragStart.current = { mx: touch.clientX, my: touch.clientY, bx: pos.x, by: pos.y }
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging || !dragStart.current) return
      const dx = e.clientX - dragStart.current.mx
      const dy = e.clientY - dragStart.current.my
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) setHasDragged(true)
      setPos({
        x: Math.min(Math.max(dragStart.current.bx + dx, 0), window.innerWidth - 64),
        y: Math.min(Math.max(dragStart.current.by + dy, 0), window.innerHeight - 64),
      })
    }
    const handleTouchMove = (e) => {
      if (!dragging || !dragStart.current) return
      const touch = e.touches[0]
      const dx = touch.clientX - dragStart.current.mx
      const dy = touch.clientY - dragStart.current.my
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) setHasDragged(true)
      setPos({
        x: Math.min(Math.max(dragStart.current.bx + dx, 0), window.innerWidth - 64),
        y: Math.min(Math.max(dragStart.current.by + dy, 0), window.innerHeight - 64),
      })
      e.preventDefault()
    }
    const handleMouseUp = () => setDragging(false)
    const handleTouchEnd = () => setDragging(false)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [dragging])

  const handleClick = () => { if (!hasDragged) navigate('/planner') }
  const showAbove = pos.y > window.innerHeight / 2

  return (
    <div
      ref={btnRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ left: pos.x, top: pos.y }}
      className="fixed z-50 cursor-grab active:cursor-grabbing select-none"
    >
      {hovered && !dragging && (
        <div className={`absolute ${showAbove ? 'bottom-20' : 'top-20'} right-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-xl shadow-lg pointer-events-none`} style={{ minWidth: '160px' }}>
          <div className="flex items-center gap-2">
            <span className="text-base">👋</span>
            <span className="font-medium">Hi! I'm WanderAI.<br /> Let's plan your trip.</span>
          </div>
          <div className={`absolute right-5 w-0 h-0 ${showAbove ? 'top-full border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-gray-900' : 'bottom-full border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-gray-900'}`} />
        </div>
      )}
      <div className={`relative w-20 h-20 transition-transform ${dragging ? 'scale-110' : 'hover:scale-105'}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 opacity-20 blur-md" />
        <div className="relative w-20 h-20 flex items-center justify-center drop-shadow-xl">
          <img src={robot} alt="WanderAI" className="w-4/5 h-4/5 object-contain" />
        </div>
      </div>
      {!dragging && (
        <div className="absolute inset-0 rounded-full bg-violet-400 opacity-20 animate-ping pointer-events-none" />
      )}
    </div>
  )
}

export default function Navbar() {
  const { user, setUser } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showTax, setShowTax] = useState(false)

  const isListingsPage = location.pathname === '/listings'

  // Listen to scroll only on listings page
  useEffect(() => {
    if (!isListingsPage) { setScrolled(false); return }
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isListingsPage])

  const handleLogout = async () => {
    try {
      await logout()
      setUser(null)
      addToast('You are logged out!')
      navigate('/listings')
    } catch {
      addToast('Logout failed', 'error')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/listings?search=${encodeURIComponent(search)}`)
  }

  return (
    <>
      <nav className={`sticky top-0 z-40 bg-white border-b border-gray-200 transition-all duration-500 ease-in-out ${scrolled ? 'h-14 shadow-md' : 'h-20'}`}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-4">

          {/* Brand */}
          <Link to="/listings" className="flex items-center gap-2 flex-shrink-0 no-underline">
            <img
              src={logo}
              alt="Wanderlust Logo"
              className={`object-contain transition-all duration-500 ${scrolled ? 'h-8 w-8' : 'h-16 w-16'}`}
            />
            <span className={`font-bold text-gray-900 transition-all duration-500 ${scrolled ? 'text-base' : 'text-xl'}`}>
              Wanderlust
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className={`hidden md:flex items-center transition-all duration-500 flex-1 ${scrolled ? 'max-w-xs' : 'max-w-lg'}`}>
            <div className="flex items-center w-full border border-gray-300 rounded-full overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search destinations"
                className="flex-1 pl-4 pr-2 py-2.5 text-sm focus:outline-none bg-white transition-all duration-500"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 bg-primary text-white font-semibold hover:bg-red-500 transition-all duration-500 px-4 py-2.5 text-sm rounded-full h-full min-h-[42px]"
              >
                <i className="fa-solid fa-magnifying-glass text-xs" />
                {!scrolled && 'Search'}
              </button>
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* Become a host — hide when scrolled */}
            <Link
              to="/listings/new"
              className={`text-sm font-medium px-3 py-2 hover:bg-gray-100 rounded-lg transition-all duration-500 whitespace-nowrap ${scrolled ? 'opacity-0 pointer-events-none w-0 overflow-hidden px-0' : 'opacity-100'}`}
            >
              Become a host
            </Link>

            {!user ? (
              <>
                <Link to="/signup" className={`font-bold px-3 py-2 hover:bg-gray-100 rounded-lg transition-all duration-500 ${scrolled ? 'text-xs' : 'text-sm'}`}>Sign Up</Link>
                <Link to="/login" className={`font-bold px-3 py-2 hover:bg-gray-100 rounded-lg transition-all duration-500 ${scrolled ? 'text-xs' : 'text-sm'}`}>Login</Link>
              </>
            ) : (
              <>
                <div className={`flex items-center gap-2 text-gray-600 transition-all duration-500 ${scrolled ? 'text-xs' : 'text-sm'}`}>
                  <span>Hi, {user.username}</span>
                  <img
                    src={userImage}
                    alt="User"
                    className="h-8 w-8 rounded-full object-cover border border-gray-200"
                  />
                </div>
                <button
                  onClick={handleLogout}
                  className={`font-bold px-3 py-2 hover:bg-gray-100 rounded-lg transition-all duration-500 ${scrolled ? 'text-xs' : 'text-sm'}`}
                >
                  Log Out
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'} text-lg`} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 flex flex-col gap-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search destinations" className="input-field" />
              <button type="submit" className="btn-primary text-sm">Search</button>
            </form>
            <Link to="/listings/new" className="text-sm py-2 font-medium" onClick={() => setMenuOpen(false)}>Become a host</Link>
            {!user ? (
              <>
                <Link to="/signup" className="text-sm py-2 font-bold" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                <Link to="/login" className="text-sm py-2 font-bold" onClick={() => setMenuOpen(false)}>Login</Link>
              </>
            ) : (
              <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="text-sm py-2 font-bold text-left">Log Out</button>
            )}
          </div>
        )}
      </nav>

      {/* Draggable Robot AI Button */}
      <DraggablePlannerButton />
    </>
  )
}