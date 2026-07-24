import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { logout } from '../utils/api'
import logo from '../public/logo.png'

export default function Navbar() {
  const { user, setUser } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

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
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 h-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-6">
        {/* Brand */}
        <Link to="/listings" className="flex items-center gap-2 flex-shrink-0 text-primary no-underline">
          <img src={logo} alt="Wanderlust Logo" className="h-16 w-16 object-contain" />
          <span className="text-xl font-bold text-gray-900">Wanderlust</span>
        </Link>

        {/* Search - centered */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-lg">
          <div className="flex items-center w-full border border-gray-300 rounded-full overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search destinations"
              className="flex-1 pl-5 pr-3 py-2.5 text-sm focus:outline-none bg-white"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-red-500 transition-colors"
            >
              <i className="fa-solid fa-magnifying-glass text-xs" />
              Search
            </button>
          </div>
        </form>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/listings/new" className="text-sm font-medium px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap">
            Become a host
          </Link>
          {!user ? (
            <>
              <Link to="/signup" className="text-sm font-bold px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">Sign Up</Link>
              <Link to="/login" className="text-sm font-bold px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">Login</Link>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-600 px-3">Hi, {user.username}</span>
              <button onClick={handleLogout} className="text-sm font-bold px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
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
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search destinations"
              className="input-field"
            />
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
  )
}
