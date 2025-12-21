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
    console.error("❌ Sentinel Auth Error:", error.message);
    throw new Error('Sentinel Auth Failed');
  }
}

function getDateRange(isHistorical = false) {
    const end = new Date();
    if (isHistorical) end.setFullYear(end.getFullYear() - 1);
    
    const start = new Date(end);
    start.setDate(end.getDate() - 30);
    
    return {
        from: start.toISOString(),
        to: end.toISOString()
    };
}

async function fetchSatelliteImage(lat, lng, layerType = 'NDVI', isHistorical = false) {
  const token = await getSentinelToken();
  const offset = 0.01; 
  const bbox = [lng - offset, lat - offset, lng + offset, lat + offset];
  const timeRange = getDateRange(isHistorical);

  const scriptNDVI = `
    //VERSION=3
    function setup() { return { input: ["B04", "B08"], output: { bands: 3 } }; }
    function evaluatePixel(sample) {
      let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
      return [1 - ndvi, ndvi, 0]; 
    }
  `;

  const scriptNDMI = `
    //VERSION=3
    function setup() { return { input: ["B8A", "B11"], output: { bands: 3 } }; }
    function evaluatePixel(sample) {
      let ndmi = (sample.B8A - sample.B11) / (sample.B8A + sample.B11);
      if (ndmi > 0.2) return [0, 0.5, 1];
      if (ndmi > 0.0) return [0, 1, 1];
      return [1, 0, 0];
    }
  `;

  const scriptTrueColor = `
    //VERSION=3
    function setup() { return { input: ["B04", "B03", "B02"], output: { bands: 3 } }; }
    function evaluatePixel(sample) {
      return [sample.B04 * 2.5, sample.B03 * 2.5, sample.B02 * 2.5]; 
    }
  `;

  let evalscript = scriptNDVI;
  let fileName = 'input.png';

  if (layerType === 'NDMI') {
      evalscript = scriptNDMI;
      fileName = 'moisture.png';
  } else if (layerType === 'TRUE_COLOR') {
      evalscript = scriptTrueColor;
      fileName = isHistorical ? 'rgb_old.png' : 'rgb_new.png';
  } else {
      fileName = isHistorical ? 'history.png' : 'input.png';
  }

  const payload = {
    input: {
      bounds: { bbox: bbox, properties: { crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84" } },
      data: [{ type: "sentinel-2-l2a", dataFilter: { timeRange: timeRange, maxCloudCoverage: 20 } }]
    },
    output: { width: 512, height: 512, responses: [{ identifier: "default", format: { type: "image/png" } }] },
    evalscript: evalscript
  };

  try {
    const response = await axios({
      method: 'post',
      url: 'https://services.sentinel-hub.com/api/v1/process',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'image/png' },
      data: payload,
      responseType: 'arraybuffer' 
    });

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, response.data);
    return filePath;
  } catch (error) {
    throw new Error(`Satellite Fetch Failed: ${error.message}`);
  }
}

async function fetchFullEvidence(lat, lng) {
    console.log("   🛰️ Fetching Scientific Data (NDVI)...");
    const ndviCurrent = await fetchSatelliteImage(lat, lng, 'NDVI', false);
    const ndviHistorical = await fetchSatelliteImage(lat, lng, 'NDVI', true);

    console.log("   📸 Fetching Visual Evidence (True Color)...");
    await Promise.all([
        fetchSatelliteImage(lat, lng, 'TRUE_COLOR', false),
        fetchSatelliteImage(lat, lng, 'TRUE_COLOR', true) 
    ]);

    return { current: ndviCurrent, historical: ndviHistorical };
}

module.exports = { getSentinelToken, fetchSatelliteImage, fetchFullEvidence };