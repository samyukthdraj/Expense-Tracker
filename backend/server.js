// server.js
const express = require('express');
const dotenv = require('dotenv');
const path = require('path'); // Added path
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));  // Modified

// Handles all routes with frontend routing
app.get('*', (req, res) => { // Added
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

const PORT = process.env.PORT || 5000;  // Changed

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});