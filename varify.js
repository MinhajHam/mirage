const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// Your Gmail API credentials should come from the .env file or some secure configuration
// const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;;
// const CLEINT_SECRET = process.env.GOOGLE_CLEINT_SECRET;
// const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
// const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// const oAuth2Client = new google.auth.OAuth2(
//   CLIENT_ID,
//   CLEINT_SECRET,
//   REDIRECT_URI
// );
// oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// async function sendMail(toEmail, subject, text, html) {
//   try {
//     const accessToken = await oAuth2Client.getAccessToken();

//     const transport = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         type: 'OAuth2',
//         user: 'mirageofficial.intl@gmail.com',
//         clientId: CLIENT_ID,
//         clientSecret: CLEINT_SECRET,
//         refreshToken: REFRESH_TOKEN,
//         accessToken: accessToken,
//       },
//     });

//     const mailOptions = {
//       from: 'mirageofficial.intl@gmail.com',
//       to: toEmail,
//       subject: subject,
//       text: text,
//       html: html,
//     };

//     const result = await transport.sendMail(mailOptions);
//     return result;
//   } catch (error) {
//     return error;
//   }
// }



function sendMail(toEmail, subject, text, html) {
  // Create a transporter object with your SMTP configuration
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,      // e.g., 'smtp.example.com'
    port: process.env.SMTP_PORT,      // Use the appropriate port for your SMTP server
    secure: true,                    // Set to true if your server uses SSL/TLS
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    debug: true,
  });

  // Define the email content
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: toEmail,
    subject: subject,
    text: text,
    html: html,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error:', error.message);
    }
    console.log('Email sent:', info.response);
  });
}


module.exports = sendMail;
