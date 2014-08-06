router = require('express').Router()

# GET home page.


router.get '/', (req, res)->

	params = 
		title: 'Express'

	if req.query.tests is 'true'
		params = 
			title: 'Tests'
			tests: true

	res.render 'index', params


module.exports = router;