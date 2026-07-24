import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getListing, updateListing } from '../utils/api'
import { useToast } from '../context/ToastContext'
import ListingForm from '../components/ListingForm'

export default function EditListingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    getListing(id)
      .then(res => setListing(res.data.listing))
      .catch(() => navigate('/listings'))
      .finally(() => setFetching(false))
  }, [id])

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      await updateListing(id, formData)
      addToast('Listing updated!')
      navigate(`/listings/${id}`)
    } catch (e) {
      addToast(e.response?.data?.error || 'Update failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-8">Edit your listing</h2>
      {listing && <ListingForm initialData={listing} onSubmit={handleSubmit} loading={loading} submitLabel="Save Changes" />}
    </div>
  )
}
