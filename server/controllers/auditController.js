const { spawn } = require('child_process');
const path = require('path');
const { fetchSatelliteImage } = require('../services/sentinel');

const analyzeForest = async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Missing coordinates (lat, lng)" });
  }

  try {
    // 1. Fetch the Satellite Image
    console.log("1. Fetching Satellite Image...");
    const imagePath = await fetchSatelliteImage(lat, lng);

    // 2. Spawn Python process to analyze it
    console.log("2. Analyzing Biomass with Python...");
    const pythonScript = path.join(__dirname, '../scripts/analyze.py');
    
    // ✅ FIX: Point directly to the python executable inside your venv
    // This ensures Node uses the environment where you installed opencv and numpy
    const pythonCommand = process.platform === "win32" 
      ? path.join(__dirname, '../scripts/venv/Scripts/python.exe') 
      : path.join(__dirname, '../scripts/venv/bin/python');
    
    console.log(`Using Python from: ${pythonCommand}`);

    const pythonProcess = spawn(pythonCommand, [pythonScript, imagePath]);

    let dataString = '';

    // 3. Listen for data from Python
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      try {
        if (!dataString) {
          throw new Error("Python script returned no data.");
        }
        
        // Parse the JSON output from Python
        const result = JSON.parse(dataString);
        console.log("3. Analysis Complete:", result);
        
        // Return the final result to the frontend
        res.json({
          success: true,
          imagePath: imagePath,
          data: result
        });
      } catch (e) {
        console.error("Parse Error:", e);
        res.status(500).json({ 
          error: "Failed to parse Python output", 
          details: e.message,
          raw: dataString 
        });
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { analyzeForest };