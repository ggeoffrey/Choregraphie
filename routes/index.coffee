router = require('express').Router()
ConfigManager = require '../modules/configManager'
# GET home page.


router.get '/', (req, res)->

	ConfigManager.getConfig (config)->
	
		
		params = 
			title: ''
			config: config

		params.tests = on   if req.query.tests is 'true'
		
		res.render 'index', params


module.exports = router;
