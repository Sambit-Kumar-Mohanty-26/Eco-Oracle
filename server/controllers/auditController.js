const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { fetchFullEvidence } = require('../services/sentinel'); 
const { mintNFT, updateNFTStatus } = require('../services/verbwire');
const Audit = require('../models/Audit');
const { fetchEsriImage } = require('../services/esri'); 

const analyzeForest = async (req, res) => {
  const { lat, lng, userId, mode, tokenId, contractAddress, bbox } = req.body; 

  if (!lat || !lng || !userId) {
    return res.status(400).json({ error: "Missing data (lat, lng, or userId)" });
  }

  try {
    const isSim = mode === 'SIMULATION';
    console.log(`📡 Initializing Hybrid Audit for User: ${userId} at [${lat}, ${lng}]...`);
    const sentinelImages = await fetchFullEvidence(lat, lng, bbox);
    const esriImage = await fetchEsriImage(lat, lng);
    const pythonScript = path.join(__dirname, '../scripts/analyze_advanced.py'); 
    let pythonCommand = process.env.NODE_ENV === 'production' 
        ? 'python3' 
        : path.join(__dirname, '../scripts/venv/Scripts/python.exe');

    const visionSource = esriImage || sentinelImages.current;
    const pythonProcess = spawn(pythonCommand, [
        pythonScript, 
        sentinelImages.current, 
        sentinelImages.historical, 
        visionSource 
    ]);
    
    let dataString = '';
    
    pythonProcess.stdout.on('data', (data) => dataString += data.toString());
    pythonProcess.stderr.on('data', (data) => console.error(`Python Debug: ${data}`));

    pythonProcess.on('close', async (code) => {
      try {
        let result;
        try {
            result = JSON.parse(dataString);
        } catch (parseError) {
            console.error("Python Output Malformed:", dataString);
            throw new Error("AI Engine returned invalid JSON");
        }

        console.log("📊 AI Analysis Complete. Risk:", result.encroachment_risk, "%");

        if (result.error) {
            throw new Error(result.error);
        }
        
        let mintResult = null;
        let updateResult = null;
        let actionTaken = "NONE";
        let uniqueImageName = `audit_${Date.now()}.png`;

        if (result.status.includes("VERIFIED") && !isSim) {

            if (tokenId && contractAddress) {
                console.log(`🔄 Re-Audit detected. Updating Token #${tokenId}...`);
                updateResult = await updateNFTStatus(contractAddress, tokenId, "NORMAL", result.carbon_tonnes);

                if (updateResult) {
                    console.log("✅ Asset Level-Up Successful.");
                    actionTaken = "UPDATED";
                } else {
                    console.log("⚠️ Update Failed. Switching to Fallback Mint...");
                    mintResult = await mintNFT(sentinelImages.current, result.biomass_score, lat, lng, result.carbon_tonnes);
                    actionTaken = "MINTED_FALLBACK";
                }
            } else {
                console.log("🌲 New Forest. Minting Carbon Credit...");
                mintResult = await mintNFT(sentinelImages.current, result.biomass_score, lat, lng, result.carbon_tonnes);
                actionTaken = "MINTED_NEW";
            }
            const featuresString = (result.detected_features && result.detected_features.length > 0) 
                ? result.detected_features.join(", ") 
                : "None";

            const imageBuffer = fs.readFileSync(sentinelImages.current);
            const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
            
            const uniquePath = path.join(__dirname, '../temp', uniqueImageName);
            fs.copyFileSync(sentinelImages.current, uniquePath);

            const newAudit = new Audit({
                userId: userId,
                lat: lat,
                lng: lng,
                biomassScore: result.biomass_score,
                carbonTonnes: result.carbon_tonnes,
                deforestationRisk: result.deforestation_percent,
                
                encroachmentRisk: result.encroachment_risk,
                detectedFeatures: featuresString,
                
                composition: result.composition,
                imageData: base64Image,
                imageName: uniqueImageName,
                
                contractAddress: mintResult?.transaction_details?.contractAddress || contractAddress || "N/A",
                tokenId: mintResult?.transaction_details?.tokenID || tokenId || "PENDING",
                status: result.status 
            });
            await newAudit.save();
            console.log("💾 Scientific Record Saved to Asset Vault.");
        } 
        res.json({
          success: true,
          ai_data: {
              ...result,
              detectedFeatures: (result.detected_features || []).join(", ") 
          },
          blockchain_data: mintResult || updateResult,
          action_taken: actionTaken,
          is_simulation: isSim
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