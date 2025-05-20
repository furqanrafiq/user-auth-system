require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");
const mongoose = require('mongoose');

const TOKEN = process.env.EMAIL_TOKEN;


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

// var transport = Nodemailer.createTransport({
//     host: "live.smtp.mailtrap.io",
//     port: 587,
//     auth: {
//         user: "api",
//         pass: TOKEN
//     }
// });

var transport = Nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "4617cc4da543b3",
        pass: TOKEN
    }
});

const sender = {
    address: "hello@example.com",
    name: "Mailtrap Test",
};

module.exports = { transport, sender, connectDB };