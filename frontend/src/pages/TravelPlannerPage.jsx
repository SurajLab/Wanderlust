import { useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../utils/api'

// Questions with MCQ options
const QUESTIONS = [
  {
    id: 'destination',
    question: '🌍 Where would you like to go?',
    subtitle: 'Pick a destination or region',
    type: 'mcq',
    options: ['India', 'United States', 'Europe', 'Southeast Asia', 'Middle East', 'Australia', 'Anywhere'],
    skippable: true,
  },
  {
    id: 'budget',
    question: '💰 What is your budget per night?',
    subtitle: 'Select your comfortable price range',
    type: 'mcq',
    options: ['Under ₹1,000', '₹1,000 – ₹3,000', '₹3,000 – ₹6,000', '₹6,000 – ₹10,000', 'Above ₹10,000'],
    skippable: false,
  },
  {
    id: 'guests',
    question: '👥 How many guests?',
    subtitle: 'Including yourself',
    type: 'mcq',
    options: ['1 (Solo)', '2 (Couple)', '3–4 (Small group)', '5–8 (Family)', '8+ (Large group)'],
    skippable: false,
  },
  {
    id: 'propertyType',
    question: '🏠 What type of property do you prefer?',
    subtitle: 'Choose what suits your vibe',
    type: 'mcq',
    options: ['Villa', 'Apartment', 'Cabin', 'Cottage', 'Resort', 'Homestay', 'Any type'],
    skippable: true,
  },
  {
    id: 'amenities',
    question: '✨ Any must-have amenities?',
    subtitle: 'Pick what matters most to you',
    type: 'mcq',
    options: ['Pool', 'Wifi', 'Kitchen', 'Parking', 'Beach Access', 'Mountain View', 'No preference'],
    skippable: true,
  },
  {
    id: 'vibe',
    question: '🎯 What is the purpose of your trip?',
    subtitle: 'Tell us your travel mood',
    type: 'mcq',
    options: ['Relaxation & Leisure', 'Adventure & Exploration', 'Romantic Getaway', 'Family Vacation', 'Work & Remote', 'Cultural Experience'],
    skippable: true,
  },
]

function ListingMiniCard({ listing }) {
  const coverImage = listing.coverImage?.url || listing.images?.[0]?.url || listing.image?.url
  const price = listing.price?.toLocaleString('en-IN') || '0'

  return (
    <Link
      to={`/listings/${listing._id}`}
      target="_blank"
      className="flex gap-3 bg-white border border-gray-100 rounded-2xl p-3 hover:shadow-md transition-all group no-underline"
    >
      <img
        src={coverImage || 'https://placehold.co/200x200?text=No+Image'}
        alt={listing.title}
        className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
        onError={e => { e.target.src = 'https://placehold.co/200x200?text=No+Image' }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-primary transition-colors">{listing.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{listing.location}, {listing.country}</p>
        {listing.propertyType && (
          <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full mt-1">{listing.propertyType}</span>
        )}
        <p className="text-sm font-bold text-gray-900 mt-1">₹{price}<span className="text-xs font-normal text-gray-500">/night</span></p>
      </div>
      <div className="flex items-center text-primary">
        <i className="fa-solid fa-arrow-right text-xs" />
      </div>
    </Link>
  )
}

export default function TravelPlannerPage() {
  const [step, setStep] = useState(0) // current question index
  const [answers, setAnswers] = useState({})
  const [phase, setPhase] = useState('intro') // intro | questions | loading | results
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const currentQ = QUESTIONS[step]

  const handleAnswer = async (answer) => {
    const newAnswers = { ...answers, [currentQ.id]: answer }
    setAnswers(newAnswers)

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      await fetchRecommendations(newAnswers)
    }
  }

  const handleSkip = async () => {
    const newAnswers = { ...answers, [currentQ.id]: null }
    setAnswers(newAnswers)

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      await fetchRecommendations(newAnswers)
    }
  }

  const fetchRecommendations = async (finalAnswers) => {
    setPhase('loading')
    setError('')
    try {
      const res = await API.post('/ai/travel-planner', { answers: finalAnswers })
      setResults(res.data)
      setPhase('results')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
      setPhase('questions')
    }
  }

  const handleRestart = () => {
    setStep(0)
    setAnswers({})
    setPhase('intro')
    setResults(null)
    setError('')
  }

  const progress = Math.round((step / QUESTIONS.length) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-red-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i className="fa-solid fa-wand-magic-sparkles text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Travel Planner</h1>
          <p className="text-gray-500 mt-2">Answer a few quick questions and we'll find the perfect WanderLust property for you</p>
        </div>

        {/* INTRO */}
        {phase === 'intro' && (
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 text-center">
            <div className="space-y-4 mb-8">
              {[
                { icon: 'fa-comments', text: 'Answer simple questions about your trip' },
                { icon: 'fa-database', text: 'AI searches only WanderLust listings' },
                { icon: 'fa-star', text: 'Get personalized property recommendations' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-primary/10 rounded-xl p-3">
                  <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`fa-solid ${item.icon} text-primary text-sm`} />
                  </div>
                  <p className="text-sm text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setPhase('questions')}
              className="w-full bg-primary text-white font-semibold py-4 rounded-2xl hover:bg-red-500 transition-colors flex items-center justify-center gap-2 text-lg"
            >
              <i className="fa-solid fa-rocket" />
              Start Planning My Trip
            </button>
          </div>
        )}

        {/* QUESTIONS */}
        {phase === 'questions' && (
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Question {step + 1} of {QUESTIONS.length}</span>
                <span>{progress}% complete</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{currentQ.question}</h2>
              <p className="text-sm text-gray-500">{currentQ.subtitle}</p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">
                <i className="fa-solid fa-circle-exclamation mr-2" />{error}
              </div>
            )}

            {/* MCQ Options */}
            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className="text-left px-4 py-3 border-2 border-gray-100 rounded-xl hover:border-primary hover:bg-primary/5 transition-all font-medium text-gray-700 flex items-center justify-between group"
                >
                  <span>{option}</span>
                  <i className="fa-solid fa-arrow-right text-gray-300 group-hover:text-primary transition-colors text-sm" />
                </button>
              ))}
            </div>

            {/* Skip button */}
            {currentQ.skippable && (
              <button
                onClick={handleSkip}
                className="w-full mt-4 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-forward" />
                Skip this question
              </button>
            )}
          </div>
        )}

        {/* LOADING */}
        {phase === 'loading' && (
          <div className="bg-white rounded-3xl shadow-lg p-12 border border-gray-100 text-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Finding your perfect stay...</h2>
            <p className="text-gray-500 text-sm">AI is searching through WanderLust listings based on your preferences</p>
            <div className="flex justify-center gap-1 mt-6">
              {['Analyzing preferences', 'Searching listings', 'Crafting recommendations'].map((t, i) => (
                <span key={i} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {phase === 'results' && results && (
          <div className="space-y-6">
            {/* AI Message */}
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-r from-primary to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-wand-magic-sparkles text-white text-sm" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">WanderLust AI Planner</p>
                  <p className="text-xs text-gray-400">Based on your preferences</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{results.message}</p>
            </div>

            {/* Matched Listings */}
            {results.listings && results.listings.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-house-chimney text-primary" />
                  Recommended Properties ({results.listings.length})
                </h3>
                <div className="space-y-3">
                  {results.listings.map(listing => (
                    <ListingMiniCard key={listing._id} listing={listing} />
                  ))}
                </div>
              </div>
            )}

            {/* No listings found */}
            {results.listings && results.listings.length === 0 && (
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 text-center">
                <i className="fa-solid fa-magnifying-glass text-4xl text-gray-300 mb-3 block" />
                <p className="font-semibold text-gray-700">No exact matches found</p>
                <p className="text-sm text-gray-500 mt-1">Try different preferences or browse all listings</p>
                <Link to="/listings" className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded-xl font-medium hover:shadow-md transition-all">
                  Browse All Listings
                </Link>
              </div>
            )}

            {/* Summary chips */}
            <div className="bg-white rounded-3xl shadow-lg p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Your Preferences</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(answers).filter(([, v]) => v).map(([k, v]) => (
                  <span key={k} className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium capitalize">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleRestart}
                className="flex-1 py-3 border-2 border-primary/30 text-primary font-semibold rounded-2xl hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-rotate-left" />
                Plan Again
              </button>
              <Link
                to="/listings"
                className="flex-1 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-compass" />
                Browse All
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}