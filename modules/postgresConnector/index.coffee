config = require './config'

PGConnector = require('./PostgresConnector')(config)

module.exports = PGConnector