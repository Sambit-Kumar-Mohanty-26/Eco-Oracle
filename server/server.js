const express = require('express');
const cors = require('cors');
const { analyzeForest } = require('./controllers/auditController'); 
const { predictDisaster } = require('./controllers/guardianController');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.get('/test', (req, res) => res.json({ status: 'Online' }));
app.post('/api/analyze', analyzeForest);
app.post('/api/predict', predictDisaster);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));