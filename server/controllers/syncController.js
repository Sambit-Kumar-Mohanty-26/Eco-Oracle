const axios = require('axios');
const Audit = require('../models/Audit');
require('dotenv').config();

const RPC_URL = "https://ethereum-sepolia.publicnode.com"; 

const syncTokenId = async (req, res) => {
  const { transactionHash } = req.body;

  if (!transactionHash) {
    return res.status(400).json({ error: "Transaction Hash required" });
  }

  try {
    console.log(`🔄 Checking Blockchain for TX: ${transactionHash}...`);

    const rpcResponse = await axios.post(RPC_URL, {
      jsonrpc: "2.0",
      method: "eth_getTransactionReceipt",
      params: [transactionHash],
      id: 1
    }, { timeout: 5000 });

    const receipt = rpcResponse.data.result;

    if (!receipt) {
      return res.status(202).json({ message: "Transaction still pending. Try again later." });
    }

    const transferLog = receipt.logs.find(log => 
      log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
    );

    if (transferLog && transferLog.topics[3]) {
      const hexId = transferLog.topics[3];
      const tokenId = parseInt(hexId, 16).toString();
      
      console.log(`✅ Found Token ID: ${tokenId}`);
      await Audit.updateMany(
        { "contractAddress": { $exists: true }, "tokenId": "PENDING" }, 
        { $set: { tokenId: tokenId } }
      );
      
      return res.json({ 
        success: true, 
        tokenId: tokenId, 
        status: "UPDATED" 
      });
    } else {
        return res.status(404).json({ error: "Token ID not found in logs." });
    }

  } catch (error) {
    console.error("Sync Error:", error.message);
    res.status(500).json({ error: "RPC Connection Failed" });
  }
};

module.exports = { syncTokenId };