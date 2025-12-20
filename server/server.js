const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { analyzeForest } = require('./controllers/auditController'); 
const { predictDisaster } = require('./controllers/guardianController');
const Audit = require('./models/Audit');
require('dotenv').config();

const app = express();
mongoose.connect(process.env.MONGODB_URL)
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
app.get('/api/stats', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "UserID required" });

    try {
        const totalAudits = await Audit.countDocuments({ userId });
        const activeAlerts = await Audit.countDocuments({ userId, status: "CRITICAL" });
        const totalArea = totalAudits * 50;

        res.json({
            total_credits: totalAudits,
            total_area: totalArea,
            active_alerts: activeAlerts
        });
    } catch (error) {
        res.status(500).json({ error: "Stats failed" });
    }
});
app.get('/api/activity', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "UserID required" });

    try {
        const recentAudits = await Audit.find({ userId })
            .sort({ timestamp: -1 })
            .limit(10);
            
        res.json(recentAudits);
    } catch (error) {
        res.status(500).json({ error: "Activity failed" });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));