var PGConnector = require('./PostgresConnector');

var config = require('./config');

var connector = new PGConnector(config);

module.exports = connector;
