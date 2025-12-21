const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { analyzeForest } = require('./controllers/auditController'); 
const { predictDisaster } = require('./controllers/guardianController');
const Audit = require('./models/Audit');
const Settings = require('./models/Settings');
const Watchlist = require('./models/Watchlist');
const crypto = require('crypto');
const { runBatchScan } = require('./controllers/guardianController');
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
app.get('/api/settings', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "UserID required" });

    try {
        let settings = await Settings.findOne({ userId });
        if (!settings) {
            const newKey = 'sk_live_' + crypto.randomBytes(16).toString('hex');
            settings = await Settings.create({ userId, apiKey: newKey });
        }
        res.json(settings);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/settings', async (req, res) => {
    const { userId, phoneNumber } = req.body;
    try {
        const updated = await Settings.findOneAndUpdate(
            { userId },
            { phoneNumber },
            { new: true, upsert: true }
        );
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/watchlist', async (req, res) => {
    const { userId } = req.query;
    const list = await Watchlist.find({ userId });
    res.json(list);
});

app.post('/api/watchlist', async (req, res) => {
    const { userId, name, lat, lng } = req.body;
    try {
        const newItem = await Watchlist.create({ userId, name, lat, lng });
        res.json(newItem);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/guardian/scan', runBatchScan);
app.delete('/api/watchlist/:id', async (req, res) => {
    const { id } = req.params;    
    const { userId } = req.query;   

    try {
        const result = await Watchlist.findOneAndDelete({ _id: id, userId: userId });
        
        if (!result) {
            return res.status(404).json({ error: "Item not found or unauthorized" });
        }
        
        res.json({ success: true, message: "Target Removed" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.get('/api/registry', async (req, res) => {
    try {
        const publicAudits = await Audit.find({ status: "VERIFIED" })
            .sort({ timestamp: -1 })
            .limit(50)
            .select('-userId');
        res.json(publicAudits);
    } catch (error) {
        res.status(500).json({ error: "Registry fetch failed" });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));