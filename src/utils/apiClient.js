const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:5003/api/v1', // Flask API의 기본 URL
  timeout: 5000,
});

module.exports = apiClient;
