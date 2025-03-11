require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true })); 

connectDB()

// Routes
app.use('/api/auth', require('./routes/authRoutes')); 
app.use('/api/user', require('./routes/userRoutes')); 
app.use('/api/services', require('./routes/serviceRoutes')); 

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
