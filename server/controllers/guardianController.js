const { fetchSatelliteImage } = require('../services/sentinel');
const { getWeatherData } = require('../services/weather');
const { spawn } = require('child_process');
const path = require('path');
const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const predictDisaster = async (req, res) => {
  const { lat, lng } = req.body;

  try {
    console.log("🌪️ 1. Fetching Live Weather...");
    const weather = await getWeatherData(lat, lng);
    console.log(`   - Wind: ${weather.wind_speed} m/s, Temp: ${weather.temp}°C`);
    console.log("🛰️ 2. Fetching Satellite Moisture Map (NDMI)...");
    const imagePath = await fetchSatelliteImage(lat, lng, 'NDMI');
    console.log("🧠 3. Analyzing Fuel Dryness...");
    const pythonScript = path.join(__dirname, '../scripts/moisture.py');

    let pythonCommand;
    if (process.env.NODE_ENV === 'production') {
        pythonCommand = 'python3'; 
    } else {
        pythonCommand = path.join(__dirname, '../scripts/venv/Scripts/python.exe');
    }

    const pythonProcess = spawn(pythonCommand, [pythonScript, imagePath]);

    let dataString = '';
    pythonProcess.stdout.on('data', (data) => dataString += data.toString());
    pythonProcess.stderr.on('data', (data) => console.error(`Python Err: ${data}`));

    pythonProcess.on('close', async (code) => {
      try {
        if (!dataString) throw new Error("Python returned no data");
        const moistureData = JSON.parse(dataString);
        console.log(`   - Dryness Score: ${moistureData.dryness_score}%`);

        let riskScore = 0;
        let alertSent = false;

        if (moistureData.dryness_score > 30) riskScore += 40; 
        if (weather.wind_speed > 5) riskScore += 30;         
        if (weather.temp > 28) riskScore += 30;              

        const riskLevel = riskScore > 60 ? "CRITICAL" : "NORMAL";

        if (riskLevel === "CRITICAL") {
            console.log("🚨 CRITICAL RISK! SENDING SMS...");
            try {
                await client.messages.create({
                    body: `🔥 ECO-ORACLE ALERT: Critical Fire Risk at ${weather.location}. Wind: ${weather.wind_speed}m/s, Dryness: ${moistureData.dryness_score}%. EVACUATE.`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: process.env.MY_PHONE_NUMBER
                });
                console.log("✅ SMS Sent Successfully");
                alertSent = true;
            } catch (e) { console.error("Twilio Error:", e.message); }
        }

        res.json({
            success: true,
            risk_data: {
                score: riskScore,
                level: riskLevel,
                weather: weather,
                dryness: moistureData.dryness_score
            },
            alert_sent: alertSent
        });

      } catch (e) {
        console.error("Analysis Error:", e);
        res.status(500).json({ error: "Analysis Failed", details: e.message });
      }
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { predictDisaster };