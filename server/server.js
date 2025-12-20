const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { analyzeForest } = require('./controllers/auditController'); 
const { predictDisaster } = require('./controllers/guardianController');
const Audit = require('./models/Audit');
require('dotenv').config();

const app = express();
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("🍃 MongoDB Connected"))
  .catch(err => console.error("❌ DB Error:", err));

app.use(cors());
app.use(express.json());
app.use('/temp', express.static(path.join(__dirname, 'temp')));
app.get('/test', (req, res) => res.json({ status: 'Online' }));
app.post('/api/analyze', analyzeForest);
app.post('/api/predict', predictDisaster);
app.get('/api/audits', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "UserID required" });

    try {
        const audits = await Audit.find({ userId }).sort({ timestamp: -1 });
        res.json(audits);
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));