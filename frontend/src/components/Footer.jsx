import { Link } from 'react-router-dom'
import { useState } from 'react'
import logo from '../public/logo.png'

export default function Footer() {
  const [email, setEmail] = useState('')

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/listings" className="flex items-center gap-2 mb-3 no-underline">
              <img src={logo} alt="Wanderlust" className="h-10 w-10 object-contain" />
              <span className="text-lg font-bold text-gray-900">Wanderlust</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Discover unique stays and unforgettable experiences around the world.
            </p>
            <div className="flex gap-3">
              {[
                { icon: 'fa-facebook-f', href: '#' },
                { icon: 'fa-instagram', href: '#' },
                { icon: 'fa-x-twitter', href: '#' },
                { icon: 'fa-youtube', href: '#' },
              ].map(s => (
                <a key={s.icon} href={s.href}
                  className="w-8 h-8 bg-gray-100 hover:bg-primary hover:text-white text-gray-500 rounded-full flex items-center justify-center transition-all text-sm">
                  <i className={`fa-brands ${s.icon}`} />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Company</h4>
            <ul className="space-y-2">
              {['About Us', 'Careers', 'Press', 'Contact'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Support</h4>
            <ul className="space-y-2">
              {['Help Center', 'Safety Info', 'Cancellation Options', 'Report a Concern'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Hosting</h4>
            <ul className="space-y-2">
              {['Become a Host', 'Host Resources', 'Community', 'Hosting Tips'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Subscribe to our newsletter</h4>
            <p className="text-xs text-gray-500 mb-3">Get travel tips and exclusive deals in your inbox.</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => { setEmail(''); alert('Subscribed!') }}
                className="px-3 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-red-500 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© 2025 Wanderlust Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <a key={item} href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <i className="fa-solid fa-globe" />
            <span>English (IN)</span>
            <i className="fa-solid fa-chevron-down text-[10px]" />
          </div>
        </div>
      </div>
    </footer>
  )
}