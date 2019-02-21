// app/index.js

const Koa = require('koa');
const app = new Koa();
const Router = require("koa-router");

// init db

require("./db")(app);

// logger

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
  log.error('server error', err, ctx)
});

// JSON Web Token (JWT)

const jwt = require("./jwt");

// Create a new securedRouter
const router = new Router();
const securedRouter = new Router();

// Add basic router
app.use(router.routes()).use(router.allowedMethods());
// Add the securedRouter to our app as well
app.use(securedRouter.routes()).use(securedRouter.allowedMethods());

router.post("/auth", async (ctx) => {
  let username = ctx.request.body.username;
  let password = ctx.request.body.password;

  if (username === "user" && password === "pwd") {
      ctx.body = {
          token: jwt.issue({
              user: "user",
              role: "admin"
          })
      }
  } else {
      ctx.status = 401;
      ctx.body = {error: "Invalid login"}
  }
});

// Apply JWT middleware to secured router only
securedRouter.use(jwt.errorHandler()).use(jwt.jwt());

// List all people
securedRouter.get("/people", async (ctx) => {
    ctx.body = await ctx.app.people.find().toArray();
});

// Create new person
securedRouter.post("/people", async (ctx) => {
    ctx.body = await ctx.app.people.insert(ctx.request.body);
});

// Get one
securedRouter.get("/people/:id", async (ctx) => {
    ctx.body = await ctx.app.people.findOne({"_id": ObjectID(ctx.params.id)});
});

// Update one
securedRouter.put("/people/:id", async (ctx) => {
    let documentQuery = {"_id": ObjectID(ctx.params.id)}; // Used to find the document
    let valuesToUpdate = ctx.request.body;
    ctx.body = await ctx.app.people.updateOne(documentQuery, valuesToUpdate);
});

// Delete one
securedRouter.delete("/people/:id", async (ctx) => {
    let documentQuery = {"_id": ObjectID(ctx.params.id)}; // Used to find the document
    ctx.body = await ctx.app.people.deleteOne(documentQuery);
});

const server = app.listen(8080);

module.exports = server;