router = require('express').Router()

# GET home page.


router.get '/', (req, res)->

	params = 
		title: 'Express'

	res.render 'index', params


module.exports = router;