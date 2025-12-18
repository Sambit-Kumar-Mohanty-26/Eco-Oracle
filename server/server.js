const express = require('express');
const cors = require('cors');
const { fetchSatelliteImage } = require('./services/sentinel');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ status: 'Online', message: 'Eco-Oracle Engine Room Active' });
});

app.post('/api/analyze', async (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: "Missing coordinates" });

  try {
    const path = await fetchSatelliteImage(lat, lng);
    res.json({ success: true, message: "Satellite image captured", filePath: path });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));