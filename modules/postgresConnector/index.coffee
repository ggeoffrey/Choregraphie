config = require './config'

PGConnector = require('./PostgresConnector')


module.exports = new PGConnector(config)