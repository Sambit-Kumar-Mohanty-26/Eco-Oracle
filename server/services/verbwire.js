const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

const mintNFT = async (imagePath, score, lat, lng) => {
  try {
    console.log("🔗 Connecting to Verbwire...");

    const formData = new FormData();

    formData.append('filePath', fs.createReadStream(imagePath));
    const nftName = `Eco-Oracle Credit #${Date.now().toString().slice(-4)}`;
    const description = `✅ VERIFIED CARBON CREDIT
    
    This NFT certifies that the forest at the coordinates below has been audited by Eco-Oracle AI.
    
    🌍 LOCATION:
    Lat: ${lat}
    Lng: ${lng}
    
    📊 AUDIT DATA:
    Biomass Score: ${score}%
    Status: VERIFIED
    Date: ${new Date().toISOString().split('T')[0]}`;

    formData.append('name', nftName);
    formData.append('description', description);
    formData.append('chain', 'sepolia'); 
    const options = {
      method: 'POST',
      url: 'https://api.verbwire.com/v1/nft/mint/quickMintFromFile',
      headers: {
        'X-API-Key': process.env.VERBWIRE_API_KEY,
        ...formData.getHeaders()
      },
      data: formData
    };

    const response = await axios.request(options);
    if (response.data && response.data.transaction_details) {
        console.log("✅ Minting Successful!");
        console.log("Hash:", response.data.transaction_details.transactionHash);
        return response.data;
    } else {
        console.error("⚠️ Verbwire Warning:", response.data);
        return response.data;
    }

  } catch (error) {
    const msg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error("❌ Verbwire Error:", msg);
    return null;
  }
};

module.exports = { mintNFT };