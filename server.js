const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow CORS from your GitHub Pages site
app.use(cors({
  origin: 'https://<your-github-username>.github.io' // <-- Replace with your actual GitHub Pages URL
}));
app.use(express.json({ limit: '50mb' }));

// Gemini API Proxy Endpoint
app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt, imageBase64, imageType } = req.body;

    // Build Gemini API request body
    const payload = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    };

    // Only add image if both type and data are present
    if (imageBase64 && imageType) {
      payload.contents[0].parts.push({
        inline_data: {
          mime_type: imageType,
          data: imageBase64
        }
      });
    }

    // Call Gemini API
    const apiKey = 'AIzaSyDYI5n4X1GbGnlmEsTgSMC8ZUm7Yt2Or7I';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Internal server error'
      }
    });
  }
});

// Health check or root
app.get('/', (req, res) => {
  res.send('Gemini API Proxy is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
