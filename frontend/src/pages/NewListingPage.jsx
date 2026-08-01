import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createListing, generateDescription } from '../utils/api'
import { useToast } from '../context/ToastContext'
import banner from '../public/newlisting.png'


const PROPERTY_TYPES = ['Apartment', 'Villa', 'Cabin', 'Cottage', 'Resort', 'Homestay', 'Hotel', 'Farmhouse', 'Treehouse', 'Houseboat', 'Other']
const COUNTRIES = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", 
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", 
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", 
  "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", 
  "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", 
  "Cyprus", "Czech Republic", "Democratic Republic of the Congo", "Denmark", "Djibouti", 
  "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", 
  "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", 
  "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", 
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", 
  "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", 
  "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", 
  "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", 
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", 
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", 
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", 
  "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", 
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", 
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", 
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", 
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", 
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", 
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", 
  "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", 
  "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", 
  "Zimbabwe", 'Other',]
const ALL_AMENITIES = [
  { icon: 'fa-wifi', label: 'WiFi' },
  { icon: 'fa-person-swimming', label: 'Pool' },
  { icon: 'fa-utensils', label: 'Kitchen' },
  { icon: 'fa-square-parking', label: 'Parking' },
  { icon: 'fa-snowflake', label: 'Air Conditioning' },
  { icon: 'fa-tv', label: 'TV' },
  { icon: 'fa-fire-flame-curved', label: 'Heating' },
  { icon: 'fa-soap', label: 'Washer' },
  { icon: 'fa-briefcase', label: 'Workspace' },
  { icon: 'fa-dumbbell', label: 'Gym' },
  { icon: 'fa-paw', label: 'Pet Friendly' },
  { icon: 'fa-smoking', label: 'Smoking Allowed' },
  { icon: 'fa-hot-tub-person', label: 'Hot Tub' },
  { icon: 'fa-mug-hot', label: 'Breakfast' },
]
const TIPS = ['Add a catchy title', 'Write a detailed description', 'Upload high-quality photos', 'Set a competitive price', 'Add popular amenities']

