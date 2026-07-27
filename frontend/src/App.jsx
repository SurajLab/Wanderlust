import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ListingsPage from './pages/ListingsPage'
import ShowListingPage from './pages/ShowListingPage'
import NewListingPage from './pages/NewListingPage'
import EditListingPage from './pages/EditListingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ErrorPage from './pages/ErrorPage'
import { useAuth } from './context/AuthContext'
import TravelPlannerPage from './pages/TravelPlannerPage'
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pb-6">
        <Routes>
          <Route path="/" element={<Navigate to="/listings" replace />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/new" element={<ProtectedRoute><NewListingPage /></ProtectedRoute>} />
          <Route path="/listings/:id" element={<ShowListingPage />} />
          <Route path="/listings/:id/edit" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="*" element={<ErrorPage message="Page Not Found!" />} />
          <Route path="/planner" element={<TravelPlannerPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
