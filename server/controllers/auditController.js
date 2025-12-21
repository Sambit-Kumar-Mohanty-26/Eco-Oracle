const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { fetchFullEvidence } = require('../services/sentinel'); // Fetches RGB + NDVI
const { mintNFT } = require('../services/verbwire');
const Audit = require('../models/Audit');

const analyzeForest = async (req, res) => {
  const { lat, lng, userId } = req.body; 

  if (!lat || !lng || !userId) {
    return res.status(400).json({ error: "Missing data (lat, lng, or userId)" });
  }

  try {
    console.log(`📡 Initializing Temporal Audit for User: ${userId} at [${lat}, ${lng}]...`);
    const images = await fetchFullEvidence(lat, lng);
    const pythonScript = path.join(__dirname, '../scripts/analyze_advanced.py'); 
    let pythonCommand = process.env.NODE_ENV === 'production' 
        ? 'python3' 
        : path.join(__dirname, '../scripts/venv/Scripts/python.exe');
    const pythonProcess = spawn(pythonCommand, [pythonScript, images.current, images.historical]);
    
    let dataString = '';
    
    pythonProcess.stdout.on('data', (data) => dataString += data.toString());
    pythonProcess.stderr.on('data', (data) => console.error(`Python Error: ${data}`));

    pythonProcess.on('close', async (code) => {
      try {
        const result = JSON.parse(dataString);
        console.log("📊 AI Analysis Complete:", result);

        if (result.error) {
            throw new Error(result.error);
        }
        
        let mintResult = null;
        let uniqueImageName = `audit_${Date.now()}.png`;

        if (result.status === "VERIFIED") {
            console.log("🌲 Forest Healthy & Stable. Minting Carbon Credit...");

            mintResult = await mintNFT(images.current, result.biomass_score, lat, lng, result.carbon_tonnes);
            const imageBuffer = fs.readFileSync(images.current);
            const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
            const uniquePath = path.join(__dirname, '../temp', uniqueImageName);
            fs.copyFileSync(images.current, uniquePath);
            const newAudit = new Audit({
                userId: userId,
                lat: lat,
                lng: lng,
                biomassScore: result.biomass_score,
                carbonTonnes: result.carbon_tonnes,
                deforestationRisk: result.deforestation_percent,
                
                imageName: uniqueImageName,
                imageData: base64Image,     
                
                contractAddress: mintResult?.transaction_details?.contractAddress || "N/A",
                tokenId: mintResult?.transaction_details?.tokenID || "PENDING",
                status: "VERIFIED"
            });
            await newAudit.save();
            console.log("💾 Scientific Record Saved to Asset Vault (Persistent).");
        } else {
            console.log(`❌ Audit Rejected: ${result.status}`);
        }

        res.json({
          success: true,
          ai_data: result,
          blockchain_data: mintResult
        });

      } catch (e) {
        console.error("Pipeline Logic Error:", e);
        res.status(500).json({ error: "Analysis Pipeline Failed", details: e.message });
      }
    });

  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { analyzeForest };