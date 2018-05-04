module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const errorStatus = Number.isInteger(err.status) ? err.status : 500;
    ctx.status = errorStatus;
    ctx.body = {
      error: {
        message: err.message
      }
    };
    ctx.app.emit('error', err, ctx);
  }
};
