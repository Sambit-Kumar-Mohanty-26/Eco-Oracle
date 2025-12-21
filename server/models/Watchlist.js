const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  lastStatus: { type: String, default: "NORMAL" }, 
  lastChecked: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Watchlist', WatchlistSchema);