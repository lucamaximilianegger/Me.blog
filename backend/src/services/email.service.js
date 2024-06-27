const nodemailer = require('nodemailer');

// Create a transporter for sending emails
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.MAIL_HOST, // Mail server host
        port: process.env.MAIL_PORT, // Typically 465 for TLS
        secure: true, // Use TLS
        auth: {
            user: process.env.MAIL_USER, // Mail server username
            pass: process.env.MAIL_PASS, // Mail server password
        },
        tls: {
            // Ensure TLSv1.2 or higher is used
            minVersion: 'TLSv1.2',
        },
    });
};

// Function to send verification email
const sendVerificationEmail = async (user, token, req) => {
    const transporter = createTransporter();

    const mailOptions = {
        to: user.email, // Recipient's email address
        from: process.env.MAIL_FROM, // Sender's email address
        subject: 'Account Verification', // Email subject
        html: `
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <p>Hello ${user.username},</p>
                <p>Thank you for registering on our platform. Please verify your account by clicking the link below:</p>
                <p>
                    <a href="http://${req.headers.host}/api/auth/email-confirmation/${token}" style="color: #1a73e8;">
                        Verify Your Account
                    </a>
                </p>
                <p>This link will expire in one hour.</p>
                <p>If you did not register for this account, please ignore this email.</p>
                <p>Thank you,<br>Your Company Team</p>
            </body>
            </html>
        `, // Email body in HTML format
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// Function to send account deletion confirmation email
const sendDeletionConfirmationEmail = async (user, token, req) => {
    const transporter = createTransporter();

    const mailOptions = {
        to: user.email, // Recipient's email address
        from: process.env.MAIL_FROM, // Sender's email address
        subject: 'Confirm Account Deletion', // Email subject
        html: `
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <p>Hi ${user.username},</p>
                <p>You have requested to delete your account. Please confirm your request by clicking the link below:</p>
                <p>
                    <a href="http://${req.headers.host}/api/auth/account-deletion/confirm/${token}" style="color: #1a73e8;">
                        Confirm Account Deletion
                    </a>
                </p>
                <p>This link will expire in one hour.</p>
                <p>If you did not request this, please ignore this email.</p>
                <p>Thank you,<br>Your Company Team</p>
            </body>
            </html>
        `, // Email body in HTML format
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Deletion confirmation email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendVerificationEmail,
    sendDeletionConfirmationEmail,
};
