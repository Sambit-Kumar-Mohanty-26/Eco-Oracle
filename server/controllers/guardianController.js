const { fetchSatelliteImage } = require('../services/sentinel');
const { getWeatherData } = require('../services/weather');
const { spawn } = require('child_process');
const path = require('path');
const twilio = require('twilio');
const { mintNFT, updateNFTStatus } = require('../services/verbwire'); 
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const predictDisaster = async (req, res) => {
  let imagePath = ""; 
  const { lat, lng, tokenId, contractAddress } = req.body;

  try {
    console.log("🌪️ 1. Fetching Live Weather...");
    const weather = await getWeatherData(lat, lng);
    
    console.log("🛰️ 2. Fetching Satellite Moisture Map (NDMI)...");
    imagePath = await fetchSatelliteImage(lat, lng, 'NDMI');

    console.log("🧠 3. Analyzing Fuel Dryness...");
    const pythonScript = path.join(__dirname, '../scripts/moisture.py');
    
    let pythonCommand = process.env.NODE_ENV === 'production' 
        ? 'python3' 
        : path.join(__dirname, '../scripts/venv/Scripts/python.exe');

    const pythonProcess = spawn(pythonCommand, [pythonScript, imagePath]);
    let dataString = '';

    pythonProcess.stdout.on('data', (data) => dataString += data.toString());

    pythonProcess.on('close', async () => {
        try {
            const moistureData = JSON.parse(dataString);
            console.log(`   - Dryness Score: ${moistureData.dryness_score}%`);
            let riskScore = 0;
            if (moistureData.dryness_score > 40) riskScore += 50; 
            if (weather.wind_speed > 5) riskScore += 30;          
            if (weather.temp > 28) riskScore += 20;               

            const riskLevel = riskScore > 60 ? "CRITICAL" : "NORMAL";
            let alertSent = false;
            let nftUpdated = false;

            if (riskLevel === "CRITICAL") {
                console.log("🚨 CRITICAL RISK DETECTED!");

                try {
                    await client.messages.create({
                        body: `🔥 FIRE WARNING: ${weather.location}. Wind: ${weather.wind_speed}m/s. Asset Frozen.`,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: process.env.MY_PHONE_NUMBER
                    });
                    console.log("   ✅ SMS Sent");
                    alertSent = true;
                } catch (e) { console.error("   ❌ Twilio Error:", e.message); }

                if (tokenId && contractAddress) {
                    console.log(`   🔄 Attempting to Update Token #${tokenId}...`);
                    const updateRes = await updateNFTStatus(contractAddress, tokenId, "CRITICAL");
                    
                    if (updateRes) {
                        console.log("   ✅ NFT Metadata Updated.");
                        nftUpdated = true;
                    } else {
                        console.log("   ⚠️ Update failed (API Indexing Lag).");
                        console.log("   🚀 FALLBACK: Minting new 'EMERGENCY ALERT' NFT...");
                        
                        await mintNFT(imagePath, "CRITICAL FIRE RISK", lat, lng);
                        console.log("   ✅ Emergency Blockchain Record Created.");
                        nftUpdated = true;
                    }
                }
            }

            res.json({ 
                success: true, 
                risk_data: { ...weather, ...moistureData, riskLevel }, 
                actions: { sms_sent: alertSent, nft_updated: nftUpdated }
            });

        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "Analysis Failed" });
        }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { predictDisaster };