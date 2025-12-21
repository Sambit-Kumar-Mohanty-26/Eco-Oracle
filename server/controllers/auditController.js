const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { fetchFullEvidence } = require('../services/sentinel'); 
const { mintNFT, updateNFTStatus } = require('../services/verbwire');
const Audit = require('../models/Audit');

const analyzeForest = async (req, res) => {
  const { lat, lng, userId, mode, tokenId, contractAddress } = req.body; 

  if (!lat || !lng || !userId) {
    return res.status(400).json({ error: "Missing data" });
  }

  try {
    const isSim = mode === 'SIMULATION';
    console.log(`📡 Initializing Audit...`);
    const images = await fetchFullEvidence(lat, lng);

    const pythonScript = path.join(__dirname, '../scripts/analyze_advanced.py'); 
    let pythonCommand = process.env.NODE_ENV === 'production' ? 'python3' : path.join(__dirname, '../scripts/venv/Scripts/python.exe');
    
    const pythonProcess = spawn(pythonCommand, [pythonScript, images.current, images.historical]);
    let dataString = '';
    pythonProcess.stdout.on('data', (data) => dataString += data.toString());
    pythonProcess.stderr.on('data', (data) => console.error(`Python Error: ${data}`));

    pythonProcess.on('close', async (code) => {
      try {
        const result = JSON.parse(dataString);
        console.log("📊 AI Analysis Complete:", result);
        
        let mintResult = null;
        let updateResult = null;
        let actionTaken = "NONE";
        let uniqueImageName = `audit_${Date.now()}.png`;

        if (result.status === "VERIFIED" && !isSim) {
            if (tokenId && contractAddress) {
                console.log(`🔄 Re-Audit detected. Attempting to update Token #${tokenId}...`);
                updateResult = await updateNFTStatus(contractAddress, tokenId, "NORMAL", result.carbon_tonnes);

                if (updateResult) {
                    console.log("✅ Asset Level-Up Successful (Updated Metadata).");
                    actionTaken = "UPDATED";
                } else {
                    console.log("⚠️ Update Failed (Indexing Lag). Switching to Fallback Mint...");
                    console.log("🌲 Minting New Carbon Credit...");
                    mintResult = await mintNFT(images.current, result.biomass_score, lat, lng, result.carbon_tonnes);
                    actionTaken = "MINTED_FALLBACK";
                }
            } else {
                console.log("🌲 New Forest. Minting Carbon Credit...");
                mintResult = await mintNFT(images.current, result.biomass_score, lat, lng, result.carbon_tonnes);
                actionTaken = "MINTED_NEW";
            }

            const imageBuffer = fs.readFileSync(images.current);
            const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
            const uniquePath = path.join(__dirname, '../temp', uniqueImageName);
            fs.copyFileSync(images.current, uniquePath);

            const newAudit = new Audit({
                userId, lat, lng,
                biomassScore: result.biomass_score,
                carbonTonnes: result.carbon_tonnes,
                deforestationRisk: result.deforestation_percent,
                imageData: base64Image,
                contractAddress: mintResult?.transaction_details?.contractAddress || contractAddress || "N/A",
                tokenId: mintResult?.transaction_details?.tokenID || tokenId || "PENDING",
                status: "VERIFIED"
            });
            await newAudit.save();
        } 

        res.json({
          success: true,
          ai_data: result,
          blockchain_data: mintResult || updateResult,
          action_taken: actionTaken,
          is_simulation: isSim
        });

      } catch (e) {
        console.error("Pipeline Error:", e);
        res.status(500).json({ error: "Analysis Failed" });
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { analyzeForest };