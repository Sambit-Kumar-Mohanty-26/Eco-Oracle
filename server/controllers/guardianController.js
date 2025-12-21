const { fetchSatelliteImage } = require('../services/sentinel');
const { getWeatherData } = require('../services/weather');
const { spawn } = require('child_process');
const path = require('path');
const twilio = require('twilio');
const Settings = require('../models/Settings');
const Watchlist = require('../models/Watchlist');
const { mintNFT, updateNFTStatus } = require('../services/verbwire'); 
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const calculateRisk = async (lat, lng) => {
    const weather = await getWeatherData(lat, lng);
    const imagePath = await fetchSatelliteImage(lat, lng, 'NDMI');
    const pythonScript = path.join(__dirname, '../scripts/moisture.py');
    let pythonCommand;
    if (process.env.NODE_ENV === 'production') {
        pythonCommand = 'python3'; 
    } else {
        pythonCommand = path.join(__dirname, '../scripts/venv/Scripts/python.exe');
    }

    return new Promise((resolve, reject) => {
        const pythonProcess = spawn(pythonCommand, [pythonScript, imagePath]);
        let dataString = '';
        pythonProcess.stdout.on('data', (data) => dataString += data.toString());
        
        pythonProcess.on('close', async () => {
            try {
                if (!dataString) throw new Error("Python analysis returned empty data");

                const moistureData = JSON.parse(dataString);
                
                let riskScore = 0;
                if (moistureData.dryness_score > 40) riskScore += 50;
                if (weather.wind_speed > 5) riskScore += 30;
                if (weather.temp > 28) riskScore += 20;
                
                const riskLevel = riskScore > 60 ? "CRITICAL" : "NORMAL";
                
                resolve({ weather, moistureData, riskLevel, riskScore, imagePath });
            } catch (e) { reject(e); }
        });
    });
};

const predictDisaster = async (req, res) => {
    const { lat, lng, userId, tokenId, contractAddress } = req.body;
    try {
        const result = await calculateRisk(lat, lng);
        
        let alertSent = false;
        let nftUpdated = false;

        if (result.riskLevel === "CRITICAL") {
            let targetPhone = process.env.MY_PHONE_NUMBER; 
            
            if (userId) {
                const settings = await Settings.findOne({ userId });
                if (settings && settings.phoneNumber) {
                    targetPhone = settings.phoneNumber;
                }
            }

            try {
                await client.messages.create({
                    body: `🔥 ECO-ORACLE ALERT: Critical Risk at ${result.weather.location}. Wind: ${result.weather.wind_speed}m/s. EVACUATE.`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: targetPhone
                });
                alertSent = true;
            } catch(e) { console.error("SMS Failed", e.message); }

            if (tokenId && contractAddress) {
                console.log(`   🔄 Attempting to Update Token #${tokenId}...`);
                const updateRes = await updateNFTStatus(contractAddress, tokenId, "CRITICAL");
                
                if (updateRes) {
                    nftUpdated = true;
                } else {
                    console.log("   ⚠️ Update failed (Indexing). Minting Fallback...");
                    await mintNFT(result.imagePath, "CRITICAL FIRE RISK", lat, lng);
                    nftUpdated = true;
                }
            }
        }
        
        res.json({ success: true, risk_data: result, actions: { sms_sent: alertSent, nft_updated: nftUpdated } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

const runBatchScan = async (req, res) => {
    const { userId } = req.body;
    try {
        const targets = await Watchlist.find({ userId });
        const results = [];
        let alertsCount = 0;
        let targetPhone = process.env.MY_PHONE_NUMBER;
        const settings = await Settings.findOne({ userId });
        if (settings && settings.phoneNumber) targetPhone = settings.phoneNumber;

        for (const target of targets) {
            console.log(`Scanning ${target.name}...`);
            try {
                const risk = await calculateRisk(target.lat, target.lng);
            
                target.lastStatus = risk.riskLevel;
                target.lastChecked = new Date();
                await target.save();

                if (risk.riskLevel === "CRITICAL") {
                    await client.messages.create({
                        body: `🔥 AUTOMATED ALERT: ${target.name} is at CRITICAL FIRE RISK. Dryness: ${risk.moistureData.dryness_score}%.`,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: targetPhone
                    });
                    alertsCount++;
                }
                results.push({ name: target.name, status: risk.riskLevel });
            } catch (err) {
                console.error(`Failed to scan ${target.name}:`, err.message);
            }
        }

        res.json({ success: true, scanned: results.length, alerts_sent: alertsCount, results });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = { predictDisaster, runBatchScan };