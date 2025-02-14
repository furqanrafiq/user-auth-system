require('dotenv').config();
const { supabase, sender } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { transporter } = require('../config/db')


const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user exists
        const { data: existingUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (existingUser) return res.status(400).json({ msg: 'User already exists' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into Supabase
        const { data, error: insertError } = await supabase
            .from('users')
            .insert([{ name, email, password: hashedPassword }]);

        if (insertError) throw insertError;

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Fetch user from Supabase
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (!user) return res.status(400).json({ msg: 'User does not exist' });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        // Generate JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ msg: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const forgetPassword = async (req, res) => {
    const { email } = req.body;

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (!user) return res.status(400).json({ msg: 'User does not exist' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 60 * 1000); // 60 sec expiry

    // Store OTP in Supabase
    // const { data, otpError } = await supabase
    //     .from("otp_codes")
    //     .select("*")
    //     .eq("email", email)
    //     .eq("otp", otp)
    //     .single();
    // if (!otpError || !data) {
    const { supaBaseerror } = await supabase.from("otp_codes").upsert([{ email, otp, expires_at: expiresAt }]);
    if (supaBaseerror) return res.status(500).json({ message: "Error storing OTP" });
    // } else {

    // }


    // Send OTP via email
    const mailOptions = {
        from: sender,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}. It will expire in 60 seconds.`,
    };

    transporter.sendMail(mailOptions, (err) => {
        // if (err) {
        //     console.error("Error sending email:", err);
        // } else {
        //     console.log("Email sent successfully:", info);
        // }
        if (err) return res.status(500).json({ message: "Error sending email" });
        res.json({ otp: otp, message: "OTP sent successfully" });
    });

}


const resetPassword = async (req, res) => {
    const { email, password, otp } = req.body;

    const { data, error } = await supabase
        .from("otp_codes")
        .select("*")
        .eq("email", email)
        .eq("otp", otp)
        .single();

    if (error || !data) return res.status(400).json({ message: "Invalid OTP" });

    // Check expiration
    if (new Date() > new Date(data.expires_at)) {
        return res.status(400).json({ message: "OTP expired" });
    }

    if (!email || !password) return res.status(400).json({ message: "Email and new password required" });

    const { passwordError } = await supabase.auth.admin.updateUserByEmail(email, { password });

    if (passwordError) return res.status(500).json({ message: "Error resetting password" });

    res.json({ message: "Password updated successfully" });
}



module.exports = { register, login, forgetPassword, resetPassword };
