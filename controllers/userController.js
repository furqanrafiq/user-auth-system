const User = require("../models/User");

const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.status(200).json({ user: { id: user.uuid, name: user.name, email: user.email } });

    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = { getUserDetails };