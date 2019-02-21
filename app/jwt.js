// app/jwt.js

const jwt = require("koa-jwt");
const jsonwebtoken = require("jsonwebtoken"); // Import jsonwebtoken

const SECRET = "S3cRET~!";
const jwtInstance = jwt({secret: SECRET});

const issueToken = (payload) => {
    return jsonwebtoken.sign(payload, SECRET);
};

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

module.exports.jwt = jwtInstance;
module.exports.errorHandler = JWTErrorHandler;
// helper function
module.exports.issue = issueToken;
