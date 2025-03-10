
const getUserDetails = async (req, res) => {
    try {
        res.json(req.user); // `req.user` is set by the middleware
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = { getUserDetails }