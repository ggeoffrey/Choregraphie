lzString = require 'lz-string'
api = require '../api'


#
# WebSockets Api using Socket.IO
#
# Provide same methods as RestApi, but via sockets.
# 
# As socket.io is based on websockets, data can't be gziped. We send response in a LZ copressed string as base64.
# Steps:
# - Listen to a flag
# - Get data from Api when this flag is triggered
# - Serialize to Json
# - LZ compress JSON string
# - Base64 encode this string
# - return it via callback
#
class SocketManager

	@io : null

	# Create a socket instance
	# @param socketIOInstance [Object] Socket.io module
	# @param httpServer [Object] Node Http Server to listen to
	# @return [SocketManager]
	@init : (socketIOInstance, httpServer) =>
		###
			Configure Socket.IO here
		###

		{websocketsOpts} = require '../../config'

		if not @io?
			@io = new socketIOInstance httpServer, websocketsOpts
		return @


	# Compress any object to a LZ base 64 encoded string
	# @return [String]
	@compress : ( object ) ->
		#return object
		json = JSON.stringify object
		lzString.compressToBase64 json


	# Bind sockets listeners with Api methods
	@listenToSockets : ->
		@io.on 'connection', (socket)->

			socket.on 'getApplications', (data, callback) =>
				api.getApplications (data) =>
					callback @compress(data)

			socket.on 'addApplication', (data, callback)->
				api.addApplication(data, callback)

			socket.on 'deleteApplication', (data, callback)->
				api.deleteApplication(data, callback)


			socket.on 'getCorridors',  (data, callback) =>
				api.getCorridors (data)=>
					callback(@compress(data))

			socket.on 'addCorridor', (data, callback)->
				api.addCorridor(data, callback)

			socket.on 'deleteCorridor', (data, callback)->
				api.deleteCorridor(data, callback)

			socket.on 'getOverviewData', (data, callback) =>
				api.getOverviewData (data)=>
					callback(@compress(data))


			socket.on 'getHistory', (data, callback) =>
				api.getHistory (data)=>
						callback(@compress(data))
					, data


			socket.on 'getTrend', (data, callback) =>
				api.getTrend (data)=>
						callback(@compress(data))
					, data


			socket.on 'getEvents', (data, callback) =>
				api.getEvents (data)=>
					callback(@compress(data))
				


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
					
				


			socket.on 'getCalls', (data, callback)=>
				api.getCalls (calls)=>
					callback(@compress(calls))

			



module.exports = SocketManager.init
