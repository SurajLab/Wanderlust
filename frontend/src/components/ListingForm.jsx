import { useEffect, useState } from 'react'
import { generateDescription } from '../utils/api'

const countryOptions = [
  'India', 'United States', 'United Kingdom', 'Australia', 'Canada',
  'France', 'Germany', 'Japan', 'Spain', 'Italy', 'Brazil', 'Mexico',
  'South Africa', 'United Arab Emirates', 'Thailand', 'Singapore',
  'Malaysia', 'Indonesia', 'Netherlands', 'Switzerland', 'Other',
]

export default function ListingForm({ initialData = {}, onSubmit, loading, submitLabel = 'Submit' }) {
  const initialImages = initialData.images?.length ? initialData.images : initialData.image ? [initialData.image] : []
  const [form, setForm] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    ownerName: initialData.ownerName || '',
    contactEmail: initialData.contactEmail || '',
    contactPhone: initialData.contactPhone || '',
    propertyType: initialData.propertyType || '',
    guests: initialData.guests || '',
    beds: initialData.beds || '',
    baths: initialData.baths || '',
    amenities: initialData.amenities ? initialData.amenities.join(', ') : '',
    price: initialData.price || '',
    location: initialData.location || '',
    country: initialData.country || '',
  })
  const [existingImages] = useState(initialImages)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewFiles, setPreviewFiles] = useState([])
  const [coverSelection, setCoverSelection] = useState(() => {
    if (initialData.coverImage?.filename) return `existing:${initialData.coverImage.filename}`
    if (initialImages[0]?.filename) return `existing:${initialImages[0].filename}`
    return ''
  })
  const [errors, setErrors] = useState({})
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  useEffect(() => {
    if (!selectedFiles.length) { setPreviewFiles([]); return }
    const previews = selectedFiles.map((file) => ({ url: URL.createObjectURL(file), name: file.name }))
    setPreviewFiles(previews)
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url))
  }, [selectedFiles])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.price || Number(form.price) <= 0) e.price = 'Valid price is required'
    if (!form.location.trim()) e.location = 'Location is required'
    if (!form.country.trim()) e.country = 'Country is required'
    if (!form.propertyType.trim()) e.propertyType = 'Property type is required'
    if (!form.guests || Number(form.guests) <= 0) e.guests = 'Guest count is required'
    if (form.beds !== '' && Number(form.beds) < 0) e.beds = 'Beds cannot be negative'
    if (form.baths !== '' && Number(form.baths) < 0) e.baths = 'Baths cannot be negative'
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) e.contactEmail = 'Enter a valid email'
    return e
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
    if (!coverSelection) setCoverSelection('new:0')
  }

  // AI Description Generator
  const handleGenerateDescription = async () => {
    if (!form.title.trim() && !form.location.trim()) {
      setAiError('Please fill in at least Title and Location first')
      return
    }
    setAiLoading(true)
    setAiError('')
    try {
      const res = await generateDescription({
        title: form.title,
        location: form.location,
        propertyType: form.propertyType,
        amenities: form.amenities,
        guests: form.guests,
        beds: form.beds,
        baths: form.baths,
      })
      setForm(prev => ({ ...prev, description: res.data.description }))
      setErrors(prev => ({ ...prev, description: '' }))
    } catch (err) {
      setAiError(err.response?.data?.error || 'Failed to generate description. Try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return }

    const formData = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, v)
    })
    selectedFiles.forEach((file) => formData.append('images', file))
    if (coverSelection) {
      if (coverSelection.startsWith('new:')) formData.append('coverImageIndex', coverSelection.split(':')[1])
      else if (coverSelection.startsWith('existing:')) formData.append('coverImage', coverSelection.split(':')[1])
    }
    onSubmit(formData)
  }

  const allPreviews = [
    ...existingImages.map(img => ({ type: 'existing', key: img.filename, url: img.url, label: 'Existing' })),
    ...previewFiles.map((f, i) => ({ type: 'new', key: i, url: f.url, label: 'New' })),
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">

      {/* Title & Description */}
      <div className="pb-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-heading text-primary" /> Listing Details
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Enter an attractive title" className="input-field focus:ring-2 focus:ring-primary focus:border-transparent" />
            {errors.title && <p className="text-red-500 text-xs mt-1"><i className="fa-solid fa-exclamation-circle mr-1" />{errors.title}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={aiLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-red-500 disabled:opacity-60 transition-colors"
              >
                {aiLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles" />
                    Write Description
                  </>
                )}
              </button>
            </div>
            {aiError && (
              <p className="text-amber-600 text-xs mb-1 flex items-center gap-1">
                <i className="fa-solid fa-triangle-exclamation" />{aiError}
              </p>
            )}
            {!aiError && (
              <p className="text-xs text-gray-400 mb-1">
                <i className="fa-solid fa-lightbulb mr-1 text-yellow-400" />
                Fill in Title & Location first, then click Write Description
              </p>
            )}
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe what makes your property special... or click Write Description above!"
              className={`input-field resize-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${aiLoading ? 'opacity-50' : ''}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1"><i className="fa-solid fa-exclamation-circle mr-1" />{errors.description}</p>}
          </div>
        </div>
      </div>

      {/* Owner Information */}
      <div className="pb-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-user text-primary" /> Owner Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
            <input name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="Your name" className="input-field focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type <span className="text-red-500">*</span></label>
            <input name="propertyType" value={form.propertyType} onChange={handleChange} placeholder="Apartment, Villa, Cabin..." className="input-field focus:ring-2 focus:ring-primary focus:border-transparent" />
            {errors.propertyType && <p className="text-red-500 text-xs mt-1"><i className="fa-solid fa-exclamation-circle mr-1" />{errors.propertyType}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
            <input name="contactEmail" value={form.contactEmail} onChange={handleChange} type="email" placeholder="your@email.com" className="input-field focus:ring-2 focus:ring-primary focus:border-transparent" />
            {errors.contactEmail && <p className="text-red-500 text-xs mt-1"><i className="fa-solid fa-exclamation-circle mr-1" />{errors.contactEmail}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
            <input name="contactPhone" value={form.contactPhone} onChange={handleChange} type="tel" placeholder="+91 XXXXX" className="input-field focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="pb-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-house text-primary" /> Property Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guests <span className="text-red-500">*</span></label>
            <input name="guests" value={form.guests} onChange={handleChange} type="number" placeholder="0" className="input-field focus:ring-2 focus:ring-primary focus:border-transparent" />
            {errors.guests && <p className="text-red-500 text-xs mt-1"><i className="fa-solid fa-exclamation-circle mr-1" />{errors.guests}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beds</label>
            <input name="beds" value={form.beds} onChange={handleChange} type="number" placeholder="0" className="input-field focus:ring-2 focus:ring-primary focus:border-transparent" />
            {errors.beds && <p className="text-red-500 text-xs mt-1"><i className="fa-solid fa-exclamation-circle mr-1" />{errors.beds}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Baths</label>
            <input name="baths" value={form.baths} onChange={handleChange} type="number" placeholder="0" className="input-field focus:ring-2 focus:ring-primary focus:border-transparent" />
            {errors.baths && <p className="text-red-500 text-xs mt-1"><i className="fa-solid fa-exclamation-circle mr-1" />{errors.baths}</p>}
          </div>
        </div>
      </div>

      {/* Location & Pricing */}
      <div className="pb-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-location-dot text-primary" /> Location & Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="City, neighborhood, address..." className="input-field focus:ring-2 focus:ring-primary focus:border-transparent" />
            {errors.location && <p className="text-red-500 text-xs mt-1"><i className="fa-solid fa-exclamation-circle mr-1" />{errors.location}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country <span className="text-red-500">*</span></label>
            <select name="country" value={form.country} onChange={handleChange} className="input-field focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="">Select country</option>
              {countryOptions.map((country) => (<option value={country} key={country}>{country}</option>))}
            </select>
            {errors.country && <p className="text-red-500 text-xs mt-1"><i className="fa-solid fa-exclamation-circle mr-1" />{errors.country}</p>}
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Price per night (₹) <span className="text-red-500">*</span></label>
          <input name="price" value={form.price} onChange={handleChange} type="number" placeholder="Enter price" className="input-field focus:ring-2 focus:ring-primary focus:border-transparent" />
          {errors.price && <p className="text-red-500 text-xs mt-1"><i className="fa-solid fa-exclamation-circle mr-1" />{errors.price}</p>}
        </div>
      </div>

      {/* Amenities & Media */}
      <div className="pb-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-sparkles text-primary" /> Amenities & Media
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
          <input name="amenities" value={form.amenities} onChange={handleChange} placeholder="Wifi, Pool, Kitchen, Parking..." className="input-field focus:ring-2 focus:ring-primary focus:border-transparent" />
          <p className="text-xs text-gray-500 mt-1">Separate amenities with commas</p>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-images text-primary" /> Upload Images
          </label>

          <label className="block border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all">
            <div className="flex flex-col items-center gap-3">
              <i className="fa-solid fa-cloud-arrow-up text-3xl text-primary" />
              <div>
                <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">Any image type up to 10 files</p>
              </div>
              {selectedFiles.length > 0 && (
                <p className="text-xs text-primary font-medium">{selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected</p>
              )}
            </div>
            <input name="images" type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
          </label>

          {/* Cover selection */}
          {allPreviews.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Choose cover image</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allPreviews.map((img) => {
                  const val = img.type === 'existing' ? `existing:${img.key}` : `new:${img.key}`
                  return (
                    <label key={val} className={`block rounded-2xl border p-1 overflow-hidden cursor-pointer ${coverSelection === val ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'}`}>
                      <img src={img.url} alt={img.label} className="h-28 w-full object-cover rounded-xl" />
                      <div className="flex items-center justify-between text-xs text-gray-600 mt-2 px-1">
                        <span className="truncate">{img.label}</span>
                        <input type="radio" name="coverSelection" value={val} checked={coverSelection === val} onChange={() => setCoverSelection(val)} />
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={loading}
          className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg disabled:opacity-60 transition-all flex items-center justify-center gap-2">
          <i className="fa-solid fa-rocket" />
          {loading ? 'Publishing...' : submitLabel}
        </button>
      </div>
    </form>
  )
}