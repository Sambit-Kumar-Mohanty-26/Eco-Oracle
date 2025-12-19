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
    console.log("   ✅ Image saved to:", imagePath);
    console.log("🧠 2. Analyzing Biomass with Python...");
    const pythonScript = path.join(__dirname, '../scripts/analyze.py');
    let pythonCommand;
    if (process.env.NODE_ENV === 'production') {
        pythonCommand = 'python3'; 
    } else {
        pythonCommand = path.join(__dirname, '../scripts/venv/Scripts/python.exe');
    }
    
    console.log(`   👉 Using Python Interpreter: ${pythonCommand}`);
    const pythonProcess = spawn(pythonCommand, [pythonScript, imagePath]);

    let dataString = '';
    let errorString = '';
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });
    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
    });
    pythonProcess.on('close', async (code) => {
      try {
        if (code !== 0) {
            console.error("❌ Python Script Error:", errorString);
            throw new Error(`Python script exited with code ${code}`);
        }

        if (!dataString) {
            throw new Error("Python script returned no data.");
        }

        const result = JSON.parse(dataString);
        console.log("📊 3. AI Analysis Complete:", result);
        let mintResult = null;
        if (result.status === "VERIFIED") {
            console.log("🌲 Forest Verified. Initiating Blockchain Mint...");

            mintResult = await mintNFT(imagePath, result.biomass_score, lat, lng);
            
            if(mintResult) {
                console.log("   🔗 Minting Queued/Sent via Verbwire.");
            } else {
                console.log("   ⚠️ Minting attempted but failed (check logs).");
            }
        } else {
            console.log("⚠️ Biomass too low (Phantom Forest). Minting Skipped.");
        }

        res.json({
          success: true,
          imagePath: imagePath,
          ai_data: result,      
          blockchain_data: mintResult
        });

      } catch (e) {
        console.error("Pipeline Logic Error:", e);
        res.status(500).json({ 
          error: "Pipeline Processing Failed", 
          details: e.message,
          python_error: errorString
        });
      }
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { analyzeForest };