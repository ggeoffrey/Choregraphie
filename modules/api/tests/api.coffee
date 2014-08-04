assert = require 'assert'
api = require '../api'

describe 'Api', ->
	it 'should be ready in less than 5000ms', (done)->
		@timeout 5000
		api.getApplications (stringArray) =>
			done()

	describe 'methods', ->
		it 'should contains the function getApplications', ->
			api.should.have.property 'getApplications'
			api.getApplications.should.be.a.Function

		it 'should contains the function getCorridors', ->
			api.should.have.property 'getCorridors'
			api.getCorridors.should.be.a.Function

		it 'should contains the function getEvents', ->
			api.should.have.property 'getEvents'
			api.getEvents.should.be.a.Function

		it 'should contains the function setEvent', ->
			api.should.have.property 'setEvent'
			api.setEvent.should.be.a.Function

		it 'should contains the function getOverviewData', ->
			api.should.have.property 'getOverviewData'
			api.getOverviewData.should.be.a.Function

		it 'should contains the function getHistory', ->
			api.should.have.property 'getHistory'
			api.getHistory.should.be.a.Function

		it 'should contains the function getTrend', ->
			api.should.have.property 'getTrend'
			api.getTrend.should.be.a.Function

		it 'should contains the function getCalls', ->
			api.should.have.property 'getCalls'
			api.getCalls.should.be.a.Function

		# returned data

		it 'getApplications should return an array of strings ', (done)->
			
			api.getApplications (stringArray) ->
				stringArray.should.be.an.Array.and.should.not.be.empty
				for supposedString in stringArray
					supposedString.should.be.a.String

				done()

		it 'getCorridors should return an array of strings ', (done)->
			
			api.getCorridors (stringArray) ->
				stringArray.should.be.an.Array.and.should.not.be.empty
				for supposedString in stringArray
					supposedString.should.be.a.String
				done()

		it 'getEvents should return an array of Events ', (done)->
			
			api.getEvents (eventArray) ->
				eventArray.should.be.an.Array.and.should.not.be.empty

				for supposedEvent, index in eventArray

					if index % 2 is 0					
						supposedEvent.should.have.keys [
							'id'
							'codeapp' # TODO should be changed to application
							'couloir' # TODO should be changed to corridor
							'codetype'
							'start_time' # TODO should be changed to starttime
							'seen'
							'deleted'
							'old_value'
							'value'
							'diff_stddev'
							'type'
						]
				done()

		it 'setEvent should return true', (done)->
			api.getEvents (eventArray)->
				random = (Math.random() * eventArray.length + 1) // 1 # // -> Math.floor(x/y)
				event = eventArray[random]

				next = (result)->
					result.should.be.ok
					done()
				# we doesn't change the event to avoid corruption
				api.setEvent next, event

		it 'getHistory should return an array of Values', (done)->
			
			options =
				app : 'all'
				corridor : 'all'
				limit: 1000

			next = (valuesArray)->
				valuesArray.should.be.an.Array
				done()

			api.getHistory next, options



###	
		it 'getOverviewData should return  an object', ->
			api.should.have.property 'getOverviewData'
			api.getOverviewData.should.be.a.Function

		it 'getHistory should return  an array of objects', ->
			api.should.have.property 'getHistory'
			api.getHistory.should.be.a.Function

		it 'getTrend should return  an array of objects', ->
			api.should.have.property 'getTrend'
			api.getTrend.should.be.a.Function

		it 'getCalls should return  a CallTree', ->
			api.should.have.property 'getCalls'
			api.getCalls.should.be.a.Function
###