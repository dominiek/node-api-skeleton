const { initialize: initializeEmails } = require('../../lib/emails');

jest.mock('../mailer');

const { sendMail } = require('../mailer');

const { sendWelcome } = require('../emails');

beforeAll(async () => {
  await initializeEmails();
});

describe('Emails', () => {
  it.skip('sendWelcome', async () => {
    sendWelcome('foo@bar.com', { token: '$token' });
    const optionsArgs = sendMail.mock.calls[0][0];
    expect(optionsArgs.to).toBe('foo@bar.com');
    const templateArgs = sendMail.mock.calls[0][1];
    expect(templateArgs.html.includes('$token')).toBe(true);
    expect(templateArgs.text.includes('$token')).toBe(true);
  });
});
