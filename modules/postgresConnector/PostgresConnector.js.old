var pg = require('pg');
var async = require('async');

var Call = require('./Call');
var Node = require('./Node');
var Link = require('./Link');

var connectionString;

var init = function( config ){
    if(!connectionString){
        connectionString = "postgres://" + config.user;
        if (config.pass) {
            connectionString += ':' + config.pass;
        }
        connectionString += "@" + config.host + "/" + config.databaseName;
    }
    
    return pgConnector;
};

var getClient = function(callback ){
    
    pg.connect(connectionString, function (err, client, done) {
        if (err) {
            console.warn(err);
        } else {
            callback(client);
        }
    });
};

// Cache
var cache = {};

//------------


var pgConnector = {};


    pgConnector.getApplications = function (callback, forceUpdate) {
        var queryText = "SELECT distinct codeapp " + "FROM ccol.appli " + "ORDER BY codeapp";

        
        if(!cache.applications || forceUpdate){
            getClient(function (client) {
                var query = client.query(queryText);

                var result = [];

                query.on('row', function (row) {
                    result.push(row.codeapp);
                });

                query.on('end', function () {
                    callback(result);
                    client.end();
                    cache.applications = result;
                });

                query.on('error', function (err) {
                    console.warn(err);
                });
            });            
        }
        else{
            callback(cache.applications);
        }
    };

    pgConnector.getCorridors = function (callback, forceUpdate) {
        var queryText = "SELECT distinct couloir " + "FROM ccol.appli " + "ORDER BY couloir";

        if(!cache.corridors || forceUpdate){
            getClient(function (client) {
                var query = client.query(queryText);

                var result = [];

                query.on('row', function (row) {
                    result.push(row.couloir);
                });

                query.on('end', function () {
                    callback(result);
                    client.end();
                    cache.corridors = result;
                });

                query.on('error', function (err) {
                    console.warn(err);
                });
            });
        }
        else{

            callback(cache.corridors);
        }
    };

    pgConnector.getEvents = function (callback, forceUpdate) {
        var queryText = "SELECT * " + "FROM ccol.metric_events " + "ORDER BY start_time DESC";
        
       

        if(cache.events && !forceUpdate){
            
            callback(cache.events);
        }
        else{
            getClient(function (client) {
                var query = client.query(queryText);

                var result = [];

                query.on('row', function (row) {
                    result.push(row);
                });

                query.on('end', function () {
                    callback(result);
                    client.end();
                    cache.events = result;
                });

                query.on('error', function (err) {
                    console.warn(err);
                });
            });
        }
    };

    pgConnector.setEvent = function (callback, event) {
        var queryText = " UPDATE ccol.metric_events"+
                        " SET seen = $1, deleted = $2"+
                        " WHERE id = $3;";

        getClient(function (client) {
                var query = client.query(queryText, [event.seen, event.deleted, event.id], function(err, result){
                    if(err){
                        console.log(err);
                        callback(false);
                    }
                    else{
                        callback(true);
                    }
                });

                query.on('end', function () {
                    delete cache.events;
                    client.end();
                });
        });
    };

    pgConnector.getOverviewData = function (callback, forceUpdate) {
        var queryText = "" + " SELECT mv.codeapp, mv.couloir, mv.codetype, mv.start_time, SUM(mv.value) AS value, ms.sante" + " FROM metric_value mv,  metric_stats ms" + " WHERE mv.couloir LIKE 'X_%'" + " AND mv.couloir = ms.couloir" + " AND mv.codeapp = ms.codeapp" + " AND mv.start_time >= ( SELECT max(start_time) as start_time from metric_stats )" + " AND mv.start_time::date = ms.start_time::date" + " GROUP by mv.couloir, mv.codeapp, mv.codetype, mv.start_time, ms.sante;";

        if(cache.overviewData && !forceUpdate){
            callback(cache.overviewData);
        }
        else{
            getClient(function (client) {
                var query = client.query(queryText);

                var result = [];

                query.on('row', function (row) {
                    result.push(row);
                });

                query.on('end', function () {
                    groupByApplication(result);
                    client.end();
                    
                });

                query.on('error', function (err) {
                    console.warn(err);
                });
            });


            var computeAbsMax = function (array) {
                var max = -Infinity;
                var absVal = 0;

                var length = array.length;
                while (length--) {
                    absVal = Math.abs(array[length]);
                    if (absVal > max)
                        max = absVal;
                }

                return max;
            };

            var groupByApplication =  function (data) {
                var mapper = {};
                var listResult = [];
                var types = {};

                if (data.length) {
                    var length = data.length;
                    var item;
                    while (length--) {
                        item = data[length];

                        types[item.codetype] = item.codetype;

                        if (!mapper[item.codeapp]) {
                            mapper[item.codeapp] = item;
                            item.detailSante = [];
                            item.types = {};
                        }

                        if (!mapper[item.codeapp].types[item.codetype]) {
                            var typeStat = {
                                value: 0,
                                detailSante: [],
                                resSante: null
                            };

                            mapper[item.codeapp].types[item.codetype] = typeStat;
                        }

                        mapper[item.codeapp].types[item.codetype].value += parseInt(item.value);
                        mapper[item.codeapp].types[item.codetype].detailSante.push(item.sante);
                        mapper[item.codeapp].detailSante.push(item.sante);
                    }

                    for (var codeapp in mapper) {
                        item = mapper[codeapp];
                        var absMax = null;
                        var codetype;
                        for (codetype in item.types) {
                            var stats = item.types[codetype];
                            mapper[codeapp].types[codetype].resSante = computeAbsMax(stats.detailSante);
                            delete mapper[codeapp].types[codetype].detailSante;
                        }

                        for (codetype in types) {
                            if (mapper[codeapp].types && !mapper[codeapp].types[codetype]) {
                                mapper[codeapp].types[codetype] = {
                                    'value': 0,
                                    'detailSante': [],
                                    'resSante': null
                                };
                            }
                        }
                        mapper[codeapp].resSante = computeAbsMax(item.detailSante);
                        delete mapper[codeapp].detailSante;

                        listResult.push(mapper[codeapp]);
                    }
                    callback(listResult);
                    cache.overviewData = listResult;
                }
            };
        }// else
    };


    pgConnector.getHistory = function(callback, forceUpdate, options){

        var queryTextRecords =  " SELECT codeapp, couloir, start_time as startTime, code, codetype, value"+
                         " FROM ccol.metric_value"+
                         " WHERE code <> 'INCONNUE' "+
                         " AND codetype NOT LIKE 'nb_appelFI' "+
                         " AND codeapp = $1 "+
                         " AND couloir = $2 "+
                         " ORDER BY startTime ASC;";

        
        var getRecords = function (next){
            getClient(function (client) {
                var query = client.query(queryTextRecords, [options.app, options.corridor]);

                var result = [];

                query.on('row', function (row) {
                    result.push(row);
                });

                query.on('end', function () {
                    next(null, result);
                    client.end();
                });

                query.on('error', function (err) {
                    console.warn(err);
                });
            });
        };


        var queryTextCalls = " SELECT codeapp, couloir, start_time as startTime, code, codetype, value"+
                         " FROM ccol.metric_value "+
                         " WHERE code <> 'INCONNUE' "+
                         " AND codetype LIKE 'nb_transaction_http' " +
                         " AND codeapp = $1 "+
                         " AND couloir = $2 "+
                         " ORDER BY startTime ASC; ";

        
        var getCalls = function(next){
            getClient(function (client) {
                var query = client.query(queryTextCalls, [options.app, options.corridor]);

                var result = [];

                query.on('row', function (row) {
                    result.push(row);
                });

                query.on('end', function () {                    
                    next(null, result);
                    client.end();
                });

                query.on('error', function (err) {
                    console.warn(err);
                });
            });
        };

        async.parallel({
            reports: getRecords,
            calls: getCalls
        }, function(err, result){

            var callsMapper = {};

            var reports = result.reports;
            var calls = result.calls;

            var length = calls.length;
            var call, index;
            
            while(length--){
                call = calls[length];

                index = call.starttime;


                if(callsMapper[index]){
                    callsMapper[index] += call.value;
                }
                else{
                    callsMapper[index] = call.value;
                }
            }

            length = reports.length;
            var report;
            while(length--){
                report = reports[length];
                index = report.starttime;

                if(callsMapper[index]){
                    report.http = callsMapper[index];
                }
            }

            
            callback(reports);

        });

    };

    pgConnector.getTrend = function(callback, forceUpdate, options){
        var queryText = " SELECT codetype, start_time as starttime, somme, average, stddev, sante "+
                        " FROM ccol.metric_stats "+
                        " WHERE codeapp = $1 "+
                        " AND couloir = $2;";

        getClient(function (client) {
            var query = client.query(queryText, [options.app, options.corridor]);

            var result = [];

            query.on('row', function (row) {
                result.push(row);
            });

            query.on('end', function () {
                next(result);
                client.end();
            });

            query.on('error', function (err) {
                console.warn(err);
            });
        });


        var next = function(result){

            var mapper = {};
            
            var length = result.length;
            var record;
            while(length--){
                record = result[length];

                var key = record.codetype;

                var formatedRecord = {
                    somme: record.somme,
                    average: record.average,
                    stddev: record.stddev,
                    starttime: record.starttime
                };

                
                if(!mapper[key]){
                    mapper[key] = [];
                }

                mapper[key].push(formatedRecord);
            }

            callback(mapper);            
        };
    };



    pgConnector.getCalls = function  (callback, forceUpdate) {
        var queryText = ""+
            " SELECT codeapp, code, couloir, sum(value) as value, codetype, extract(epoch FROM date_trunc('day',  start_time))*1000::bigint as starttime"+
            " FROM metric_value"+
            " WHERE codetype LIKE 'nb_appelFI%'"+
            " AND code LIKE '0%'"+
            " GROUP BY codeapp, starttime,  code, couloir, codetype"+
            " ORDER BY starttime;";

        var next = function (data) {
            var calls = [];
            var row, call;            
            for (var i = data.length - 1; i >= 0; i--) {
                row = data[i];

                
                call = new Call(row.codeapp, row.codetype, row.code, row.couloir, row.value, row.starttime);
                calls.push(call);
            }

            createCallTree(calls);
        };



        if( cache.calls && ! forceUpdate){
            callback(cache.calls);
        }
        else{

            getClient(function (client) {
                var query = client.query(queryText);

                var result = [];

                query.on('row', function (row) {
                    result.push(row);
                });

                query.on('end', function () {
                    next(result);
                    client.end();
                });

                query.on('error', function (err) {
                    console.warn(err);
                });
            });
        }


        

        var createCallTree = function (calls) {
            var  nodes, links;
            nodes = {};
            links = {};

            var call;
            for (var i = calls.length - 1; i >= 0; i--) {
                call = calls[i];

                // Caller node
                
                var leafName = call.caller;
                if(!nodes[leafName]){
                    nodes[leafName] = new Node(leafName, 'Application');
                }

                // Called node
                leafName = call.called;
                if(!nodes[leafName]){
                    nodes[leafName] = new Node(leafName, 'Application');
                }

                // Service (of the called node)
                var service = call.service;
                
                if(!nodes[service]){
                    nodes[service] = new Node(service, 'Service');
                }

                // Method (of the called node)

                var method = call.service+'::'+call.method;
                if (!nodes[method]) {
                    nodes[method] = new Node(method, 'Method', 0);
                }else{
                    nodes[method].add(call.value);
                }

                // Now we have nodes, we need to build the links;

                // First app -> other app
                var key = call.caller+':'+call.called+':'+call.starttime;

                if(!links[key]){
                    links[key] = new Link(call);
                }
                else{
                    links[key].add(call.value);
                }


                // Next app->services

                key = call.service+':'+call.starttime;

                if(!links[key]){
                    links[key] = new Link(call);
                    links[key].target = call.service;
                }
                else{
                    links[key].add(call.value);
                }


                // Next service->method

                key = call.service+':'+ method +':'+ call.starttime;

                if(!links[key]){
                    links[key] = new Link(call);
                    links[key].source = call.service;
                    links[key].target = method;
                }
                else{
                    links[key].add(call.value);
                }
            }// end for

            // convert links from object to array

            var linksArray = [];
            for(var tempKey in links){

                linksArray.push(links[tempKey]);
                delete links[tempKey]; // will help the GC
            }

            // we put all in a single object

            var mapper = {
                nodes: nodes,
                links: linksArray
            };

            callback(mapper);
            cache.calls = mapper;


        }; // end createCallTree

    };

module.exports = init;
