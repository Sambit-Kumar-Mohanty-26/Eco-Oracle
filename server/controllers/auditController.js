const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { fetchSatelliteImage } = require('../services/sentinel');
const { mintNFT } = require('../services/verbwire');

const analyzeForest = async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing coordinates (lat, lng)" });
  }

  try {
    console.log(`📡 1. Fetching Satellite Image for [${lat}, ${lng}]...`);
    const imagePath = await fetchSatelliteImage(lat, lng);

    console.log("🧠 2. Analyzing Biomass with Python...");
    const pythonScript = path.join(__dirname, '../scripts/analyze.py');
    
    let pythonCommand;
    if (process.env.NODE_ENV === 'production') {
        pythonCommand = 'python3'; 
    } else {
        pythonCommand = path.join(__dirname, '../scripts/venv/Scripts/python.exe');
    }

    const pythonProcess = spawn(pythonCommand, [pythonScript, imagePath]);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => dataString += data.toString());
    pythonProcess.stderr.on('data', (data) => errorString += data.toString());

    pythonProcess.on('close', async (code) => {
      try {
        if (!dataString) throw new Error("Python script returned no data.");
        
        const result = JSON.parse(dataString);
        console.log("📊 3. AI Analysis Complete:", result);

        let mintResult = null;

        if (result.status === "VERIFIED") {
            console.log("🌲 Forest Verified. Initiating Custom Contract Mint...");

            mintResult = await mintNFT(imagePath, result.biomass_score, lat, lng);
            
            if(mintResult) {
                console.log(`   🔗 Minted Token ID: ${mintResult.transaction_details.tokenID}`);
            }
        } else {
            console.log("⚠️ Biomass low. Minting Skipped.");
        }

        res.json({
          success: true,
          imagePath: imagePath,
          ai_data: result,
          blockchain_data: mintResult
        });

      } catch (e) {
        console.error("Pipeline Logic Error:", e);
        res.status(500).json({ error: "Pipeline Failed", details: e.message });
      }
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { analyzeForest };