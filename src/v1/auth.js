const Router = require('koa-router');
const Joi = require('joi');
const { omit } = require('lodash');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const tokens = require('../lib/tokens');
const { sendWelcome, sendResetPassword, sendResetPasswordUnknown, sendWelcomeKnown } = require('../lib/emails');
const User = require('../models/user');

const router = new Router();

router
  .post(
    '/apply',
    validate({
      body: {
        email: Joi.string()
          .email()
          .required(),
        addToMailingList: Joi.boolean().default(false)
      }
    }),
    async (ctx) => {
      const { email } = ctx.request.body;
      const user = await User.findOne({ email: email });
      if (user) {
        await sendWelcomeKnown({
          to: email,
          name: user.name
        });
      } else {
        await sendWelcome({
          to: email,
          token: tokens.createUserTemporaryToken({ email }, 'user:register')
        });
      }
      // todo add email to mailling list
      ctx.status = 204;
    }
  )
  .post(
    '/register',
    validate({
      body: {
        name: Joi.string().required(),
        password: Joi.string().required(),
        token: Joi.string().required(),
        termsAccepted: Joi.boolean().valid(true)
      }
    }),
    authenticate({ type: 'user:register' }, { getToken: (ctx) => ctx.request.body.token }),
    async (ctx) => {
      const { jwt } = ctx.state;
      if (!jwt || !jwt.email) {
        ctx.throw(500, 'jwt token doesnt contain email');
      }

      const existingUser = await User.findOne({
        email: jwt.email
      });

      if (existingUser) {
        ctx.throw(409, 'user already exists');
      }

      const user = await User.create({
        email: jwt.email,
        ...omit(ctx.request.body, ['token'])
      });
      ctx.body = { data: { token: tokens.createUserToken(user) } };
    }
  )
  .post(
    '/login',
    validate({
      body: {
        email: Joi.string()
          .email()
          .required(),
        password: Joi.string().required()
      }
    }),
    async (ctx) => {
      const { email, password } = ctx.request.body;
      const user = await User.findOne({ email });
      if (!user) {
        ctx.throw(401, 'email password combination does not match');
      }
      const isSame = await user.verifyPassword(password);
      if (!isSame) {
        ctx.throw(401, 'email password combination does not match');
      }
      ctx.body = { data: { token: tokens.createUserToken(user) } };
    }
  )
  .post(
    '/request-password',
    validate({
      body: {
        email: Joi.string()
          .email()
          .required()
      }
    }),
    async (ctx) => {
      const { email } = ctx.request.body;
      const user = await User.findOne({ email });
      if (user) {
        await sendResetPassword({
          to: email,
          token: tokens.createUserTemporaryToken({ userId: user._id }, 'user:password')
        });
      } else {
        await sendResetPasswordUnknown({
          to: email
        });
      }
      ctx.status = 204;
    }
  )
  .post(
    '/set-password',
    validate({
      body: {
        token: Joi.string().required(),
        password: Joi.string().required()
      }
    }),
    authenticate({ type: 'user:password' }, { getToken: (ctx) => ctx.request.body.token }),
    async (ctx) => {
      const { password } = ctx.request.body;
      const user = await User.findById(ctx.state.jwt.userId);
      if (!user) {
        ctx.throw(500, 'user does not exists');
      }
      user.password = password;
      await user.save();
      ctx.body = { data: { token: tokens.createUserToken(user) } };
    }
  );

module.exports = router;
