const Router = require('koa-router');
const auth = require('./auth');
const users = require('./users');

const router = new Router();

router.use('/auth', auth.routes());
router.use('/users', users.routes());

module.exports = router;
