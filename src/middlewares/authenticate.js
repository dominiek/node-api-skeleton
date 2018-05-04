const jwt = require('jsonwebtoken');
const config = require('config');

const secrets = {
  user: config.get('jwt.secret')
};

function getToken(ctx) {
  let token;
  const parts = (ctx.request.get('authorization') || '').split(' ');
  if (parts.length === 2) {
    const [scheme, credentials] = parts;
    if (/^Bearer$/i.test(scheme)) token = credentials;
  }
  return token;
}

module.exports = ({ type } = {}, options = {}) => {
  return async (ctx, next) => {
    const token = options.getToken ? options.getToken(ctx) : getToken(ctx);
    if (!token) ctx.throw(400, 'no jwt token found');

    // ignoring signature for the moment
    const decoded = jwt.decode(token, { complete: true });
    if (decoded === null) return ctx.throw(400, 'bad jwt token');
    const { payload } = decoded;
    const keyId = payload.kid;
    if (!['user'].includes(keyId)) {
      ctx.throw(401, 'jwt token does not match supported kid');
    }

    if (type && payload.type !== type) {
      ctx.throw(401, `endpoint requires jwt token payload match type "${type}"`);
    }

    // confirming signature
    try {
      jwt.verify(token, secrets[keyId]); // verify will throw
    } catch (e) {
      ctx.throw(401, e);
    }
    ctx.state.jwt = payload;
    return next();
  };
};
