const axios = require('axios');
require('dotenv').config();

const CONTRACT_ADDRESS = "0x0D29A715d3a1E0763EB039D84ec8782b75C63F3e";
const TOKEN_ID = "3";

async function checkToken() {
  try {
    console.log(`🔍 Checking Status for Token #${TOKEN_ID}...`);
    const response = await axios.get(
      `https://api.verbwire.com/v1/nft/data/nftDetails`, 
      {
        params: {
          contractAddress: CONTRACT_ADDRESS,
          tokenId: TOKEN_ID,
          chain: 'sepolia'
        },
        headers: { 'X-API-Key': process.env.VERBWIRE_API_KEY }
      }
    );

    console.log("✅ Verbwire SEES the token:");
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log("❌ Verbwire CANNOT see the token yet.");
    console.log("Reason:", error.response ? error.response.data : error.message);
  }
}

checkToken();