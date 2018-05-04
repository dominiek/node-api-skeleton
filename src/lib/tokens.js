const jwt = require('jsonwebtoken');
const config = require('config');

const expiresIn = config.get('jwt.expiresIn');
const secrets = {
  user: config.get('jwt.secret')
};

exports.createUserTemporaryToken = (claims, type) => {
  return jwt.sign(
    {
      ...claims,
      type,
      kid: 'user'
    },
    secrets.user,
    {
      expiresIn: expiresIn.temporary
    }
  );
};

exports.createUserToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      type: 'user',
      kid: 'user'
    },
    secrets.user,
    {
      expiresIn: expiresIn.regular
    }
  );
};
