api = require '../api'

describe 'Api', ->
	it 'should be ready in less than 5000ms', (done)->
		@timeout 5000
		api.getApplications (stringArray) ->
			done()

	describe 'method',->

		# returned data

		describe 'getApplications', ->
			it 'should be a Function', ->
				api.getApplications.should.be.a.Function
			it 'should return an array of objects ', (done)->
				
				api.getApplications (objArray) ->
					objArray.should.be.an.Array.and.should.not.be.empty
					for supposedObject in objArray
						supposedObject.should.have.keys [ 'name', 'type' ]

					done()

			it 'should throw an exception on bad params ', ->
				api.getApplications.bind(null, null).should.throw()

		describe 'getCorridors', ->
			it 'should be a Function', ->
				api.getCorridors.should.be.a.Function

			it 'should return an array of strings ', (done)->
				
				api.getCorridors (objArray) ->
					objArray.should.be.an.Array.and.should.not.be.empty
					for supposedObject in objArray
						supposedObject.should.have.keys [ 'name', 'type' ]
					done()

			it 'should throw an exception on bad params ', ->
				api.getCorridors.bind(null, null).should.throw()

		describe 'getEvents', ->
			it 'should be a Function', ->
				api.getEvents.should.be.a.Function

			it 'should return an array of Events ', (done)->
				
				api.getEvents (eventArray) ->
					eventArray.should.be.an.Array.and.should.not.be.empty

					for supposedEvent, index in eventArray

						if index % 2 is 0				
							#console.log supposedEvent if supposedEvent.codeapp is 'ACIN'	
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
			it 'should throw an exception on bad params ', ->
				next = (result)->
					console.log result
				api.getEvents.bind(null, null).should.throw()
			

		describe 'setEvent', ->
			it 'should be a Function', ->
				api.setEvent.should.be.a.Function

			it 'should return true on update success', (done)->
				api.getEvents (eventArray)->
					random = (Math.random() * eventArray.length + 1) // 1 # // -> Math.floor(x/y)
					event = eventArray[random]

					next = (result)->
						result.should.be.ok
						done()
					# we doesn't change the event to avoid corruption
					api.setEvent next, event

			it 'should return false on update fail', (done)->
				api.getEvents (eventArray)->
					random = (Math.random() * eventArray.length + 1) // 1 # // -> Math.floor(x/y)
					event = eventArray[random]

					event.id = -1

					next = (result)->
						console.log
						result.should.not.be.ok
						done()
					api.setEvent next, event

			it 'should throw an exception on bad params', ->
				api.getEvents (eventArray)->
					random = (Math.random() * eventArray.length + 1) // 1 # // -> Math.floor(x/y)
					event = eventArray[random]

					event.id = -1
					event.seen = 'banana'
					
					next = (value)-> value
					api.setEvent.bind(next, event).should.throw()
					

		describe 'getHistory', ->
			it 'should be a Function', ->
				api.getHistory.should.be.a.Function

			it 'should return an array of Values', (done)->
				
				options =
					app : 'all'
					corridor : 'all'
					limit: 1000

				next = (valuesArray)->
					valuesArray.should.be.an.Array
					done()

				api.getHistory next, options

			it 'should return an empty array on inexistant params', (done)->
				
				options =
					app : 'yolo'
					corridor : 'swag'
					limit: 1000

				next = (valuesArray)->
					valuesArray.should.be.an.Array.and.be.empty
					done()

				api.getHistory next, options

			it 'should throw an exception on bad params', ->
				
				next = (valuesArray)->
					console.log valuesArray
					done() if done?

				options = 
					app: false
					corridor: {}
				
				api.getHistory.bind(null, next).should.throw()	
				
				
				

			it 'should throw an exception on bad callback', ->
				api.getHistory.bind(null, null, null).should.throw()

		describe 'getTrend', ->
			it 'should be a Function', ->
				api.getTrend.should.be.a.Function

			it 'getTrend should return an empty object on bad params', (done)->
				
				options =
					app : 'all'
					corridor : 'all'


				next = (values)->
					values.should.be.an.Object#.and.should.be.empty
					done()

				api.getTrend next, options

			it 'getTrend should return an Object containing Values', (done)->

				options =
					app : 'VMIR'
					corridor : 'X_00'

				next = (values)->
					values.should.be.an.Object.and.not.be.empty
					for key, value of values
						key.should.be.a.String
						value.should.be.an.Array
						for item in value
							item.should.be.an.Object
							item.should.have.keys [
								'somme'
								'average'
								'stddev'
								'starttime'
							]
							item.somme.should.be.a.Number.and.be.greaterThan -1
							item.average.should.be.a.Number.and.be.greaterThan -1
							item.stddev.should.be.a.Number.and.be.greaterThan -1
							item.starttime.should.be.Date
							
					done()
				api.getTrend next, options

			it 'should throw an exception on bad params', ->
				api.getTrend.bind(null, null).should.throw()

			it 'should throw an exception on bad params values', ->
				options = 
					yolo: 'swag'
				api.getTrend.bind(null, null, options).should.throw()

		describe 'getOverviewData', ->

			it 'should be a Function', ->
				api.getOverviewData.should.be.a.Function

			it 'should return an array', (done)->
				api.getOverviewData (data)->
					data.should.be.an.Array
					for item in data
						item.should.have.keys [
							'codeapp'
							'couloir'
							'codetype'
							'start_time'
							'value'
							'sante'
							'types'
							'resSante'
						]
						item.codeapp.should.be.a.String
						item.couloir.should.be.a.String
						item.codetype.should.be.a.String
						item.start_time.should.be.a.Date
						item.value.should.be.a.String
						item.sante.should.be.a.Number
						item.types.should.be.an.Object
					done()

			it 'should throw an exception on bad callback', ->
				api.getOverviewData.bind(null, null).should.throw()
		

		describe 'getCalls', ->
			it 'should be a Function', ->
				api.should.have.property 'getCalls'
				api.getCalls.should.be.a.Function

			it 'getCalls should return a CallsTree', (done)->
				api.getCalls (callsTree)->
					callsTree.should.be.an.Object

					callsTree.nodes.should.be.an.Object
					callsTree.links.should.be.an.Array

					for key, node of callsTree.nodes
						key.should.be.a.String
						node.should.be.an.Object
						node.type.should.be.a.String
						node.name.should.be.a.String

					for link in callsTree.links
						link.should.be.an.Object
						link.source.should.be.a.String
						link.target.should.be.a.String

						link.value.should.be.a.Number
						link.date.should.be.a.Date

					done()