pg = require 'pg'
async = require 'async'

Call = require './Call'
Node = require './Node'
Link = require './Link'
Event = require './Event'

appConfig = require '../../config'


#
# Connect to a PostgreSQL database according to the local config file.
#
class Connector

	# Build from the config params
	@connectionString : null

	# A local cache to improve perfs
	@cache : {}

	# Read config, connect to Postgre and ensure the cache is flushed at least every 10 minutes
	# @param config [Object] config given by index.coffee
	# @return a PostgresConnector static object
	@init : ( config ) ->

		
		
		if not Connector.connectionString?
			@connectionString = "postgres://#{config.user}"
			
			if config.pass?
				@connectionString += ":#{config.pass}"

			@connectionString += "@#{config.host}/#{config.databaseName}"

			# Empty cache every 10 minutes
			setInterval ->
					cache = {}
				, 600
		
		return @PostgresConnector


	# Get a client from the connections pool
	# @param callback [Function] callback called with **[client, doneCallback]**. Call the doneCallback to release the connexion to the pool.
	@getClient : (callback)->
		
		pg.connect Connector.connectionString, (err, client, done)->
			if err?
				console.warn(err)
			else
				callback(client, done)


	#
	# Hold all the methods used to communicate with database.
	#
	# These methods are, except a few of them, the same as API methods
	class @PostgresConnector

		# Get applications from database
		# @param forceUpdate [Boolean] ignore cache and update it
		@getApplications : (callback, forceUpdate) ->

			# Read from config if data are limited to it
			if appConfig.limitDataToConfigSpecifiedList is true
				callback(appConfig.apps or [])
			else
				# read from database if config allows it
				queryText = "
					SELECT DISTINCT codeapp
					FROM ccol.appli
					ORDER BY codeapp;
				"

				if not Connector.cache.applications? or forceUpdate is on
					Connector.getClient (client, done)->
						query = client.query queryText
						result = []

						query.on 'row', (row)-> result.push row.codeapp

						query.on 'end', ->
							callback(result)
							done()
							Connector.cache.applications = result

						query.on 'error', (err) -> console.log(err)
				else
					callback(Connector.cache.applications)

		# Get an array of corridors name from database
		# @param forceUpdate [Boolean] ignore cache and update it
		@getCorridors : (callback, forceUpdate)->

			# Read from config if data are limited to it
			if appConfig.limitDataToConfigSpecifiedList is true
				callback(appConfig.corridors or [])
			else
				# read from database if config allows it
				queryText = "
					SELECT DISTINCT couloir
					FROM ccol.appli
					ORDER BY couloir
					;
				"

				if not Connector.cache.corridors? or forceUpdate is on
					Connector.getClient (client, done)->
						query = client.query queryText
						result = []

						query.on 'row', (row)-> result.push row.couloir

						query.on 'end', ->
							callback(result)
							done()
							Connector.cache.corridors = result

						query.on 'error', (err) -> console.log(err)

				else
					callback(Connector.cache.corridors)

		# Get an Array of Events from db
		# @param forceUpdate [Boolean] ignore cache and update it
		@getEvents : (callback, forceUpdate)->
			queryText = "
				SELECT codeapp, couloir, codetype, start_time, seen, deleted, old_value, value, diff_stddev, type, id
				FROM ccol.metric_events
				GROUP BY start_time, codeapp, couloir, type, codetype, seen, deleted, old_value, value, diff_stddev, type, id
				ORDER BY start_time DESC;
			"
			if not Connector.cache.events? or forceUpdate is on
				Connector.getClient (client, done)->
					query = client.query queryText
					result = []

					query.on 'row', (row)-> result.push new Event(row)

					query.on 'end', ->
						callback(result)
						done()
						Connector.cache.events = result

					query.on 'error', (err) -> console.log(err)

			else
				callback(Connector.cache.events)
		

		# UPDATE an event in database, tracking by event.id
		#
		# Only event.seen and event.deleted are UPDATEed
		# @param event [Object] Event to persist
		@setEvent : (callback, event) ->

			queryText = "
				UPDATE ccol.metric_events
				SET seen = $1, deleted = $2
				WHERE id = $3
				;
			"

			
			Connector.getClient (client, done)->
				query = client.query queryText, [event.seen, event.deleted, event.id]		
		
				query.on 'end', (result)->
					
					callback(result.rowCount > 0)				
					delete Connector.cache.events
					done()
		
				query.on 'error', (err)->
					throw err
			
		# Get an OverviewData Object from database
		# @param forceUpdate [Boolean] ignore cache and update it
		@getOverviewData : (callback, forceUpdate)->
			queryText = "
				SELECT mv.codeapp, mv.couloir, mv.codetype, mv.start_time, SUM(mv.value) AS value, ms.sante
				FROM metric_value mv,  metric_stats ms
				WHERE mv.couloir LIKE 'X_%'
				AND mv.couloir = ms.couloir
				AND mv.codeapp = ms.codeapp
				AND mv.start_time >= (
					 SELECT max(start_time) as start_time from metric_stats 
				)
				AND mv.start_time::date = ms.start_time::date
				GROUP by mv.couloir, mv.codeapp, mv.codetype, mv.start_time, ms.sante
				;
			"

			if Connector.cache.overviewData? and not forceUpdate?
				callback(Connector.cache.overviewData)
			else
				Connector.getClient (client, done)->
					query = client.query(queryText)
					result = []

					query.on 'row', (row)-> result.push(row)
					query.on 'error', (err)-> console.warn(err)
					query.on 'end', ->
						groupByApplication(result)
						done()

				computeAbsMax = (array)->
					max = -Infinity
					absVal = 0

					for item in array
						absVal = Math.abs(item)
						if absVal > max
							max = absVal 

					return max

				groupByApplication = (data)->
					mapper = {}
					listResult = []
					types = {}

					if data.length > 0
						for item in data
							types[item.codetype] = item.codetype

							if not mapper[item.codeapp]?
								mapper[item.codeapp] = item
								item.detailSante = []
								item.types = {}

							if not mapper[item.codeapp].types[item.codetype]?
								typeStat = 
									value : 0
									detailSante : []
									resSante : null

								mapper[item.codeapp].types[item.codetype] = typeStat

							mapper[item.codeapp].types[item.codetype].value += parseInt(item.value, 10)
							mapper[item.codeapp].types[item.codetype].detailSante.push(item.sante)
							mapper[item.codeapp].detailSante.push(item.sante)


						for codeapp, item of mapper
							absMax = null
							
							for codetype, stats of item.types
								
								mapper[codeapp].types[codetype].resSante = computeAbsMax(stats.detailSante)
								delete mapper[codeapp].types[codetype].detailSante
							
							for codetype, v of types
								if mapper[codeapp].types? and not mapper[codeapp].types[codetype]?
									mapper[codeapp].types[codetype] = 
										value: 0
										detailSante: []
										resSante: null

							mapper[codeapp].resSante = computeAbsMax(item.detailSante)
							delete mapper[codeapp].detailSante
							
							listResult.push(mapper[codeapp])

						callback(listResult)
						Connector.cache.overviewData = listResult
					

		# Get an array of Values
		# @param forceUpdate [Boolean] ignore cache and update it
		# @param options [Object]
		# @option app [String] app's name
		# @option corridor [String] corridor's name
		@getHistory : (callback, forceUpdate, options)->

			if options.app is 'all' and options.corridor is 'all'
				options.app = '%'
				options.corridor = '%'

			if not options.limit?
				options.limit = null

			queryTextRecords =  " 
					SELECT codeapp, couloir, start_time as startTime, code, codetype, value
					FROM ccol.metric_value
					WHERE code <> 'INCONNUE' 
					AND codetype NOT LIKE 'nb_appelFI' 
					AND codeapp LIKE $1 
					AND couloir LIKE $2 
					ORDER BY startTime ASC
					LIMIT $3
					;
				"

			getRecords = (next)->
				Connector.getClient (client, done)->
					query = client.query(queryTextRecords, [options.app, options.corridor, options.limit])
					result = []

					query.on 'row', (row)-> result.push(row)
					query.on 'error', (error)-> console.warn(error)
					query.on 'end', ->
						next(null, result)
						done()

			queryTextCalls = "
				SELECT codeapp, couloir, start_time as startTime, code, codetype, value
				FROM ccol.metric_value
				WHERE code <> 'INCONNUE'
				AND codetype LIKE 'nb_transaction_http'
				AND codeapp LIKE $1
				AND couloir LIKE $2
				ORDER BY startTime ASC
				LIMIT $3
				;
			"

			getCalls = (next)->
				Connector.getClient (client, done)->
					query = client.query(queryTextCalls, [options.app, options.corridor, options.limit])
					result = []

					query.on 'row', (row) -> result.push(row)
					query.on 'error', (error)-> console.warn(error)
					query.on 'end', ->
						next(null, result)
						done()


			async.parallel
					reports: getRecords
					calls: getCalls
				, (err, result)->

					callsMapper = {}
					{reports, calls} = result

					for call in calls
						index = call.starttime

						if callsMapper[index]?
							callsMapper[index] += call.value
						else
							callsMapper[index] = call.value

					for report in reports
						index = report.starttime

						if callsMapper[index]?
							report.http = callsMapper[index]

					callback(reports)


		# Get an array of Values
		# @param forceUpdate [Boolean] ignore cache and update it
		# @param options [Object]
		# @option app [String] app's name
		# @option corridor [String] corridor's name
		@getTrend : (callback, forceUpdate, options)->

			queryText = " 
				SELECT codetype, start_time as starttime, somme, average, stddev, sante
				FROM ccol.metric_stats 
				WHERE codeapp = $1 
				AND couloir = $2
				;
			"

			Connector.getClient (client, done)->
				query = client.query(queryText, [options.app, options.corridor])
				result = []

				query.on 'row', (row) -> result.push(row)
				query.on 'error', (error)-> console.warn(error)
				query.on 'end', ->
					next(result)
					done()

			next = (result)->
				mapper = {}

				for record in result
					key = record.codetype

					formatedRecord =
						somme: record.somme
						average: record.average
						stddev: record.stddev
						starttime: record.starttime

					if not mapper[key]?
						mapper[key] = []

					mapper[key].push(formatedRecord)

				callback(mapper)

		# Get a callTree
		# @param forceUpdate [Boolean] ignore cache and update it	
		@getCalls : (callback, forceUpdate)->
			queryText = "
				SELECT codeapp, code, couloir, sum(value) as value, codetype, extract(epoch FROM date_trunc('day',  start_time))*1000::bigint as starttime
				FROM metric_value
				WHERE codetype LIKE 'nb_appelFI%'
				AND code LIKE '0%'
				GROUP BY codeapp, starttime,  code, couloir, codetype
				ORDER BY starttime
				;
			"

			if Connector.cache.calls? and not forceUpdate?
				callback(Connector.cache.calls)
			else
				Connector.getClient (client, done)->
					query = client.query(queryText)
					result = []

					query.on 'row', (row) -> result.push(row)
					query.on 'error', (error)-> console.warn(error)
					query.on 'end', ->
						next(result)
						done()

			next = (data)->
				calls = []

				for row in data

					{codeapp, codetype, code, couloir, value, starttime} = row
					call = new Call(codeapp, codetype, code, couloir, value, starttime)
					calls.push(call)

				createCallTree(calls)

			createCallTree = (calls)->
				nodes = {}
				links = {}

				for call in calls

					# Caller node
					leafName = call.caller
					if not nodes[leafName]?
						nodes[leafName] = new Node(leafName, 'Application')

					# Called node
					leafName = call.called
					if not nodes[leafName]?
						nodes[leafName] = new Node(leafName, 'Application')

					# Service (of the called node)
					service = call.service					
					if not nodes[service]?
						nodes[service] = new Node(service, 'Service')


					# Method (of the called node)
					method = "#{call.service}::#{call.method}"
					if not nodes[method]?
						nodes[method] = new Node(method, 'Method', 0)
					else
						nodes[method].add(call.value)



					# Now we have nodes, we need to build the links

					# First : app -> other app
					key = "#{call.caller}:#{call.called}:#{call.starttime}"

					if not links[key]?
						links[key] = new Link(call)
					else
						links[key].add(call.value)


					# Next :  app->services

					key = "#{call.service}:#{call.starttime}"
					if not links[key]?
						links[key] = new Link(call)
						links[key].target = call.service
					else
						links[key].add(call.value)

					# Next : service->method

					key = "#{call.service}:#{method}:#{call.starttime}"

					if not links[key]?
						links[key] = new Link(call)
						links[key].source = call.service
						links[key].target = method
					else
						links[key].add(call.value)

				# convert links from object to array
				linksArray = []
				for key, link of links
					linksArray.push(link)
					delete links[key] # will help the GC

				# we put all in a single object

				mapper =
					nodes: nodes
					links: linksArray

				callback(mapper)
				Connector.cache.calls = mapper


module.exports = Connector.init