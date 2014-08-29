express = require 'express'
api = require '../api'




#
# A wrapper for Api class
#
class RestApi
	
	# Bind URL routes to RestApi methods
	# @return Express.Router instance usable with app.use
	@init : ->
		router = express.Router()

		router.get '/applications', RestApi.getApplications
		router.get '/corridors',  RestApi.getCorridors
		router.get '/overviewData', RestApi.getOverviewData
		router.get '/events', RestApi.getEvents
		router.get '/history/:app/:corridor', RestApi.getHistory
		router.get '/trend/:app/:corridor', RestApi.getTrend
		router.get '/calls', RestApi.getCalls

		return router

	# Alias for Api.getApplications
	@getApplications : (req, res)->
		api.getApplications (apps) ->
			res.send(apps)
			res.end()

	# Alias for Api.getCorridors
	@getCorridors : (req, res) ->
		api.getCorridors (c)->
			res.send(c)
			res.end()

	# Alias for Api.getOverviewData
	@getOverviewData :  (req, res) ->
		api.getOverviewData (data)->
			res.send(data)
			res.end()

	# Alias for Api.getEvents
	@getEvents :   (req, res) ->
		api.getEvents (events) ->
			res.send(events)
			res.end()

	# Alias for Api.getHistory
	@getHistory :  (req, res) ->
		params =
			app : req.params.app
			corridor : req.params.corridor

		api.getHistory (history)->
				res.send(history)
				res.end()
			, params 

	# Alias for Api.getTrend
	@getTrend : (req, res) ->
	
		params =
			app : req.params.app
			corridor : req.params.corridor

		api.getTrend (trend)->
				res.send(trend)
				res.end()
			, params

	# Alias for Api.getCalls
	@getCalls :  (req, res)->
		api.getCalls (calls)->
			res.send(  JSON.stringify(calls, null, 2)  )
			res.end()	




module.exports = RestApi.init()
