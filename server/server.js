// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// Task: Create a 'GET /test' route to confirm it's running.
app.get('/test', (req, res) => {
    res.json({ 
        status: 'Online', 
        message: 'Eco-Oracle Backend is operational.', 
        timestamp: new Date().toISOString() 
    });
});

// Start the Server
app.listen(PORT, () => {
    console.log(`> Eco-Oracle Engine Room running on http://localhost:${PORT}`);
});