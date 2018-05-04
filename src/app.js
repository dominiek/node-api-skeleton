const Router = require('koa-router');
const Koa = require('koa');
const cors = require('@koa/cors');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const errorHandler = require('./middlewares/error-handler');
const config = require('config');
const { version } = require('../package.json');
const v1 = require('./v1');

const app = new Koa();

app
  .use(errorHandler)
  .use(logger())
  .use(
    cors({
      ...config.get('cors')
    })
  )
  .use(bodyParser());

app.on('error', (err) => {
  // dont output stacktraces of errors that is throw with status as they are known
  if (!err.status || err.status === 500) {
    console.error(err.stack);
  }
});

const router = new Router();
router.get('/', (ctx) => {
  ctx.body = { version };
});
router.use('/1', v1.routes());

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
