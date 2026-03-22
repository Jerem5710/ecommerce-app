const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Configure your SMTP transporter (use environment variables for credentials)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Helper to load template and replace placeholders
function loadTemplate(templateName, replacements) {
    const templatePath = path.join(__dirname, '..', 'emails', `${templateName}.html`);
    let content = fs.readFileSync(templatePath, 'utf-8');
    for (const key in replacements) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, replacements[key]);
    }
    return content;
}

async function sendEmail(to, subject, templateName, replacements) {
    const html = loadTemplate(templateName, replacements);
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Store" <no-reply@store.com>',
        to,
        subject,
        html,
    };
    await transporter.sendMail(mailOptions);
}

module.exports = {
    sendEmail,
};