export default function NewListingPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [amenitySearch, setAmenitySearch] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewFiles, setPreviewFiles] = useState([])
  const [coverIndex, setCoverIndex] = useState(0)
  const [selectedAmenities, setSelectedAmenities] = useState([])
  const [dragging, setDragging] = useState(false)
  const [titleCount, setTitleCount] = useState(0)
  const [descCount, setDescCount] = useState(0)

  const [form, setForm] = useState({
    title: '', description: '', ownerName: '', contactEmail: '',
    contactPhone: '', propertyType: '', guests: 0, beds: 0, baths: 0,
    price: '', location: '', country: '',
  })

  const handleChange = e => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (name === 'title') setTitleCount(value.length)
    if (name === 'description') setDescCount(value.length)
  }

  const toggleAmenity = label =>
    setSelectedAmenities(prev => prev.includes(label) ? prev.filter(a => a !== label) : [...prev, label])

  const handleFileChange = files => {
    const arr = Array.from(files)
    const previews = arr.map(f => ({ url: URL.createObjectURL(f), name: f.name }))
    setSelectedFiles(prev => [...prev, ...arr])
    setPreviewFiles(prev => [...prev, ...previews])
  }

  const removeFile = idx => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx))
    setPreviewFiles(prev => prev.filter((_, i) => i !== idx))
    if (coverIndex >= idx && coverIndex > 0) setCoverIndex(c => c - 1)
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
        amenities: selectedAmenities.join(', '), guests: form.guests, beds: form.beds, baths: form.baths,
      })
      setForm(p => ({ ...p, description: res.data.description }))
      setDescCount(res.data.description.length)
      addToast('Description generated!')
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
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      formData.append('amenities', selectedAmenities.join(','))
      selectedFiles.forEach(f => formData.append('images', f))
      if (selectedFiles.length > 0) formData.append('coverImageIndex', coverIndex)
      const res = await createListing(formData)
      addToast('Listing published! 🎉')
      navigate(`/listings/${res.data.listing._id}`)
    } catch (e) { addToast(e.response?.data?.error || 'Failed to create listing', 'error') }
    finally { setLoading(false) }
  }

  const filteredAmenities = ALL_AMENITIES.filter(a =>
    a.label.toLowerCase().includes(amenitySearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
<div className="bg-white border-b border-gray-100">
  <div className="max-w-7xl mx-auto px-6 py-6">
    <div className="relative w-full h-48 md:h-56 rounded-2xl overflow-hidden">
      <img
        src={banner}
        alt="Share your property banner"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Gradient overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent" />

      {/* Text content */}
      <div className="relative h-full flex flex-col justify-center px-8 md:px-10 max-w-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Share Your Property
        </h1>
        <p className="text-gray-600 mt-2">
          Create a new listing and start welcoming guests today
        </p>
      </div>
    </div>
  </div>
</div>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── LEFT — Full Form ── */}
          <div className="flex-1 space-y-5">

            {/* WanderAI Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-robot text-violet-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">WanderAI Listing Assistant</p>
                      <span className="bg-violet-100 text-violet-600 text-xs px-2 py-0.5 rounded-full font-medium">Beta</span>
                    </div>
                    <p className="text-xs text-gray-500">Let AI help you create an attractive and high-converting listing.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={handleGenerateDescription} disabled={aiLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold rounded-lg hover:bg-yellow-100 transition-all disabled:opacity-60">
                    {aiLoading ? <div className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" /> : '✨'}
                    Generate Description
                  </button>
                  <button onClick={() => addToast('Coming soon!')} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold rounded-lg hover:bg-purple-100 transition-all">🪄 Suggest Title</button>
                  <button onClick={() => addToast('Coming soon!')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-100 transition-all">💰 Suggest Price</button>
                  <button onClick={() => addToast('Coming soon!')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-100 transition-all">📍 Improve Location</button>
                </div>
              </div>
            </div>

            {/* ── Listing Details ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-5 text-base">
                <i className="fa-solid fa-h text-primary" /> Listing Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input name="title" value={form.title} onChange={handleChange} maxLength={80}
                      placeholder="Enter an attractive title for your property"
                      className="w-full px-4 py-3 pr-16 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm bg-gray-50" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{titleCount}/80</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Description <span className="text-red-500">*</span></label>
                      <p className="text-xs text-gray-400">Describe your property, unique features, nearby attractions, and more.</p>
                    </div>
                    <button onClick={handleGenerateDescription} disabled={aiLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-red-500 transition-all disabled:opacity-60 flex-shrink-0 ml-3">
                      {aiLoading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <i className="fa-solid fa-wand-magic-sparkles" />}
                      Write with AI
                    </button>
                  </div>
                  <div className="relative">
                    <textarea name="description" value={form.description} onChange={handleChange} rows={5} maxLength={1000}
                      placeholder="Tell guests what makes your place special..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm bg-gray-50 resize-none" />
                    <span className="absolute right-3 bottom-3 text-xs text-gray-400">{descCount}/1000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Owner + Property ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-4 text-base">
                  <i className="fa-solid fa-user text-primary" /> Owner Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Owner Name <span className="text-red-500">*</span></label>
                    <input name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="Your full name"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address <span className="text-red-500">*</span></label>
                    <input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} placeholder="youremail@example.com"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <select className="w-20 px-2 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none">
                        <option>+91</option><option>+1</option><option>+44</option><option>+61</option>
                      </select>
                      <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="81234 56789"
                        className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-4 text-base">
                  <i className="fa-solid fa-house text-primary" /> Property Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Property Type <span className="text-red-500">*</span></label>
                    <select name="propertyType" value={form.propertyType} onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50">
                      <option value="">Select property type</option>
                      {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Guests <span className="text-red-500">*</span></label>
                      <input name="guests" type="number" min={0} value={form.guests} onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Beds <span className="text-red-500">*</span></label>
                      <input name="beds" type="number" min={0} value={form.beds} onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Baths <span className="text-red-500">*</span></label>
                    <input name="baths" type="number" min={0} value={form.baths} onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Location & Pricing ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-4 text-base">
                <i className="fa-solid fa-location-dot text-primary" /> Location & Pricing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Location <span className="text-red-500">*</span></label>
                  <input name="location" value={form.location} onChange={handleChange} placeholder="City, neighborhood, or address"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Price per night (₹) <span className="text-red-500">*</span></label>
                  <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Enter price"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50" />
                  <p className="text-xs text-gray-400 mt-1">You can change this anytime.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Country <span className="text-red-500">*</span></label>
                  <select name="country" value={form.country} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 outline-none text-sm bg-gray-50">
                    <option value="">Select country</option>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={() => addToast('Map feature coming soon!')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-all">
                    <i className="fa-solid fa-map-location-dot" /> Set on map
                  </button>
                </div>
              </div>
            </div>

            {/* ── Amenities ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 font-bold text-gray-900 text-base">
                  <i className="fa-solid fa-star text-primary" /> Amenities
                  <span className="text-xs text-gray-400 font-normal">Select all that apply.</span>
                </h2>
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                  <input value={amenitySearch} onChange={e => setAmenitySearch(e.target.value)}
                    placeholder="Search amenities"
                    className="pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none bg-gray-50 w-40" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filteredAmenities.map(a => (
                  <button key={a.label} type="button" onClick={() => toggleAmenity(a.label)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${selectedAmenities.includes(a.label)
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                    <i className={`fa-solid ${a.icon} text-xs`} />{a.label}
                  </button>
                ))}
                <button type="button" onClick={() => addToast('More amenities coming soon!')}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-all">
                  <i className="fa-solid fa-plus text-xs" /> Add More
                </button>
              </div>
            </div>

            {/* ── Upload Photos ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-1 text-base">
                <i className="fa-solid fa-images text-primary" /> Upload Photos
                <span className="text-xs text-gray-400 font-normal ml-1">Add up to 10 photos. The first photo will be your cover image.</span>
              </h2>
              <label
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`mt-4 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${dragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                  }`}>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <i className="fa-solid fa-cloud-arrow-up text-primary text-xl" />
                </div>
                <p className="font-semibold text-gray-700 text-sm">Drag & drop images here</p>
                <p className="text-xs text-gray-400 mt-1">or click to <span className="text-primary font-semibold">browse</span></p>
                <p className="text-xs text-gray-300 mt-1">JPG, PNG or WebP • Max size 10MB</p>
                <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFileChange(e.target.files)} />
              </label>

              {previewFiles.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {previewFiles.map((f, idx) => (
                    <div key={idx} onClick={() => setCoverIndex(idx)}
                      className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${coverIndex === idx ? 'border-primary' : 'border-transparent'}`}>
                      <img src={f.url} alt={f.name} className="w-24 h-24 object-cover" />
                      {coverIndex === idx && (
                        <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-[10px] font-bold text-center py-0.5">Cover photo</div>
                      )}
                      <button type="button" onClick={e => { e.stopPropagation(); removeFile(idx) }}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
                        <i className="fa-solid fa-xmark text-[10px]" />
                      </button>
                    </div>
                  ))}
                  {previewFiles.length < 10 && (
                    <label className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all">
                      <i className="fa-solid fa-plus text-gray-300 text-xl" />
                      <span className="text-xs text-gray-400 mt-1">Add more</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFileChange(e.target.files)} />
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* ── Bottom Action Bar ── */}
            <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
              <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
                <i className="fa-solid fa-circle-check" /> All changes saved automatically
              </div>
              <div className="flex gap-3">
                <button onClick={() => addToast('Draft saved!')}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm">
                  <i className="fa-regular fa-floppy-disk" /> Save Draft
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-red-500 disabled:opacity-60 transition-all text-sm shadow-md">
                  <i className="fa-solid fa-rocket" />
                  {loading ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT — Sticky Preview + Tips ── */}
          <div className="lg:w-80 xl:w-96 flex-shrink-0 space-y-5">
            <div className="sticky top-20 space-y-5">

              {/* Live Preview */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-1 text-sm">
                  <i className="fa-regular fa-eye text-primary" /> Preview Listing
                </h3>
                <p className="text-xs text-gray-400 mb-4">See how guests will see your listing.</p>
                <div className="rounded-xl overflow-hidden bg-gray-100 h-44 mb-3 relative">
                  {previewFiles.length > 0 ? (
                    <img src={previewFiles[coverIndex]?.url} alt="cover" className="w-full h-full object-cover" />
                  ) : (
                    <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80" alt="placeholder" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">Cover Photo</div>
                </div>
                <p className="font-bold text-gray-900 text-base truncate">{form.title || 'Modern Mountain Villa'}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <i className="fa-solid fa-location-dot text-primary text-[10px]" />
                  {form.propertyType || 'Villa'} in {form.location || 'Manali, Himachal Pradesh, India'}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><i className="fa-solid fa-users text-gray-400" />{form.guests || 4} Guests</span>
                  <span className="flex items-center gap-1"><i className="fa-solid fa-bed text-gray-400" />{form.beds || 2} Beds</span>
                  <span className="flex items-center gap-1"><i className="fa-solid fa-bath text-gray-400" />{form.baths || 2} Baths</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{form.description || 'Your description will appear here...'}</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="font-bold text-gray-900 text-lg">
                    ₹{form.price ? Number(form.price).toLocaleString('en-IN') : '4,500'}
                    <span className="text-xs font-normal text-gray-500"> / night</span>
                  </p>
                  <p className="text-xs text-primary mt-0.5">Price may vary based on season</p>
                </div>
                <div className="mt-4 bg-violet-50 border border-violet-100 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="fa-solid fa-robot text-violet-500 text-sm" />
                    <span className="text-xs font-semibold text-violet-700">WanderAI Suggestion</span>
                    <span className="bg-violet-200 text-violet-700 text-[10px] px-1.5 py-0.5 rounded-full">Beta</span>
                  </div>
                  <p className="text-xs text-violet-600 mb-2">Complete more details to get AI suggestions for description, pricing, and more.</p>
                  <button onClick={handleGenerateDescription} disabled={aiLoading}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-all disabled:opacity-60">
                    {aiLoading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '✨'}
                    Get AI Suggestions
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Tips for a great listing</h3>
                <div className="space-y-2">
                  {TIPS.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-check text-green-500 text-[10px]" />
                      </div>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}