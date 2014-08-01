express = require 'express'
api = require '../api'

router = express.Router()


router.get '/applications', (req, res)->
	api.getApplications (apps) ->
		res.send(apps)
		res.end()


router.get '/corridors',  (req, res) ->
	api.getCorridors (c)->
		res.send(c)
		res.end()


router.get '/overviewData',  (req, res) ->
	api.getOverviewData (data)->
		res.send(data)
		res.end()


router.get '/events',  (req, res) ->
	api.getEvents (events) ->
		res.send(events)
		res.end()


router.get '/history/:app/:corridor', (req, res) ->
	params =
		app : req.params.app
		corridor : req.params.corridor

	api.getHistory (history)->
			res.send(history)
			res.end()
		, params 


router.get '/trend/:app/:corridor', (req, res) ->
	
	params =
		app : req.params.app
		corridor : req.params.corridor


	api.getTrend (trend)->
			res.send(trend)
			res.end()
		, params


router.get '/calls', (req, res)->
	api.getCalls (calls)->
		res.send(  JSON.stringify(calls, null, 2)  )
		res.end()



module.exports = router;
