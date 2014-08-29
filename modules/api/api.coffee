path = require 'path'
fs = require 'fs'
_ = require 'underscore'




ConfigManager = require '../ConfigManager'

Application  = require './Application'
Corridor  = require './Corridor'






#
#	# Central API access. A database connector proxy 
#
class Api

	# @property Specify the connector to use
	constructor : ->

		@connector = require '../postgresConnector'
		

	#
	# Fetch applications from the connector AND the restrictedData.json file (union)
	# @param [Function] callback Array&lt;string&gt;
	#
	# @return [undefined]
	#
	getApplications :  (callback) ->
		if not callback?
			throw 'bad arguments'

		ConfigManager.getConfig (config)=>
			if config.limitDataToConfigSpecifiedList is on and config.apps?.length > 0
				objectApps = []
				for app in config.apps
					objectApps.push new Application(app, 'config')
				callback(objectApps)
			else 
				@connector.getApplications (dbApps)=>
					apps = _.union(config.apps, dbApps).sort()
					objectApps = []
					for app in apps
						if app in config.apps
							objectApps.push new Application(app, 'config')
						else
							objectApps.push new Application(app, 'db')

					callback objectApps

	#
	# Add an application in the restrictedData.json file
	# @param [String] app  Application name
	# @param [Function] callback [undefined]
	#
	# @return [undefined]
	#
	addApplication : (app, callback)=>
		if not app? or typeof app isnt 'string'
			throw 'bad arguments: expected \'app\' <string>'
		if not callback?
			throw 'bad arguments: callback expected'

		app = new Application(app, 'config')
		ConfigManager.getConfig (config)=>
			config.apps = _.union(config.apps, [app.name])

			ConfigManager.saveConfig config, (err)=>
				console.log err if err?

				callback()

	#
	# Delete an application in the restrictedData.json file
	# @param [String] app  Application name
	# @param [Function] callback [undefined]
	#
	# @return [undefined]
	#
	deleteApplication : (app, callback)=>
		if not app? or typeof app isnt 'string'
			throw 'bad arguments: expected \'app\' <string>'
		if not callback?
			throw 'bad arguments: callback expected'

		app = new Application(app, 'config')

		ConfigManager.getConfig (config)=>
			config.apps = _.reject config.apps, (item) => item is app.name

			ConfigManager.saveConfig config, (err)=>
				console.log err if err?
				callback()


	

	#
	# Fetch corridors from the connector AND the restrictedData.json file (union)
	# @param [Function] callback Array&lt;string&gt;
	#
	# @return [undefined]
	#
	getCorridors :  (callback) =>
		if not callback?
			throw 'bad arguments'

		ConfigManager.getConfig (config)=>
			if config.limitDataToConfigSpecifiedList is on and config.corridors?.length > 0
				objectCorridor = []
				for corridor in config.corridors
					objectCorridor.push new Corridor(corridor, 'config')
				callback(objectCorridor)
			else
				@connector.getCorridors (dbCorridors)=>
					corridors = _.union(config.corridors, dbCorridors).sort()
					objectCorridor = []
					for corridor in corridors
						if corridor in config.corridors
							objectCorridor.push new Corridor(corridor, 'config')
						else
							objectCorridor.push new Corridor(corridor, 'db')
					
					callback objectCorridor
	#
	# Add a corridor in the restrictedData.json file
	# @param [String] app  Corridor name
	# @param [Function] callback [undefined]
	#
	# @return [undefined]
	#
	addCorridor : (corridor, callback)=>
		if not corridor? or typeof corridor isnt 'string'
			throw 'bad arguments: expected \'corridor\' <string>'
		if not callback?
			throw 'bad arguments: callback expected'

		corridor = new Corridor(corridor, 'config')
		ConfigManager.getConfig (config)=>
			config.corridors = _.union(config.corridors, [corridor.name])

			ConfigManager.saveConfig config, (err)=>
				console.log err if err?

				callback()

	#
	# Delete a corridor in the restrictedData.json file
	# @param [String] app  Corridor name
	# @param [Function] callback [undefined]
	#
	# @return [undefined]
	#
	deleteCorridor : (corridor, callback)=>
		if not corridor? or typeof corridor isnt 'string'
			throw 'bad arguments: expected \'corridor\' <string>'
		if not callback?
			throw 'bad arguments: callback expected'

		corridor = new Corridor(corridor, 'config')

		ConfigManager.getConfig (config)=>
			config.corridors = _.reject config.corridors, (item) => item is corridor.name
			ConfigManager.saveConfig config, (err)=>
				console.log err if err?
				callback()				


	#
	# Fetch Events from the connector
	# @param [Function] callback Array&lt;Event&gt;
	# @return [undefined]
	#
	getEvents :  (callback) =>
		if not callback?
			throw 'bad arguments'
		@connector.getEvents(callback)

	#
	# Set en event in the @connector. Basically UPDATE it in the database.
	# @note The connector should find in the database by event.id and persist this new event.
	# @note If you want update an event, this method is for you
	# @param [Function] callback sent to the connector
	# @param [Event] event to UPDATE
	# @return [undefined]
	#
	setEvent : (callback, event)=>
		if not callback? or typeof event?.seen isnt 'boolean' or typeof event?.deleted isnt 'boolean'
			throw 'bad arguments'
		@connector.setEvent(callback, event)


	#
	# Fetch OverviewData from the connector
	# @see Connector module
	#
	getOverviewData :  (callback) =>
		if not callback?
			throw 'bad arguments'
		@connector.getOverviewData(callback)
	

	#
	# Fetch History values from the connector
	# @param options [object] 
	# @option options [string] app The application name
	# @option options [string] corridor The corridor name
	# 
	# @param callback [Function] Array&lt;Values&gt;
	#
	getHistory :  (callback, options) =>

		if not callback? or typeof options?.app isnt 'string' or typeof options?.corridor isnt 'string'
			throw new Error('bad arguments')
		@connector.getHistory(callback, false, options)
	
	#
	# Fetch Trend values from the connector
	# @param options [object] Options
	# @option options [string] app The application name
	# @option options [string] corridor The corridor name
	# 
	# @param callback [Function] Array&lt;Values&gt;
	#
	getTrend :  (callback, options) =>
		if not callback? or typeof options?.app isnt 'string' or typeof options?.corridor isnt 'string'
			throw 'invalid params'
		@connector.getTrend(callback, false, options)

	#
	# Fetch the CallTree from the connector
	# 
	# @param callback [Function] [CallTree]
	#
	getCalls :  (callback) =>
		if not callback?
			throw 'invalid params'
		@connector.getCalls(callback, false)


	



module.exports = new Api()