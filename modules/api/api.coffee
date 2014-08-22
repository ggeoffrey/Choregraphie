path = require 'path'
fs = require 'fs'
_ = require 'underscore'


connector = require '../postgresConnector'

ConfigManager = require '../ConfigManager'

Application  = require './Application'
Corridor  = require './Corridor'





class Api	

	@getApplications :  (callback) ->
		if not callback?
			throw 'bad arguments'

		ConfigManager.getConfig (config)->
			if config.limitDataToConfigSpecifiedList is on and config.apps?.length > 0
				objectApps = []
				for app in config.apps
					objectApps.push new Application(app, 'config')
				callback(objectApps)
			else 
				connector.getApplications (dbApps)->
					apps = _.union(config.apps, dbApps).sort()
					objectApps = []
					for app in apps
						if app in config.apps
							objectApps.push new Application(app, 'config')
						else
							objectApps.push new Application(app, 'db')

					callback objectApps

	@addApplication : (app, callback)->
		if not app? or typeof app isnt 'string'
			throw 'bad arguments: expected \'app\' <string>'
		if not callback?
			throw 'bad arguments: callback expected'

		app = new Application(app, 'config')
		ConfigManager.getConfig (config)=>
			config.apps = _.union(config.apps, [app.name])

			ConfigManager.saveConfig config, (err)->
				console.log err if err?

				callback()

	@deleteApplication : (app, callback)->
		if not app? or typeof app isnt 'string'
			throw 'bad arguments: expected \'app\' <string>'
		if not callback?
			throw 'bad arguments: callback expected'

		app = new Application(app, 'config')

		ConfigManager.getConfig (config)=>
			config.apps = _.reject config.apps, (item) -> item is app.name

			ConfigManager.saveConfig config, (err)->
				console.log err if err?
				callback()


	@getCorridors :  (callback) ->
		if not callback?
			throw 'bad arguments'

		ConfigManager.getConfig (config)->
			if config.limitDataToConfigSpecifiedList is on and config.corridors?.length > 0
				objectCorridor = []
				for corridor in config.corridors
					objectCorridor.push new Corridor(corridor, 'config')
				callback(objectCorridor)
			else
				connector.getCorridors (dbCorridors)->
					corridors = _.union(config.corridors, dbCorridors).sort()
					objectCorridor = []
					for corridor in corridors
						if corridor in config.corridors
							objectCorridor.push new Corridor(corridor, 'config')
						else
							objectCorridor.push new Corridor(corridor, 'db')
					
					callback objectCorridor

	@addCorridor : (corridor, callback)->
		if not corridor? or typeof corridor isnt 'string'
			throw 'bad arguments: expected \'corridor\' <string>'
		if not callback?
			throw 'bad arguments: callback expected'

		corridor = new Corridor(corridor, 'config')
		ConfigManager.getConfig (config)=>
			config.corridors = _.union(config.corridors, [corridor.name])

			ConfigManager.saveConfig config, (err)->
				console.log err if err?

				callback()

	@deleteCorridor : (corridor, callback)->
		if not corridor? or typeof corridor isnt 'string'
			throw 'bad arguments: expected \'corridor\' <string>'
		if not callback?
			throw 'bad arguments: callback expected'

		corridor = new Corridor(corridor, 'config')

		ConfigManager.getConfig (config)=>
			config.corridors = _.reject config.corridors, (item) -> item is corridor.name
			ConfigManager.saveConfig config, (err)->
				console.log err if err?
				callback()				


	
	@getEvents :  (callback) ->
		if not callback?
			throw 'bad arguments'
		connector.getEvents(callback)


	@setEvent : (callback, event)->
		if not callback? or typeof event?.seen isnt 'boolean' or typeof event?.deleted isnt 'boolean'
			throw 'bad arguments'
		connector.setEvent(callback, event)

	@getOverviewData :  (callback) ->
		if not callback?
			throw 'bad arguments'
		connector.getOverviewData(callback)
	

	@getHistory :  (callback, options) ->

		if not callback? or typeof options?.app isnt 'string' or typeof options?.corridor isnt 'string'
			throw new Error('bad arguments')
		connector.getHistory(callback, false, options)
	

	@getTrend :  (callback, options) ->
		if not callback? or typeof options?.app isnt 'string' or typeof options?.corridor isnt 'string'
			throw 'invalid params'
		connector.getTrend(callback, false, options)

	@getCalls :  (callback) ->
		if not callback?
			throw 'invalid params'
		connector.getCalls(callback, false)


	





	
module.exports = Api