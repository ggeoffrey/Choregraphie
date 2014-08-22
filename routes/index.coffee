router = require('express').Router()
ConfigManager = require '../modules/ConfigManager'
# GET home page.


router.get '/', (req, res)->

	ConfigManager.getConfig (config)->
	
		params = 
			title: 'Express'
			config: config

		if req.query.tests is 'true'
			params = 
				title: 'Tests'
				tests: true

		res.render 'index', params


module.exports = router;
