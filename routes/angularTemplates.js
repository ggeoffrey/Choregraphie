var express = require('express');
var router = express.Router();

var jade = require('jade');
var fs = require('fs');


/* GET angular template. */


router.get('/:templateName', function(req, res) {

	var file = './views/angularTemplates/'+req.params.templateName + '.jade';
	fs.exists(file, function(exists){
		
		if (exists) {
			res.render('angularTemplates/'+req.params.templateName,{});
		}
	});  
});



module.exports = router;
