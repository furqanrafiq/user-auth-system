const bcrypt = require('bcryptjs');
const User = require("../models/User");
const welcomeEmail = require('../templates/welcomeEmail/welcomeEmail');
const jwt = require('jsonwebtoken');
const { sender, transport } = require('../config/db');


const insertVendor = async (req, res) => {
    const { name, email, phoneNumber } = req.body;
    try {

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const defaultPassword = "Aptech!23"
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        let newVendor = new User({ name, email, password: hashedPassword, phoneNumber, isVendor: true });
        await newVendor.save();

        // Generate a token valid for 1 hour
        const activationToken = jwt.sign(
            { id: newVendor.uuid },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const link = process.env.FRONTEND_LINK + `/activate-account/${activationToken}/${email}`
        const htmlContent = welcomeEmail.replace('{{name}}', name).replace('{{link}}', link);

        const mailOptions = {
            from: sender,
            to: email,
            subject: "Welcome to EasyShadi",
            html: htmlContent,
        };

        transport.sendMail(mailOptions, (err, info) => {
            if (err) {
                return res.status(500).json({ message: "Vendor created but email failed to send" });
            }

            // success response after email is sent
            res.status(201).json({ msg: 'Vendor registered and welcome email sent' });
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Server error' });
    }
};

const updateVendor = async (req, res) => {
    const { name, email, phoneNumber, uuid } = req.body;
    try {
        const updatedGuest = await User.updateOne(
            { uuid },
            { $set: { name, email, phoneNumber } }
        );
        res.status(201).json({ msg: 'Vendor updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const activateDeactivateVendor = async (req, res) => {
    const { isActive, uuid } = req.body;
    try {
        const updatedGuest = await User.updateOne(
            { uuid },
            { $set: { isActive } }
        );
        res.status(201).json({ msg: 'Vendor updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};


const getAllVendors = async (req, res) => {
    try {
        const vendors = await User.find({ isVendor: true }).select('-password'); // Exclude password
        res.status(200).json(vendors);

    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
};

const deleteVendor = async (req, res) => {
    const { vendorId } = req.query;
    try {
        const vendor = await User.deleteOne({ uuid: vendorId });
        res.status(201).json({ msg: 'Vendor deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};



module.exports = { insertVendor, getAllVendors, updateVendor, deleteVendor, activateDeactivateVendor };