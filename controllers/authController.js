require('dotenv').config();
const { supabase, sender, transport } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { transporter } = require('../config/db');
const User = require('../models/User');
const welcomeEmail = require('../templates/welcomeEmail/welcomeEmail');
const OTP = require('../models/OTP');
const otpEmail = require('../templates/loginVerification/otpEmail');
const forgetPasswordEmail = require('../templates/forgetPassword/forgetPasswordEmail');

const register = async (req, res) => {
    const { name, email, password, phoneNumber, isVendor } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword, phoneNumber, isVendor });
        await user.save();

        // Generate a token valid for 1 hour
        const activationToken = jwt.sign(
            { id: user._id },
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
        console.error("Register error:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        if (!user?.isActive) return res.status(400).json({ msg: 'Your email is deactivated. Please contact admin for support.' });

        if (user?.twoFactorEnabled) {
            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000);
            user.otp = otp;
            user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
            await user.save();

            const htmlContent = otpEmail.replace('{{name}}', user.name).replace('{{otp}}', otp);

            const mailOptions = {
                from: sender,
                to: email,
                subject: "OTP for EashShadi Login",
                html: htmlContent,
            };

            transport.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error("Email error:", err);
                    return res.status(500).json({ message: "User created but email failed to send" });
                }

                // success response after email is sent
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                // res.json({ msg: 'Login Successful', user: { token, user } });
                res.status(201).json({ msg: 'OTP Sent on email' });
            });
        } else {

            // Generate login token
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '1d',
            });

            // res.status(200).json({ msg: 'Login successful', token });
            res.json({ msg: 'Login Successful', user: { token, user } });
        }



    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const activateAccount = async (req, res) => {
    const { token } = req.query
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(400).json({ msg: 'User not found' });
        if (user.isActive) return res.status(400).json({ msg: 'Account already activated' });

        user.isActive = true;
        await user.save();

        res.status(200).json({ msg: 'Account activated successfully' });
    } catch (err) {
        res.status(400).json({ msg: 'Invalid or expired token' });
    }
};

const resendActivationEmail = async (req, res) => {
    const { email } = req.query;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (user.isActive) return res.status(400).json({ msg: 'Account already activated' });

        const activationToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );


        const link = process.env.FRONTEND_LINK + `/activate-account/${activationToken}/${user.email}`
        const htmlContent = welcomeEmail.replace('{{name}}', user.name).replace('{{link}}', link);

        await transport.sendMail({
            from: sender,
            to: email,
            subject: 'Resend Activation - EasyShadi',
            html: htmlContent,
        });

        res.status(200).json({ msg: 'New activation link sent to your email.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.query;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User not found' });

        if (user.otp !== otp) return res.status(400).json({ msg: 'Invalid OTP' });
        if (Date.now() > user.otpExpiry) return res.status(400).json({ msg: 'OTP expired' });

        // Clear OTP fields
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        // Generate login token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        // res.status(200).json({ msg: 'Login successful', token });
        res.json({ msg: 'Login Successful', user: { token, user } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

const resendOtp = async (req, res) => {
    const { email } = req.query;

    try {
        let user = await User.findOne({ email });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        user.otp = otp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
        await user.save();

        const htmlContent = otpEmail.replace('{{name}}', user.name).replace('{{otp}}', otp);

        const mailOptions = {
            from: sender,
            to: email,
            subject: "OTP for EashShadi Login",
            html: htmlContent,
        };

        transport.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Email error:", err);
                return res.status(500).json({ message: "User created but email failed to send" });
            }

            // success response after email is sent
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            // res.json({ msg: 'Login Successful', user: { token, user } });
            res.status(201).json({ msg: 'OTP Sent on email' });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

const sendEmail = async (req, res) => {
    // const { email, password } = req.body;
    const htmlContent = welcomeEmail.replace('{{name}}', 'Furqan').replace('{{link}}', process.env.FRONTEND_LINK);
    try {
        const mailOptions = {
            from: sender,
            to: 'furqan.fiqi@gmail.com',
            subject: "Welcome to EasyShadi",
            html: htmlContent,
        };

        transport.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Email error:", err);
                return res.status(500).json({ message: err });
            }

            // success response after email is sent
            res.status(201).json({ msg: 'User registered and welcome email sent' });

        })
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const forgetPassword = async (req, res) => {
    const { email } = req.body;

    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User does not exist' });

    // Generate a token valid for 1 hour
    const activationToken = jwt.sign(
        { id: user.uuid },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    const link = process.env.FRONTEND_LINK + `/reset-password/${activationToken}/${email}`
    const htmlContent = forgetPasswordEmail.replace('{{name}}', user.name).replace('{{link}}', link);

    const mailOptions = {
        from: sender,
        to: email,
        subject: "Forget Password",
        html: htmlContent,
    };

    transport.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("Email error:", err);
            return res.status(500).json({ message: "User created but email failed to send" });
        }

        // success response after email is sent
        res.status(201).json({ msg: 'Email sent' });
    });

}

const verifyToken = async (req, res) => {
    const { token, email } = req.query;
    const user = await User.findOne({ email });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        res.status(200).json({ msg: 'Token verified' });
    } catch (err) {
        if (!user) return res.status(400).json({ msg: 'User not found' });

        // Generate a token valid for 1 hour
        const activationToken = jwt.sign(
            { id: user.uuid },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const link = process.env.FRONTEND_LINK + `/reset-password/${activationToken}/${email}`
        const htmlContent = forgetPasswordEmail.replace('{{name}}', user.name).replace('{{link}}', link);

        const mailOptions = {
            from: sender,
            to: email,
            subject: "Forget Password",
            html: htmlContent,
        };

        transport.sendMail(mailOptions, (err, info) => {
            if (err) {
                return res.status(500).json({ message: "Email failed to send" });
            }

            // success response after email is sent
            res.status(400).json({ msg: 'Invalid or expired token. New email sent.' });
        });
    }
};

const resetPassword = async (req, res) => {
    const { email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await User.updateOne(
        { email },
        { $set: { password: hashedPassword } }
    );

    res.status(201).json({ msg: 'Password updated successfully' });
}



module.exports = { register, login, sendEmail, activateAccount, resendActivationEmail, verifyOtp, resendOtp, forgetPassword, resetPassword, verifyToken };
