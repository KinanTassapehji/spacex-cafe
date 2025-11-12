const dotenv = require('dotenv');

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    dotenv.config({ path: '.env.local' }); // Load .env.local for development
    console.log('🔧 Development mode: Loading .env.local');
} else {
    dotenv.config({ path: '.env.prod' }); // Load .env.prod for production
    console.log('🚀 Production mode: Loading .env.prod');
}
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rate limiting middleware
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

const uri = process.env.MONGODB_URI;
console.log('🔗 Connecting to MongoDB URI:', uri);

// Connect to MongoDB (Mongoose handles connection pooling automatically)
mongoose.connect(uri, {
    ssl: true,
    tlsAllowInvalidCertificates: false,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    family: 4
})
    .then(() => console.log('✅ Connected to MongoDB successfully'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Handle connection events
mongoose.connection.on('error', err => {
    console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('❌ MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected');
});

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client-build')));
    app.get('*', (req, res) => {
        //res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
        res.sendFile(path.join(__dirname, 'client-build', 'index.html'));
    });
} else {
    app.get('/', (req, res) => res.send('Sales Management System API - Development Mode'));
}

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
