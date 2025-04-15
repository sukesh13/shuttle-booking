const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const routeRoutes = require('./routes/routes');
const walletRoutes = require('./routes/wallet');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Connect to DB
try {
    mongoose.set('strictQuery', false)
    mongoose.connect(process.env.DB_CONNECTION);
    console.log('Successfully connected to MongoDB.');
    
} catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/wallet', walletRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({message: 'Something broke!'});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}: http://localhost:${PORT}`);
});