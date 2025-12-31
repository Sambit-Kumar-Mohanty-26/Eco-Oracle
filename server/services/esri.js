const axios = require('axios');
const fs = require('fs');
const path = require('path');

function long2tile(lon, zoom) { 
    return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom))); 
}

function lat2tile(lat, zoom) { 
    return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))); 
}

async function fetchEsriImage(lat, lng) {
  try {
    const zoom = 17; 
    const x = long2tile(lng, zoom);
    const y = lat2tile(lat, zoom);

    const url = `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;

    console.log(`   🌍 Sniping Esri Tile: Z${zoom} X${x} Y${y}`);

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const filePath = path.join(tempDir, 'high_res.png');
    fs.writeFileSync(filePath, response.data);
    
    console.log("   📸 High-Res Imagery Captured (No API Key).");
    return filePath;
  } catch (error) {
    console.error("Esri Fetch Error:", error.message);
    return null; 
  }
}

module.exports = { fetchEsriImage };