const axios = require('axios');
require('dotenv').config();

async function getWeatherData(lat, lng) {
  try {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY; 
    
    if (!apiKey) throw new Error('OPENWEATHERMAP_API_KEY missing in .env');

    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: lat,
        lon: lng,
        appid: apiKey,
        units: 'metric'
      }
    });

    return {
      location: response.data.name,
      temp: response.data.main.temp,
      humidity: response.data.main.humidity,
      wind_speed: response.data.wind.speed,
      description: response.data.weather[0].description
    };

  } catch (error) {
    console.error('❌ Weather API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch weather data');
  }
}

module.exports = { getWeatherData };