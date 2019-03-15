// app/db.js

module.exports = function(app) {
  // mongo
  require('./mongo')(app);
};
