// app/router.js

import Router from 'koa-router';
import jwt from './jwt'; // JSON Web Token (JWT)
import { ObjectID } from 'mongodb';
import BodyParser from 'koa-bodyparser';
import bcrypt from 'bcrypt';

module.exports = function(app) {
  app.use(BodyParser());

  // Create a new securedRouter
  const router = new Router();
  const securedRouter = new Router();

  // Add basic router
  app.use(router.routes()).use(router.allowedMethods());
  // Add the securedRouter to our app as well
  app.use(securedRouter.routes()).use(securedRouter.allowedMethods());

  /* 
   * PUBLIC ROUTES
   * =============
   */

  router.post("/auth", async (ctx) => {
    let username = ctx.request.body.username;
    let password = ctx.request.body.password;

    const person = await ctx.app.people.findOne({
      username: username,
    });

    if (!person) {
      ctx.status = 401;
      ctx.body = { error: "Username doesn\'t exist, try again or sign up" };
      return;
    }

    // if (!person.password) {
    //   ctx.status = 401;
    //   ctx.body = { error: "No password set!" };
    //   return;
    // }

    // if (bcrypt.compareSync(password, person.password)) {
      // password patched
      const token = jwt.issue({
        user: person.username,
        role: person.role,
      });

      let documentQuery = { "_id": ObjectID(person._id) }; // Used to find the document
      const valuesToUpdate = {
        $set: { token } // values to update
      };
      await ctx.app.people.updateOne(documentQuery, valuesToUpdate);

      ctx.body = {
        token,
      };
    // } else {
    //   ctx.status = 401;
    //   ctx.body = { error: "Invalid Username and Password combination" };
    // }
  });


  /* 
   * SECURE ROUTES
   * =============
   */

  // Apply JWT middleware to secured router only
  securedRouter.use(jwt.errorHandler()).use(jwt.jwt());

  // Get me
  securedRouter.get("/me", async (ctx) => {
    const authorization = ctx.header.authorization;
    const token = authorization.replace(/bearer /i, '');
    const person = await ctx.app.people.findOne({"token": token});

    ctx.body = person || {};
  });

  // List all people
  securedRouter.get("/people", async (ctx) => {
    const people = await ctx.app.people.find().toArray();

    ctx.body = people || [];
  });

  // Create new person
  securedRouter.post("/people", async (ctx) => {
    const person = await ctx.app.people.insert(ctx.request.body);

    ctx.body = person || {};
  });

  // Get one
  securedRouter.get("/people/:id", async (ctx) => {
    const person = await ctx.app.people.findOne({"_id": ObjectID(ctx.params.id)});

    ctx.body = person || {};
  });

  // Update one
  securedRouter.put("/people/:id", async (ctx) => {
    let documentQuery = { "_id": ObjectID(ctx.params.id) }; // Used to find the document
    let { password, ...valuesToUpdate } = ctx.request.body;
    
    ctx.body = await ctx.app.people.updateOne(documentQuery, valuesToUpdate);
  });

  // Update user password
  securedRouter.put("/people/:id/password", async (ctx) => {
    let documentQuery = { "_id": ObjectID(ctx.params.id) }; // Used to find the document

    let { oldPassword, newPassword } = ctx.request.body;

    const hash = bcrypt.hashSync(newPassword, 10);

    ctx.body = await ctx.app.people.updateOne(documentQuery, { password: hash });
  });

  // Delete one
  securedRouter.delete("/people/:id", async (ctx) => {
    let documentQuery = {"_id": ObjectID(ctx.params.id)}; // Used to find the document
    ctx.body = await ctx.app.people.deleteOne(documentQuery);
  });
}