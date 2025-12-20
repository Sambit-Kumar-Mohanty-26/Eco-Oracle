const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { fetchSatelliteImage } = require('../services/sentinel');
const { mintNFT } = require('../services/verbwire');
const Audit = require('../models/Audit');

const analyzeForest = async (req, res) => {
  const { lat, lng, userId } = req.body; 

  if (!lat || !lng || !userId) {
    return res.status(400).json({ error: "Missing data (lat, lng, or userId)" });
  }

  try {
    console.log(`📡 Fetching for User: ${userId} at [${lat}, ${lng}]...`);
    const tempPath = await fetchSatelliteImage(lat, lng);
    const pythonScript = path.join(__dirname, '../scripts/analyze.py');
    let pythonCommand = process.env.NODE_ENV === 'production' ? 'python3' : path.join(__dirname, '../scripts/venv/Scripts/python.exe');
    
    const pythonProcess = spawn(pythonCommand, [pythonScript, tempPath]);
    let dataString = '';

    pythonProcess.stdout.on('data', (data) => dataString += data.toString());

    pythonProcess.on('close', async (code) => {
      try {
        const result = JSON.parse(dataString);
        console.log("📊 Score:", result.biomass_score);
        
        let mintResult = null;
        let uniqueImageName = `audit_${Date.now()}.png`;

        if (result.status === "VERIFIED") {
            console.log("🌲 Minting...");
            mintResult = await mintNFT(tempPath, result.biomass_score, lat, lng);
            const uniquePath = path.join(__dirname, '../temp', uniqueImageName);
            fs.copyFileSync(tempPath, uniquePath);
            const newAudit = new Audit({
                userId: userId,
                lat: lat,
                lng: lng,
                biomassScore: result.biomass_score,
                imageName: uniqueImageName,
                contractAddress: mintResult?.transaction_details?.contractAddress || "N/A",
                tokenId: mintResult?.transaction_details?.tokenID || "PENDING",
                status: "VERIFIED"
            });
            await newAudit.save();
            console.log("💾 Saved to Asset Vault (MongoDB)");
        } 

        res.json({
          success: true,
          ai_data: result,
          blockchain_data: mintResult
        });

      } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Pipeline Failed" });
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { analyzeForest };