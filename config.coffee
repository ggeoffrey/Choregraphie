###
	Chorégraphie main configuration

	Are you looking for the database configuration? ->
		you should search in ./modules/<your_database_type>Connector/config.js
###

fs = require 'fs'
restrictedData = JSON.parse fs.readFileSync './restrictedData.json'








module.exports =
	port: 3001    # Be careful ! *HttpServer* will listen on this port but *Express* will still listen on 3000
	websocketsOpts:
		transports : ['polling']
	# If the following boolean is set to true, only the applications/corridors listed bellow will be shown in Chorégraphie
	# It allows you to hide some applications/corridor even if they exist in your database
	
	limitDataToConfigSpecifiedList : no
	apps : restrictedData.apps
	corridors : restrictedData.corridors
