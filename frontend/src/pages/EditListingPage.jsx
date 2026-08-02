import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getListing, updateListing, generateDescription } from '../utils/api'
import { useToast } from '../context/ToastContext'

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Cabin', 'Cottage', 'Resort', 'Homestay', 'Hotel', 'Farmhouse', 'Treehouse', 'Houseboat', 'Other']
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Australia', 'Canada', 'France', 'Germany', 'Japan', 'Spain', 'Italy', 'Brazil', 'Mexico', 'South Africa', 'United Arab Emirates', 'Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Netherlands', 'Switzerland', 'Other']

const SECTIONS = [
  { id: 'basics',    icon: 'fa-house',          label: 'Basics',            sub: 'Title, description, owner' },
  { id: 'property',  icon: 'fa-building',        label: 'Property Details',  sub: 'Guests, beds, baths' },
  { id: 'location',  icon: 'fa-location-dot',    label: 'Location & Pricing',sub: 'Where and how much' },
  { id: 'amenities', icon: 'fa-images',          label: 'Amenities & Media', sub: 'Features and photos' },
  { id: 'review',    icon: 'fa-circle-check',    label: 'Review & Save',     sub: 'Review and publish' },
]

export default function EditListingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [listing, setListing]           = useState(null)
  const [fetching, setFetching]         = useState(true)
  const [loading, setLoading]           = useState(false)
  const [aiLoading, setAiLoading]       = useState(false)
  const [activeSection, setActiveSection] = useState('basics')
  const [amenityInput, setAmenityInput] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewFiles, setPreviewFiles] = useState([])
  const [coverSelection, setCoverSelection] = useState('')
  const [titleCount, setTitleCount]     = useState(0)
  const [descCount, setDescCount]       = useState(0)
  const [dragging, setDragging]         = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', ownerName: '', contactEmail: '',
    contactPhone: '', propertyType: '', guests: '', beds: '', baths: '',
    price: '', location: '', country: '', amenities: [],
  })

  useEffect(() => {
    getListing(id)
      .then(res => {
        const l = res.data.listing
        setListing(l)
        const amenitiesArr = Array.isArray(l.amenities) ? l.amenities : []
        setForm({
          title: l.title || '',
          description: l.description || '',
          ownerName: l.ownerName || '',
          contactEmail: l.contactEmail || '',
          contactPhone: l.contactPhone || '',
          propertyType: l.propertyType || '',
          guests: l.guests || '',
          beds: l.beds || '',
          baths: l.baths || '',
          price: l.price || '',
          location: l.location || '',
          country: l.country || '',
          amenities: amenitiesArr,
        })
        setTitleCount((l.title || '').length)
        setDescCount((l.description || '').length)
        // Set initial cover selection
        if (l.coverImage?.filename) setCoverSelection(`existing:${l.coverImage.filename}`)
        else if (l.images?.[0]?.filename) setCoverSelection(`existing:${l.images[0].filename}`)
      })
      .catch(() => navigate('/listings'))
      .finally(() => setFetching(false))
  }, [id])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (name === 'title') setTitleCount(value.length)
    if (name === 'description') setDescCount(value.length)
  }

  const addAmenity = (val) => {
    const trimmed = val.trim()
    if (trimmed && !form.amenities.includes(trimmed)) {
      setForm(p => ({ ...p, amenities: [...p.amenities, trimmed] }))
    }
    setAmenityInput('')
  }

  const removeAmenity = (a) =>
    setForm(p => ({ ...p, amenities: p.amenities.filter(x => x !== a) }))

  const handleFileChange = files => {
    const arr = Array.from(files)
    const previews = arr.map(f => ({ url: URL.createObjectURL(f), name: f.name }))
    setSelectedFiles(prev => [...prev, ...arr])
    setPreviewFiles(prev => [...prev, ...previews])
    if (!coverSelection) setCoverSelection('new:0')
  }

  const handleDrop = e => {
    e.preventDefault(); setDragging(false)
    handleFileChange(e.dataTransfer.files)
  }

  const handleGenerateDescription = async () => {
    if (!form.title && !form.location) { addToast('Fill in Title and Location first', 'error'); return }
    setAiLoading(true)
    try {
      const res = await generateDescription({
        title: form.title, location: form.location, propertyType: form.propertyType,
        amenities: form.amenities.join(', '), guests: form.guests, beds: form.beds, baths: form.baths,
      })
      setForm(p => ({ ...p, description: res.data.description }))
      setDescCount(res.data.description.length)
      addToast('Description improved!')
    } catch { addToast('Failed to generate description', 'error') }
    finally { setAiLoading(false) }
  }

  const handleSubmit = async () => {
    if (!form.title || !form.location || !form.price || !form.country) {
      addToast('Please fill all required fields', 'error'); return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'amenities') formData.append(k, v.join(','))
        else formData.append(k, v)
      })
      selectedFiles.forEach(f => formData.append('images', f))
      if (coverSelection.startsWith('new:')) {
        formData.append('coverImageIndex', coverSelection.split(':')[1])
      } else if (coverSelection.startsWith('existing:')) {
        formData.append('coverImage', coverSelection.split(':')[1])
      }
      await updateListing(id, formData)
      addToast('Listing updated!')
      navigate(`/listings/${id}`)
    } catch (e) {
      addToast(e.response?.data?.error || 'Update failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const existingImages = listing ? [
    ...(listing.coverImage ? [listing.coverImage] : []),
    ...(listing.images?.filter(img => img.url !== listing.coverImage?.url) || []),
    ...(listing.image ? [listing.image] : []),
  ].filter(img => img?.url) : []

  if (fetching) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1 text-xs text-gray-400 mb-4">
          <Link to="/listings" className="hover:text-gray-600">Home</Link>
          <i className="fa-solid fa-chevron-right text-[10px]" />
          <Link to="/listings" className="hover:text-gray-600">My Listings</Link>
          <i className="fa-solid fa-chevron-right text-[10px]" />
          <span className="text-gray-600">Edit Listing</span>
        </nav>

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit your listing</h1>
            <p className="text-gray-500 text-sm mt-1">Update your property details and keep your listing fresh</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
              <i className="fa-solid fa-circle-check" /> All changes saved
            </div>
            <button onClick={() => navigate(`/listings/${id}`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
              <i className="fa-regular fa-eye" /> Preview Listing
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── LEFT SIDEBAR ── */}
          <div className="lg:w-56 flex-shrink-0 space-y-4">

            {/* Section nav */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {SECTIONS.map((s, i) => (
                <button key={s.id} onClick={() => {
                  setActiveSection(s.id)
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-gray-50 last:border-0 ${
                    activeSection === s.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-gray-50'
                  }`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    activeSection === s.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span className="text-xs font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${activeSection === s.id ? 'text-primary' : 'text-gray-700'}`}>{s.label}</p>
                    <p className="text-[10px] text-gray-400">{s.sub}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* AI Assistant */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-wand-magic-sparkles text-violet-500" />
                <span className="text-sm font-bold text-gray-900">AI Assistant</span>
                <span className="bg-violet-100 text-violet-600 text-[10px] px-1.5 py-0.5 rounded-full font-medium">Beta</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">Let AI help you optimize your listing for more bookings.</p>
              <div className="space-y-2">
                <button onClick={handleGenerateDescription} disabled={aiLoading}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold rounded-lg hover:bg-violet-100 transition-all disabled:opacity-60">
                  <i className="fa-solid fa-wand-magic-sparkles text-xs" />
                  {aiLoading ? 'Generating...' : 'Improve Description'}
                </button>
                <button onClick={() => addToast('Coming soon!')}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold rounded-lg hover:bg-violet-100 transition-all">
                  <i className="fa-solid fa-star text-xs" /> Suggest Amenities
                </button>
                <button onClick={() => addToast('Coming soon!')}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold rounded-lg hover:bg-violet-100 transition-all">
                  <i className="fa-solid fa-tag text-xs" /> Suggest Price
                </button>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-sm font-bold text-gray-900 mb-1">Need help?</p>
              <p className="text-xs text-gray-500 mb-3">Our support team is here to help you.</p>
              <button onClick={() => addToast('Support coming soon!')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-primary text-primary text-xs font-semibold rounded-lg hover:bg-primary/5 transition-all">
                <i className="fa-solid fa-headset" /> Contact Support
              </button>
            </div>
          </div>

          {/* ── RIGHT — Form ── */}
          <div className="flex-1 space-y-5">

            {/* ── Listing Details ── */}
            <div id="basics" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-5 text-base">
                <i className="fa-solid fa-h text-primary" /> Listing Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input name="title" value={form.title} onChange={handleChange} maxLength={80}
                      placeholder="Enter an attractive title"
                      className="w-full px-4 py-3 pr-16 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm bg-gray-50" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{titleCount}/80</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-semibold text-gray-700">Description <span className="text-red-500">*</span></label>
                    <button onClick={handleGenerateDescription} disabled={aiLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-red-500 transition-all disabled:opacity-60">
                      {aiLoading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <i className="fa-solid fa-wand-magic-sparkles" />}
                      Write with AI
                    </button>
                  </div>
                  {!form.title && !form.location && (
                    <p className="text-xs text-yellow-600 mb-1 flex items-center gap-1">
                      <i className="fa-solid fa-lightbulb text-yellow-400" />
                      Fill in Title & Location first, then click Write Description
                    </p>
                  )}
                  <div className="relative">
                    <textarea name="description" value={form.description} onChange={handleChange} rows={6} maxLength={1000}
                      placeholder="Tell guests what makes your place special..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm bg-gray-50 resize-none" />
                    <span className="absolute right-3 bottom-3 text-xs text-gray-400">{descCount}/1000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Owner Information ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-5 text-base">
                <i className="fa-solid fa-user text-primary" /> Owner Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Owner Name</label>
                  <input name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="Your full name"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Property Type <span className="text-red-500">*</span></label>
                  <select name="propertyType" value={form.propertyType} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50">
                    <option value="">Select type</option>
                    {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Email</label>
                  <input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} placeholder="youremail@example.com"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Phone</label>
                  <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="+1 310 555 1001"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50" />
                </div>
              </div>
            </div>

            {/* ── Property Details ── */}
            <div id="property" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-5 text-base">
                <i className="fa-solid fa-house text-primary" /> Property Details
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Guests <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input name="guests" type="number" min={0} value={form.guests} onChange={handleChange}
                      className="w-full px-3 py-2.5 pr-8 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50" />
                    <i className="fa-solid fa-users absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Beds</label>
                  <div className="relative">
                    <input name="beds" type="number" min={0} value={form.beds} onChange={handleChange}
                      className="w-full px-3 py-2.5 pr-8 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50" />
                    <i className="fa-solid fa-bed absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Baths</label>
                  <div className="relative">
                    <input name="baths" type="number" min={0} value={form.baths} onChange={handleChange}
                      className="w-full px-3 py-2.5 pr-8 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50" />
                    <i className="fa-solid fa-bath absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Location & Pricing ── */}
            <div id="location" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-5 text-base">
                <i className="fa-solid fa-location-dot text-primary" /> Location & Pricing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Location <span className="text-red-500">*</span></label>
                  <input name="location" value={form.location} onChange={handleChange} placeholder="City, neighborhood..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Country <span className="text-red-500">*</span></label>
                  <select name="country" value={form.country} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50">
                    <option value="">Select country</option>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Price per night (₹) <span className="text-red-500">*</span></label>
                  <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Enter price"
                    className="w-full md:w-1/2 px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50" />
                </div>
              </div>
            </div>

            {/* ── Amenities & Media ── */}
            <div id="amenities" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-5 text-base">
                <i className="fa-solid fa-images text-primary" /> Amenities & Media
              </h2>

              {/* Amenities tags */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.amenities.map(a => (
                    <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                      {a}
                      <button type="button" onClick={() => removeAmenity(a)}
                        className="text-gray-400 hover:text-red-500 transition-colors">
                        <i className="fa-solid fa-xmark text-[10px]" />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      value={amenityInput}
                      onChange={e => setAmenityInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(amenityInput) } }}
                      placeholder="Add more amenities"
                      className="px-3 py-1.5 border border-dashed border-gray-300 rounded-full text-xs focus:outline-none focus:border-primary bg-gray-50 w-36"
                    />
                    <button type="button" onClick={() => addAmenity(amenityInput)}
                      className="px-2 py-1.5 bg-primary text-white text-xs rounded-full hover:bg-red-500 transition-all">
                      <i className="fa-solid fa-plus" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload Images */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <i className="fa-solid fa-images text-primary text-sm" />
                  <label className="text-xs font-semibold text-gray-600">Upload Images</label>
                  <span className="text-xs text-gray-400">You can upload up to 10 images</span>
                </div>

                <label
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all mb-4 ${
                    dragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                  }`}>
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                    <i className="fa-solid fa-cloud-arrow-up text-primary" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP. Max size 10MB</p>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFileChange(e.target.files)} />
                </label>

                {/* Cover image selection */}
                {(existingImages.length > 0 || previewFiles.length > 0) && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Choose cover image</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {existingImages.map(img => (
                        <label key={img.filename} className={`block rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          coverSelection === `existing:${img.filename}` ? 'border-primary' : 'border-transparent'
                        }`}>
                          <img src={img.url} alt="existing" className="w-full h-24 object-cover" />
                          <div className="flex items-center justify-between px-2 py-1.5 bg-white text-xs text-gray-500">
                            <span>Existing</span>
                            <input type="radio" name="cover" value={`existing:${img.filename}`}
                              checked={coverSelection === `existing:${img.filename}`}
                              onChange={() => setCoverSelection(`existing:${img.filename}`)} />
                          </div>
                        </label>
                      ))}
                      {previewFiles.map((f, idx) => (
                        <label key={idx} className={`block rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          coverSelection === `new:${idx}` ? 'border-primary' : 'border-transparent'
                        }`}>
                          <img src={f.url} alt="new" className="w-full h-24 object-cover" />
                          <div className="flex items-center justify-between px-2 py-1.5 bg-white text-xs text-gray-500">
                            <span>New</span>
                            <input type="radio" name="cover" value={`new:${idx}`}
                              checked={coverSelection === `new:${idx}`}
                              onChange={() => setCoverSelection(`new:${idx}`)} />
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Save Changes button ── */}
            <div id="review">
              <button onClick={handleSubmit} disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-red-500 disabled:opacity-60 transition-all shadow-md text-base">
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><i className="fa-solid fa-floppy-disk" /> Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}