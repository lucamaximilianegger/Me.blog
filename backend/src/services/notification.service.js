// services/notification.service.js

const nodemailer = require('nodemailer');
const User = require('../models/user.model');

// Konfigurieren Sie hier Ihren E-Mail-Transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const sendSMS = async (to, message) => {
    // Implementieren Sie hier Ihre SMS-Versandlogik
    // Dies könnte die Verwendung eines Drittanbieters wie Twilio erfordern
    console.log(`SMS would be sent to ${to} with message: ${message}`);
};

exports.sendNotification = async (userId, subject, message) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.notificationSettings.email) {
            await sendEmail(user.email, subject, message);
        }

        if (user.notificationSettings.sms) {
            await sendSMS(user.phone, message);
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};