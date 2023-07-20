const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// Your Gmail API credentials should come from the .env file or some secure configuration
const CLIENT_ID = '1008716893793-nv2m74faokabu2i9pr2n9jnegsd6l20i.apps.googleusercontent.com';
const CLEINT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04fmQ7HHJ_NDyCgYIARAAGAQSNwF-L9IrtLX0zsUJIz90EkKKlGddvsNVo67ubMGq-FnEIOpqZ60XsmJwMnxqywprzVFAZcvXhFg';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(toEmail, subject, text, html) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'mirageofficial.intl@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: 'mirageofficial.intl@gmail.com',
      to: toEmail,
      subject: subject,
      text: text,
      html: html,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

module.exports = sendMail;
