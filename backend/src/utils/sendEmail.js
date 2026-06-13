const nodemailer = require('nodemailer');

async function sendVerificationEmail(to, subject, text) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sidhantnirupam@gmail.com',      // ← Put your Gmail here
            pass: 'arul qcsc sgil rvem'         // ← Put 16-digit app password here
        }
    });

    const mailOptions = {
        from: '"Nexkart" <YOUR_GMAIL@gmail.com>',  // ← Same Gmail
        to,
        subject,
        text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent to:', to);
    } catch (error) {
        console.error('Email send failed:', error.message);
        throw new Error('Failed to send email. Please try again.');
    }
}

module.exports = { sendVerificationEmail };