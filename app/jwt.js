// app/jwt.js

const jwt = require("koa-jwt");
const jsonwebtoken = require("jsonwebtoken"); // Import jsonwebtoken

const SECRET = "K04-St4Rt3R-S3cRET~!";
const jwtInstance = jwt({secret: SECRET});

function JWTErrorHandler(ctx, next) {
  return next().catch((err) => {
    if (401 == err.status) {
      ctx.status = 401;
      ctx.body = {
        "error": "Not authorized"
      };
    } else {
      throw err;
    }
  });
};

module.exports.jwt = () => jwtInstance;
module.exports.errorHandler = () => JWTErrorHandler;
// helper function
module.exports.issue = (payload) => {
  return jsonwebtoken.sign(payload, SECRET);
};
