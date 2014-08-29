router = require('express').Router()
jade = require 'jade'
fs = require 'fs'







#  GET an angular template by name
#   
#  @param [String] templateName  name of the file containing the template
#
serveTemplate = (req, res)->
	file = "./views/angularTemplates/#{req.params.templateName}.jade"
	fs.exists file, (exists)->
		if exists
			res.render "angularTemplates/#{req.params.templateName}", {}


router.get '/:templateName', serveTemplate
module.exports = router
