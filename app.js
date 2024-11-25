require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.set('view engine', 'pug');

// Home Route
app.get('/', async (req, res) => {
  try {
    // Default query for artworks
    const query = req.query.q;
    const apiUrl = `${process.env.ARTIC_API_URL}/artworks/search?q=${query}`;
    const response = await axios.get(apiUrl);
    const artworks = response.data.data;
    // Define suggestions and categories
    const suggestions = ['Impressionism', 'Van Gogh', 'Mona Lisa', 'Renaissance', 'Abstract', 'Cubism'];
    const categories = ['Paintings', 'Sculptures', 'Drawings', 'Modern Art', 'Classical Art'];
  
    res.render('index', { artworks, query, suggestions, categories });
  } catch (error) {
    console.error(error);
    res.render('index', { artworks: [], query: '', error: 'Failed to fetch artworks' });
  }
});

// Artwork Details Route
app.get('/artwork/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const artworkResponse = await axios.get(`${process.env.ARTIC_API_URL}/artworks/${id}`);
    const artwork = artworkResponse.data.data;

    const wikiResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        format: 'json',
        prop: 'extracts',
        titles: artwork.artist_title,
        exintro: true,
        explaintext: true,
      },
    });

    const artistInfo = Object.values(wikiResponse.data.query.pages)[0]?.extract || 'No additional information available.';
    res.render('artwork', { artwork, artistInfo });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
