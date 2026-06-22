const nodemailer = require('nodemailer');

// Set up transporter based on env variables
let transporter;

const setupTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log('Nodemailer SMTP configured.');
  } else {
    // Fallback: log to console
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('=== [SIMULATED EMAIL SENT] ===');
        console.log(`From:    ${mailOptions.from}`);
        console.log(`To:      ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log('--- Body ---');
        console.log(mailOptions.text || mailOptions.html);
        console.log('==============================');
        return { messageId: 'simulated-id-' + Date.now() };
      }
    };
    console.log('Nodemailer using console logging simulation fallback.');
  }
};

const sendEmail = async (options) => {
  if (!transporter) {
    setupTransporter();
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Who\'s In?" <noreply@whosin.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${options.to}:`, error);
    // Suppress error so that request doesn't crash the server
    return null;
  }
};

module.exports = { sendEmail };
