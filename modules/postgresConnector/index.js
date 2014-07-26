
var config = require('./config');

var PGConnector = require('./PostgresConnector')(config);

module.exports = PGConnector;
