var express = require('express');
var router = express.Router();

var api = require('../api');


router.get('/applications', function (req, res) {
    api.getApplications(function(apps){
    	res.send(apps);
    	res.end();
    });
});

router.get('/corridors', function (req, res) {
    api.getCorridors(function(c){
    	res.send(c);
    	res.end();
    });
});

router.get('/overviewData', function (req, res) {
    api.getOverviewData(function(data){
    	res.send(data);
    	res.end();
    });
});

router.get('/events', function (req, res) {
    api.getOverviewData(function(events){
    	res.send(events);
    	res.end();
    });
});

router.get('/history/:app/:corridor', function (req, res) {
    
	var params = {
		app : req.params.app,
		corridor : req.params.corridor
	};

    api.getHistory(function(history){
    	res.send(history);
    	res.end();
    }, params );
});

router.get('/trend/:app/:corridor', function (req, res) {
    
	var params = {
		app : req.params.app,
		corridor : req.params.corridor
	};

    api.getTrend(function(trend){
    	res.send(trend);
    	res.end();
    }, params );
});

router.get('/calls', function (req, res) {
    api.getCalls(function(calls){
        res.send(JSON.stringify(calls, null, 2));
        res.end();
    });
});


module.exports = router;
