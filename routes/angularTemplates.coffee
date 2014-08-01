router = require('express').Router()
jade = require 'jade'
fs = require 'fs'


# GET angular template.


router.get '/:templateName', (req, res) ->

	file = "./views/angularTemplates/#{req.params.templateName}.jade"
	fs.exists file, (exists)->
		if exists
			res.render "angularTemplates/#{req.params.templateName}", {}


module.exports = router;
