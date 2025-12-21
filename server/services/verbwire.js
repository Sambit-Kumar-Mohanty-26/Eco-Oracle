const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

const MY_CONTRACT_ADDRESS = "0x801aE7Bd20C9FfE44aca3ed7967A58A37735a4cC"; 
const getTierInfo = (carbonTonnes, riskLevel) => {
    if (riskLevel === "CRITICAL") {
        return {
            name: "CRITICAL RISK",
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/flame-orb.png" // 🔥 Red
        };
    }
    if (carbonTonnes > 5000) {
        return {
            name: "APEX (Gold)",
            image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png" // 🏆 Gold
        };
    }
    return {
        name: "GROWTH (Silver)",
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png" // 🥈 Silver
    };
};

const mintNFT = async (imagePath, score, lat, lng, carbonTonnes) => {
  try {
    console.log("🔗 Minting to Custom Contract:", MY_CONTRACT_ADDRESS);
    const tier = getTierInfo(carbonTonnes, "NORMAL"); 

    const formData = new FormData();
    formData.append('filePath', fs.createReadStream(imagePath));
    formData.append('name', `Eco-Credit [${tier.name}]`); 
    const description = `✅ VERIFIED CARBON CREDIT
    
    🌍 LOCATION: ${lat}, ${lng}
    
    🔬 DATA:
    • Biomass: ${score}%
    • Carbon: ${carbonTonnes} Tonnes
    • Tier: ${tier.name}
    
    Status: VERIFIED via Satellite AI.`;

    formData.append('description', description);
    formData.append('contractAddress', MY_CONTRACT_ADDRESS);
    formData.append('chain', 'sepolia');

    const options = {
      method: 'POST',
      url: 'https://api.verbwire.com/v1/nft/mint/mintFromFile', 
      headers: { 'X-API-Key': process.env.VERBWIRE_API_KEY, ...formData.getHeaders() },
      data: formData
    };

    const response = await axios.request(options);
    
    if (response.data && response.data.transaction_details) {
        console.log("✅ Mint Successful! Tier:", tier.name);

        const details = response.data.transaction_details;
        let tokenID = details.tokenID || details.tokenId || details.token_id || "PENDING";
        
        console.log("   Token ID:", tokenID); 
        
        return {
            transaction_details: {
                transactionHash: details.transactionHash,
                contractAddress: MY_CONTRACT_ADDRESS,
                tokenID: tokenID 
            }
        };
    } else {
        return null;
    }
  } catch (error) {
    console.error("❌ Minting Error:", error.response ? error.response.data : error.message);
    return null;
  }
};

const updateNFTStatus = async (contractAddress, tokenId, riskLevel, carbonTonnes = 0) => {
  try {
    console.log(`🔄 Updating NFT (${tokenId}). Risk: ${riskLevel}`);

    const tier = getTierInfo(carbonTonnes, riskLevel); 

    const formData = new FormData();
    formData.append('contractAddress', contractAddress);
    formData.append('tokenId', tokenId.toString());
    formData.append('chain', 'sepolia');
    formData.append('imageUrl', tier.image); 
    formData.append('description', `STATUS UPDATE: ${tier.name}\nCarbon: ${carbonTonnes} Tonnes`);

    const attributes = [
        { trait_type: "Status", value: riskLevel },
        { trait_type: "Carbon Tier", value: tier.name },
        { trait_type: "Last Updated", value: new Date().toISOString() }
    ];
    formData.append('attributes', JSON.stringify(attributes));

    const options = {
      method: 'POST',
      url: 'https://api.verbwire.com/v1/nft/update/metadata',
      headers: { 'X-API-Key': process.env.VERBWIRE_API_KEY, ...formData.getHeaders() },
      data: formData
    };

    const response = await axios.request(options);
    console.log("✅ NFT Metadata Updated!");
    return response.data;

  } catch (error) {
    console.error("❌ NFT Update Failed:", error.message);
    return null; 
  }
};

module.exports = { mintNFT, updateNFTStatus };