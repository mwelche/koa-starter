// app/index.js

import Koa from 'koa';
import logger from 'koa-logger';

// CREATE APP

const app = new Koa();

// init db

require("./db")(app);

// init routes

require('./router.js')(app);

// logger

app.use(logger());
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// error

app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

const port = process.env.PORT || 3002;

const server = app.listen(port);
console.log('koa API running on port', port);

module.exports = server;