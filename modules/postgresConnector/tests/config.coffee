assert = require 'assert'
config = require '../config'

describe 'PostgresConnector', ->
	describe 'config', ->
	
		it 'should be an object', ->
			assert(typeof config is 'object')

	
		it 'should contain at least {host, user, pass, databaseName}', ->
			config.should.have.property 'host'
			config.should.have.property 'user'
			config.should.have.property 'pass'
			config.should.have.property 'databaseName'

		
		it 'host should be a string', ->
			config.host.should.be.a.String

		it 'user should be a string', ->
			config.user.should.be.a.String

		it 'pass should be a string', ->
			config.pass.should.be.a.String

		it 'databaseName should be a string', ->
			config.databaseName.should.be.a.String
