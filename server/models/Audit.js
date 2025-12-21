const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  lat: Number,
  lng: Number,
  biomassScore: Number,
  carbonTonnes: Number,
  deforestationRisk: Number,
  imageName: String,
  contractAddress: String,
  tokenId: String,
  status: { type: String, default: "VERIFIED" },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Audit', AuditSchema);