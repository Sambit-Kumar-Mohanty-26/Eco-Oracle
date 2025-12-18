const express = require('express');
const cors = require('cors');
// CHANGE 1: Import the new controller instead of the service
const { analyzeForest } = require('./controllers/auditController'); 
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ status: 'Online', message: 'Eco-Oracle Engine Room Active' });
});

// CHANGE 2: Use the controller function to handle the route
// The controller now handles fetching the image AND running the Python script
app.post('/api/analyze', analyzeForest);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));