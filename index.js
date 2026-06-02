const express = require('express')
const app = express()
const PORT = process.env.PORT || 3001

// Simple token to prevent abuse — set PROXY_SECRET in Railway env vars
const PROXY_SECRET = process.env.PROXY_SECRET || 'changeme'

app.get('/health', (req, res) => res.json({ ok: true }))

app.get('/inventory/:steamId', async (req, res) => {
  // Auth check
  if (req.headers['x-proxy-secret'] !== PROXY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { steamId } = req.params
  if (!/^\d{17}$/.test(steamId)) {
    return res.status(400).json({ error: 'Invalid steamId' })
  }

  try {
    const response = await fetch(
      `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': `https://steamcommunity.com/profiles/${steamId}/inventory/`,
        },
      }
    )

    const text = await response.text()
    res.status(response.status)
      .set('Content-Type', 'application/json')
      .send(text)
  } catch (err) {
    console.error('Proxy error:', err.message)
    res.status(502).json({ error: 'Proxy fetch failed' })
  }
})

app.listen(PORT, () => console.log(`Steam proxy running on port ${PORT}`))
