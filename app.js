const express = require('express');
const cors    = require('cors');
const path    = require('path');
const app     = express();

// Enable CORS for all origins (required by spec)
app.use(cors());

// Parse incoming JSON bodies
app.use(express.json());

// Mount all routes under /api prefix
app.use('/api/users',    require('./src/router/user.router'));
app.use('/api/products', require('./src/router/product.router'));
app.use('/api/orders',   require('./src/router/order.router'));

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend')));

// Serve index.html for all non-API routes (SPA fallback)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

module.exports = app;
