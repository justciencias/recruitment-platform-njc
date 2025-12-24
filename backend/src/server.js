require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const fileUpload = require('express-fileupload');
const app = express();

// Middlewares
app.use(cors()); // Allows your Frontend to talk to the Backend
app.use(express.json()); // Allows the API to read JSON data in requests
app.use(fileUpload());

// Routes
// This connects all the logic we wrote for candidates, emails, and evaluations
app.use('/api', apiRoutes);

// Basic Health Check
app.get('/', (req, res) => {
    res.send('NJC Recruitment API is running...');
});

// Port Configuration
// Docker is expecting port 5000 based on your Dockerfile/Compose
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
    🚀 Server is live!
    Listening on port: ${PORT}
    URL: http://localhost:${PORT}/api
    `);
});