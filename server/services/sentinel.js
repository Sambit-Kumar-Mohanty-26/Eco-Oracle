const axios = require('axios');
const qs = require('qs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function getSentinelToken() {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        grant_type: 'client_credentials',
        client_id: process.env.SENTINEL_CLIENT_ID,
        client_secret: process.env.SENTINEL_CLIENT_SECRET
      })
    });
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Auth Error:', error.response ? error.response.data : error.message);
    throw new Error('Failed to authenticate with Sentinel Hub');
  }
}

async function fetchSatelliteImage(lat, lng) {
  const token = await getSentinelToken();
  const offset = 0.01; 
  const bbox = [lng - offset, lat - offset, lng + offset, lat + offset];

  const payload = {
    input: {
      bounds: { 
        bbox: bbox,
        properties: { crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84" }
      },
      data: [{ type: "sentinel-2-l2a" }]
    },
    output: { 
      width: 512, 
      height: 512, 
      responses: [{ identifier: "default", format: { type: "image/png" } }] 
    },
    evalscript: `
      //VERSION=3
      function setup() {
        return {
          input: ["B04", "B08"],
          output: { bands: 3 }
        };
      }
      function evaluatePixel(sample) {
        let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
        // Visualizing: Green = High Biomass, Red = No Vegetation
        return [1 - ndvi, ndvi, 0]; 
      }
    `
  };

  try {
    const response = await axios({
      method: 'post',
      url: 'https://services.sentinel-hub.com/api/v1/process',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'image/png'
      },
      data: payload,
      responseType: 'arraybuffer' 
    });

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const filePath = path.join(tempDir, 'input.png');
    fs.writeFileSync(filePath, response.data);
    
    console.log("🛰️ Satellite data captured successfully at:", filePath);
    return filePath;
  } catch (error) {
    const errorMsg = error.response?.data instanceof Buffer 
      ? error.response.data.toString() 
      : JSON.stringify(error.response?.data || error.message);
      
    console.error("❌ Fetch Error Details:", errorMsg);
    throw new Error(errorMsg);
  }
}

if (require.main === module) {
    fetchSatelliteImage(-3.46, -62.21);
}

module.exports = { getSentinelToken, fetchSatelliteImage };