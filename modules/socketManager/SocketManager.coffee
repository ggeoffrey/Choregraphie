lzString = require 'lz-string'
io = null # io instance initilized in app.js
api = require '../api'




compress = ( object ) ->
	#return object
	json = JSON.stringify object
	lzString.compressToBase64 json


class SocketManager
	constructor : ->
		# empty

	@listenToSockets : ->
		io.on 'connection', (socket)->

			socket.on 'getApplications', (data, callback) ->
				api.getApplications (data) ->
					callback compress(data)

			socket.on 'addApplication', (data, callback)->
				api.addApplication(data, callback)

			socket.on 'addCorridor', (data, callback)->
				api.addCorridor(data, callback)

			socket.on 'getCorridors',  (data, callback) ->
				api.getCorridors (data)->
					callback(compress(data))

			socket.on 'getOverviewData', (data, callback) ->
				api.getOverviewData (data)->
					callback(compress(data))


			socket.on 'getHistory', (data, callback) ->
				api.getHistory (data)->
						callback(compress(data))
					, data


			socket.on 'getTrend', (data, callback) ->
				api.getTrend (data)->
						callback(compress(data))
					, data


			socket.on 'getEvents', (data, callback) ->
				api.getEvents (data)->
					callback(compress(data))
				


			socket.on 'setEvents', (event, callback) ->
				next = (result) ->
					if result? and result is true
						socket.broadcast.emit('eventChanged', event)
						socket.emit('eventChanged', event)
						callback(true) if callback?
					else 
						callback(false) if callback?

				try
					api.setEvent(next, event)
				catch e
					console.error e
					callback false
					
				


			socket.on 'getCalls', (data, callback)->
				api.getCalls (calls)->
					callback(compress(calls))

			

init = (socketIOInstance) ->
	if not io?
		io = socketIOInstance
	return SocketManager

module.exports = init;
