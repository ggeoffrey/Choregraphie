router = require('express').Router()
path = require 'path'
fs = require 'fs'
_ = require 'underscore'

# GET home page.


router.get '/', (req, res)->

	getConfig (config)->

		console.log config
	
		params = 
			title: 'Express'
			config: config

		if req.query.tests is 'true'
			params = 
				title: 'Tests'
				tests: true

		res.render 'index', params


module.exports = router;








# Tools

lastEdited = 0
getConfig = (callback)->

	configPath = path.normalize __dirname+'/../config.coffee'
	actualConfig = require '../config'
	fs.stat configPath, (err, stat)->
		if err or not stat.mtime
			callback actualConfig
		else if lastEdited < stat.mtime?.getTime()
			lastEdited = stat.mtime.getTime()
			delete require.cache[configPath]

			callback require '../config'
		else
			callback actualConfig
