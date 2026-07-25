const express = require('express')
const router = express.Router()
const Listing = require('../models/listing')

// ── AI Description Generator ────────────────────────────────────
router.post('/generate-description', async (req, res) => {
  const { title, location, propertyType, amenities, guests, beds, baths } = req.body

  if (!title || !location) {
    return res.status(400).json({ error: 'Title and location are required to generate description' })
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: 'You are a professional vacation rental copywriter. Write short, warm, and attractive property descriptions.'
          },
          {
            role: 'user',
            content: `Write a property description for a vacation rental with these details:
- Title: ${title}
- Location: ${location}
- Property Type: ${propertyType || 'property'}
- Guests: ${guests || 'N/A'}
- Beds: ${beds || 'N/A'}
- Baths: ${baths || 'N/A'}
- Amenities: ${amenities || 'standard amenities'}

Write 3-4 sentences. Be warm, inviting and highlight the best features. No bullet points. No headings.`
          }
        ]
      })
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('[AI] Groq API error:', JSON.stringify(data))
      return res.status(500).json({ error: data.error?.message || 'Failed to generate description' })
    }

    const description = data.choices?.[0]?.message?.content || ''
    res.json({ description })
  } catch (err) {
    console.error('[AI] Error:', err.message)
    res.status(500).json({ error: 'Failed to generate description' })
  }
})

// ── AI Travel Planner ───────────────────────────────────────────
router.post('/travel-planner', async (req, res) => {
  const { answers } = req.body
  if (!answers) return res.status(400).json({ error: 'Answers are required' })

  try {
    // Build MongoDB query from answers
    const query = {}

    // Budget filter
    if (answers.budget) {
      if (answers.budget === 'Under ₹1,000') query.price = { $lte: 1000 }
      else if (answers.budget === '₹1,000 – ₹3,000') query.price = { $gte: 1000, $lte: 3000 }
      else if (answers.budget === '₹3,000 – ₹6,000') query.price = { $gte: 3000, $lte: 6000 }
      else if (answers.budget === '₹6,000 – ₹10,000') query.price = { $gte: 6000, $lte: 10000 }
      else if (answers.budget === 'Above ₹10,000') query.price = { $gte: 10000 }
    }

    // Guests filter
    if (answers.guests) {
      if (answers.guests === '1 (Solo)') query.guests = { $gte: 1 }
      else if (answers.guests === '2 (Couple)') query.guests = { $gte: 2 }
      else if (answers.guests === '3–4 (Small group)') query.guests = { $gte: 3 }
      else if (answers.guests === '5–8 (Family)') query.guests = { $gte: 5 }
      else if (answers.guests === '8+ (Large group)') query.guests = { $gte: 8 }
    }

    // Destination filter
    if (answers.destination && answers.destination !== 'Anywhere') {
      query.$or = [
        { country: { $regex: answers.destination, $options: 'i' } },
        { location: { $regex: answers.destination, $options: 'i' } },
      ]
    }

    // Property type filter
    if (answers.propertyType && answers.propertyType !== 'Any type') {
      query.propertyType = { $regex: answers.propertyType, $options: 'i' }
    }

    // Amenities filter
    if (answers.amenities && answers.amenities !== 'No preference') {
      query.amenities = { $regex: answers.amenities, $options: 'i' }
    }

    // Fetch matching listings (max 6)
    let listings = await Listing.find(query).limit(6).lean()

    // If strict query returns nothing, relax to budget + guests only
    if (listings.length === 0) {
      const relaxedQuery = {}
      if (query.price) relaxedQuery.price = query.price
      if (query.guests) relaxedQuery.guests = query.guests
      listings = await Listing.find(relaxedQuery).limit(6).lean()
    }

    // Build context for AI
    const listingSummary = listings.length > 0
      ? listings.map((l, i) =>
          `${i + 1}. "${l.title}" - ${l.propertyType || 'Property'} in ${l.location}, ${l.country}. Price: ₹${l.price}/night. Guests: ${l.guests || 'N/A'}. Amenities: ${l.amenities?.join(', ') || 'N/A'}.`
        ).join('\n')
      : 'No exact matches found in the database.'

    const userPrefs = Object.entries(answers)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ')

    // Ask Groq to write a personalized recommendation message
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 400,
        messages: [
          {
            role: 'system',
            content: 'You are a friendly WanderLust travel assistant. Based on user preferences and available listings, write a warm, helpful 3-4 sentence recommendation message. Be specific about why these properties match their needs. If no listings found, suggest they broaden their search.'
          },
          {
            role: 'user',
            content: `User preferences: ${userPrefs}\n\nAvailable listings from our database:\n${listingSummary}\n\nWrite a personalized recommendation message for these listings.`
          }
        ]
      })
    })

    const data = await response.json()
    const message = data.choices?.[0]?.message?.content || "Here are some great properties that match your preferences!"

    res.json({ message, listings })
  } catch (err) {
    console.error('[TRAVEL PLANNER] Error:', err.message)
    res.status(500).json({ error: 'Failed to get recommendations. Please try again.' })
  }
})

module.exports = router