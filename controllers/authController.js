require('dotenv').config();
const { supabase, sender } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { transporter } = require('../config/db');
const User = require('../models/User');
const UserService = require('../models/UserService');


const register = async (req, res) => {
    const { name, email, password, phoneNumber, isVendor, service } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword, phoneNumber, isVendor });
        await user.save();

        let userServices = new UserService({ userId: user.uuid, serviceId: service.uuid, serviceName: service.name })
        await userServices.save()

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (error) {
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

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ msg: 'Login Successful', user: { token, id: user.uuid, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// const forgetPassword = async (req, res) => {
//     const { email } = req.body;

//     const { data: user, error } = await supabase
//         .from('users')
//         .select('*')
//         .eq('email', email)
//         .single();

//     if (!user) return res.status(400).json({ msg: 'User does not exist' });

//     // Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000);
//     const expiresAt = new Date(Date.now() + 60 * 1000); // 60 sec expiry

//     // Store OTP in Supabase
//     // const { data, otpError } = await supabase
//     //     .from("otp_codes")
//     //     .select("*")
//     //     .eq("email", email)
//     //     .eq("otp", otp)
//     //     .single();
//     // if (!otpError || !data) {
//     const { supaBaseerror } = await supabase.from("otp_codes").upsert([{ email, otp, expires_at: expiresAt }]);
//     if (supaBaseerror) return res.status(500).json({ message: "Error storing OTP" });
//     // } else {

//     // }


//     // Send OTP via email
//     const mailOptions = {
//         from: sender,
//         to: email,
//         subject: "Your OTP Code",
//         text: `Your OTP is ${otp}. It will expire in 60 seconds.`,
//     };

//     transporter.sendMail(mailOptions, (err) => {
//         // if (err) {
//         //     console.error("Error sending email:", err);
//         // } else {
//         //     console.log("Email sent successfully:", info);
//         // }
//         if (err) return res.status(500).json({ message: "Error sending email" });
//         res.json({ otp: otp, message: "OTP sent successfully" });
//     });

// }


// const resetPassword = async (req, res) => {
//     const { email, password, otp } = req.body;

//     const { data, error } = await supabase
//         .from("otp_codes")
//         .select("*")
//         .eq("email", email)
//         .eq("otp", otp)
//         .single();

//     if (error || !data) return res.status(400).json({ message: "Invalid OTP" });

//     // Check expiration
//     if (new Date() > new Date(data.expires_at)) {
//         return res.status(400).json({ message: "OTP expired" });
//     }

//     if (!email || !password) return res.status(400).json({ message: "Email and new password required" });

//     const { passwordError } = await supabase.auth.admin.updateUserByEmail(email, { password });

//     if (passwordError) return res.status(500).json({ message: "Error resetting password" });

//     res.json({ message: "Password updated successfully" });
// }



module.exports = { register, login };
