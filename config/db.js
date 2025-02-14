require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer')
const { MailtrapTransport } = require("mailtrap");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

const transporter = nodemailer.createTransport(
    MailtrapTransport({
        token: process.env.EMAIL_TOKEN,
    })
);

const sender = {
    address: "hello@demomailtrap.com",
    name: "Mailtrap Test",
};

// const recipients = [
//     "furqan.fiqi@gmail.com",
// ];

// var transporter = nodemailer.createTransport({
//     host: "live.smtp.mailtrap.io",
//     port: 587,
//     auth: {
//         user: "api",
//         pass: "e6d2303380497c11922f043030159cbf"
//     }
// });

module.exports = { supabase, transporter, sender };
