const User = require("../models/User");
const Booking = require("../models/Booking");
const UserService = require("../models/UserService");

const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.status(200).json({ user });

    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
};

const insertUser = async (req, res) => {
    const { name, email, phoneNumber } = req.body;
    try {
        const defaultPassword = "Aptech!23"
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        let newUser = new User({ name, email, password: hashedPassword, phoneNumber });
        await newUser.save();

        // Generate a token valid for 1 hour
        const activationToken = jwt.sign(
            { id: user.uuid },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const link = process.env.FRONTEND_LINK + `/activate-account/${activationToken}/${user.email}`
        const htmlContent = welcomeEmail.replace('{{name}}', name).replace('{{link}}', link);

        const mailOptions = {
            from: sender,
            to: email,
            subject: "Welcome to EasyShadi",
            html: htmlContent,
        };

        transport.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Email error:", err);
                return res.status(500).json({ message: "User created but email failed to send" });
            }

            // success response after email is sent
            res.status(201).json({ msg: 'User registered and welcome email sent' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateUser = async (req, res) => {
    const { name, email, phoneNumber, uuid } = req.body;
    try {
        const updatedUser = await User.updateOne(
            { uuid },
            { $set: { name, email, phoneNumber } }
        );
        res.status(201).json({ msg: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const activateDeactivateUser = async (req, res) => {
    const { isActive, uuid } = req.body;
    try {
        const updatedGuest = await User.updateOne(
            { uuid },
            { $set: { isActive } }
        );
        res.status(201).json({ msg: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Exclude password
        res.status(200).json(users);

    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    const { userId } = req.query;
    try {
        const user = await User.deleteOne({ uuid: userId });
        res.status(201).json({ msg: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const enableDisableTwoFactor = async (req, res) => {
    const { twoFactorEnabled, uuid } = req.body;
    try {
        const updatedUser = await User.updateOne(
            { uuid },
            { $set: { twoFactorEnabled } }
        );
        const user = await User.findOne({ uuid }).select('-password').lean() // Exclude password
        res.status(201).json({ msg: 'Setting updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const adminAnalytics = async (req, res) => {
    try {
        const [totalUsers, totalActiveUsers, totalVendors, totalBookings, totalServices] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            User.countDocuments({ isVendor: true }),
            Booking.countDocuments(),
            UserService.countDocuments()
        ]);

        res.status(200).json({
            totalUsers,
            totalActiveUsers,
            totalVendors,
            totalBookings,
            totalServices
        });

    } catch (err) {
        res.status(500).json({ message: 'Error fetching analytics' });
    }
}

module.exports = { getUserDetails, insertUser, updateUser, deleteUser, getAllUsers, activateDeactivateUser, enableDisableTwoFactor, adminAnalytics };