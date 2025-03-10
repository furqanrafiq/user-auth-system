const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password'); // Exclude password
        if (!req.user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Invalid token' });
    }
};

module.exports = authMiddleware;
