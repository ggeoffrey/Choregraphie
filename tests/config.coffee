assert = require 'assert'
config = require '../config'

describe 'Global', ->
	describe 'config', ->
		it 'should be an object', ->
			config.should.be.an.Object

	
		it 'should contain at least one port to listen', ->
			config.should.have.property 'port'

		describe 'port', ->

			it 'should be an Integer', ->
				rest = config.port %% 1  
				config.port.should.be.a.Number
				rest.should.be.exactly 0

			it 'should be between 0 and 65535', ->
				config.port.should.be.within 0, 65535