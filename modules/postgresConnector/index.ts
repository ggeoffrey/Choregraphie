/// <reference path="../node.d.ts" />

var PGConnector = require('./PostgresConnector');

var config : IDBConfig = require('./config');

var connector = new PGConnector(config);


module.exports = connector;