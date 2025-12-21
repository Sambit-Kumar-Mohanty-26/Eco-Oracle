const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, 
  phoneNumber: { type: String, default: "" },             
  apiKey: { type: String, default: "" },                  
  notificationsEnabled: { type: Boolean, default: true }
});

module.exports = mongoose.model('Settings', SettingsSchema);