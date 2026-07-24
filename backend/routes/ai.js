const express = require('express')
const router = express.Router()

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

module.exports = router