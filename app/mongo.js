// app/mongo.js

const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = "mongodb://localhost:27017";

module.exports = function(app) {
  MongoClient.connect(MONGO_URL, { useNewUrlParser: true }).then((client) => {
    app.db = client.db('koa-starter');
    app.people = app.db.collection('people');
    console.log("Database connection established");
  }).catch((err) => console.error(err));
};
