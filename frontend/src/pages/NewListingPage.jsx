import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createListing } from '../utils/api'
import { useToast } from '../context/ToastContext'
import ListingForm from '../components/ListingForm'

export default function NewListingPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      const res = await createListing(formData)
      addToast('New listing created!')
      navigate(`/listings/${res.data.listing._id}`)
    } catch (e) {
      addToast(e.response?.data?.error || 'Failed to create listing', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Share Your Property</h1>
          <p className="text-gray-600 text-lg">Create a new listing and start welcoming guests today</p>
        </div>
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <ListingForm onSubmit={handleSubmit} loading={loading} submitLabel="Publish Listing" />
        </div>
      </div>
    </div>
  )
}
