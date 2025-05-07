require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const path = require('path');

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' })); // Allow large base64 uploads
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/ServiceImages', express.static(path.join(__dirname, 'ServiceImages')));

connectDB()

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/guests', require('./routes/guestListRoutes'));
app.use('/api/checklist', require('./routes/checklistRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
