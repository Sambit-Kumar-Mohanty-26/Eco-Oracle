const axios = require('axios');
const qs = require('qs');
require('dotenv').config();

async function getSentinelToken() {
  console.log("📡 Attempting to connect to Sentinel Hub...");
  try {
    const response = await axios({
      method: 'post',
      url: 'https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: qs.stringify({
        grant_type: 'client_credentials',
        client_id: process.env.SENTINEL_CLIENT_ID,
        client_secret: process.env.SENTINEL_CLIENT_SECRET
      })
    });

    const token = response.data.access_token;
    console.log("✅ SUCCESS: Sentinel Hub Authenticated!");
    console.log("🔑 Token (first 20 chars):", token.substring(0, 20) + "...");
    return token;
  } catch (error) {
    console.error('❌ AUTH ERROR:', error.response ? error.response.data : error.message);
    throw new Error('Failed to authenticate with Sentinel Hub');
  }
}

if (require.main === module) {
    getSentinelToken();
}

module.exports = { getSentinelToken };