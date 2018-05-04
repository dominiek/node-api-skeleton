const postmark = require('postmark');
const config = require('config');

const apiKey = config.get('postmark.apiKey');
const from = config.get('postmark.from');

exports.sendMail = ({ to, subject }, { html, text }) => {
  if (process.env.MOCK_EMAIL) {
    console.log(`Sending email to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('Body:');
    console.log(html);
    console.log(text);
  } else {
    const client = new postmark.Client(apiKey);
    const env = process.env.NODE_ENV;
    if (env !== 'test') {
      client
        .sendEmail({
          From: from,
          To: to,
          Subject: subject,
          TextBody: text,
          HtmlBody: html
        })
        .catch((error) => {
          console.error(`Error happened while sending email to ${to} (${error.message})`);
          console.error(error);
        });
    }
  }
};
