const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

const MY_CONTRACT_ADDRESS = "0x801aE7Bd20C9FfE44aca3ed7967A58A37735a4cC"; 

const mintNFT = async (imagePath, score, lat, lng, carbonTonnes) => {
  try {
    console.log("🔗 Minting to Custom Contract:", MY_CONTRACT_ADDRESS);

    const formData = new FormData();
    formData.append('filePath', fs.createReadStream(imagePath));
    formData.append('name', `Eco-Oracle Credit #${Date.now().toString().slice(-4)}`);

    const description = `✅ VERIFIED CARBON CREDIT
    
    🌍 LOCATION: ${lat}, ${lng}
    
    🔬 SCIENTIFIC DATA:
    • Biomass Density: ${score}%
    • Est. Carbon Sequestration: ${carbonTonnes ? carbonTonnes + ' Tonnes' : 'Calculating...'}
    • Audit Date: ${new Date().toISOString().split('T')[0]}
    
    Status: VERIFIED via Satellite AI (Temporal Analysis).`;

    formData.append('description', description);
    formData.append('contractAddress', MY_CONTRACT_ADDRESS);
    formData.append('chain', 'sepolia');

    const options = {
      method: 'POST',
      url: 'https://api.verbwire.com/v1/nft/mint/mintFromFile', 
      headers: {
        'X-API-Key': process.env.VERBWIRE_API_KEY,
        ...formData.getHeaders()
      },
      data: formData
    };

    const response = await axios.request(options); 
    if (response.data && response.data.transaction_details) {
        console.log("✅ Custom Mint Successful!");
        const details = response.data.transaction_details;
        let tokenID = details.tokenID;
        if (tokenID === undefined) tokenID = details.tokenId;
        if (tokenID === undefined) tokenID = details.token_id;
        
        if (tokenID === undefined || tokenID === null) tokenID = "PENDING";

        console.log("   Token ID:", tokenID); 
        
        return {
            transaction_details: {
                transactionHash: details.transactionHash,
                contractAddress: MY_CONTRACT_ADDRESS,
                tokenID: tokenID 
            }
        };
    } else {
        console.warn("⚠️ Minting Warning:", response.data);
        return null;
    }

  } catch (error) {
    console.error("❌ Minting Error:", error.response ? error.response.data : error.message);
    return null;
  }
};

const updateNFTStatus = async (contractAddress, tokenId, riskLevel) => {
  try {
    console.log(`🔄 Force Updating NFT (${tokenId})...`);

    const formData = new FormData();
    formData.append('contractAddress', contractAddress);
    formData.append('tokenId', tokenId.toString());
    formData.append('chain', 'sepolia');

    const imageUrl = riskLevel === "CRITICAL"
      ? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/flame-orb.png" 
      : "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leaf-stone.png"; 

    formData.append('imageUrl', imageUrl);
    formData.append('description', `STATUS UPDATE: ${riskLevel} RISK DETECTED.`);

    const options = {
      method: 'POST',
      url: 'https://api.verbwire.com/v1/nft/update/metadata',
      headers: {
        'X-API-Key': process.env.VERBWIRE_API_KEY,
        ...formData.getHeaders()
      },
      data: formData
    };

    const response = await axios.request(options);
    console.log("✅ NFT Updated Successfully!");
    return response.data;

  } catch (error) {
    console.error("❌ NFT Update Failed:", error.response ? error.response.data : error.message);
    console.log("⚠️ Switching to Fallback: Minting Emergency Alert Token...");
    return null; 
  }
};

module.exports = { mintNFT, updateNFTStatus };