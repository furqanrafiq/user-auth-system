require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer')
const { MailtrapTransport } = require("mailtrap");
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

const transporter = nodemailer.createTransport(
    MailtrapTransport({
        token: process.env.EMAIL_TOKEN,
    })
);

const sender = {
    address: "hello@demomailtrap.com",
    name: "Mailtrap Test",
};

module.exports = { transporter, sender,connectDB };