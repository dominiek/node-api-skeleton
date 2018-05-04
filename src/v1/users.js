const Router = require('koa-router');
const Joi = require('joi');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const User = require('../models/user');

const router = new Router();

const fetchUser = async (ctx, next) => {
  ctx.state.user = await User.findById(ctx.state.jwt.userId);
  if (!ctx.state.user) ctx.throw(500, 'user associsated to token could not not be found');
  await next();
};

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .get('/me', (ctx) => {
    ctx.body = { data: ctx.state.user.toResource() };
  })
  .patch(
    '/me',
    validate({
      body: {
        name: Joi.string().required()
      }
    }),
    async (ctx) => {
      const { user } = ctx.state;
      Object.assign(user, ctx.request.body);
      await user.save();
      ctx.body = { data: user.toResource() };
    }
  );

module.exports = router;
