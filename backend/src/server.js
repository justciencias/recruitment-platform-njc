require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const fileUpload = require('express-fileupload');
const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));// Allows Frontend to talk to the Backend
app.use(express.json()); // Allows the API to read JSON data in requests
app.use(fileUpload());

// Routes
app.use('/api', apiRoutes);

// Basic Health Check
app.get('/', (req, res) => {
    res.send('NJC Recruitment API is running...');
});

/**
Port Configuration
Docker is expecting port 5000 
*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
    🚀 Server is live!
    Listening on port: ${PORT}
    URL: http://localhost:${PORT}/api
    `);
});