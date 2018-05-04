const fs = require('fs');
const path = require('path');
const { sendMail } = require('./mailer');
const config = require('config');
const { template: templateFn } = require('./utils');
const { promisify } = require('util');

const templatesDist = path.join(__dirname, '../../emails/dist');
const templates = {};

const defaultOptions = config.get('app');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

exports.initialize = async () => {
  const files = await readdir(templatesDist);
  await Promise.all(
    files.map((file) => {
      return readFile(path.join(templatesDist, file)).then((str) => {
        templates[file] = str.toString();
      });
    })
  );
};

function template(templateName, map) {
  const templateStr = templates[templateName];
  if (!templateStr)
    throw Error(`Cant find template by ${templateName}. Available templates: ${Object.keys(templates)}`);
  return templateFn(templateStr, map);
}

exports.sendWelcome = ({ to, token }) => {
  const options = {
    ...defaultOptions,
    token
  };

  sendMail(
    {
      to,
      subject: 'Welcome Registration'
    },
    {
      html: template('welcome.html', options),
      text: template('welcome.text', options)
    }
  );
};

exports.sendWelcomeKnown = ({ to, name }) => {
  const options = {
    ...defaultOptions,
    name,
    email: to
  };

  sendMail(
    {
      to,
      subject: 'Welcome Back'
    },
    {
      html: template('welcome-known.html', options),
      text: template('welcome-known.text', options)
    }
  );
};

exports.sendResetPasswordUnknown = ({ to }) => {
  const options = {
    ...defaultOptions,
    email: to
  };

  sendMail(
    {
      to,
      subject: `Password Reset Request`
    },
    {
      html: template('reset-password-unknown.html', options),
      text: template('reset-password-unknown.text', options)
    }
  );
};

exports.sendResetPassword = ({ to, token }) => {
  const options = {
    ...defaultOptions,
    email: to,
    token
  };

  sendMail(
    {
      to,
      subject: `Password Reset Request`
    },
    {
      html: template('reset-password.html', options),
      text: template('reset-password.text', options)
    }
  );
};

exports.sendAdminInvite = ({ to, token }) => {
  const options = {
    ...defaultOptions,
    token
  };

  sendMail(
    {
      to,
      subject: `Admin Invitation for ${options.name}`
    },
    {
      html: template('admin-invite.html', options),
      text: template('admin-invite.text', options)
    }
  );
};
