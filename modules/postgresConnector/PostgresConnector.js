var pg = require('pg');

var PostgresConnector = (function () {
    function PostgresConnector(config) {
        this.config = config;

        this.connectionString = "postgres://" + config.user;
        if (config.pass) {
            this.connectionString += ':' + config.pass;
        }
        this.connectionString += "@" + config.host + "/" + config.databaseName;
    }
    PostgresConnector.prototype.getClient = function (callback) {
        pg.connect(this.connectionString, function (err, client, done) {
            if (err) {
                console.warn(err);
            } else {
                callback(client);
            }
        });
    };

    PostgresConnector.prototype.getApplications = function (callback) {
        var queryText = "SELECT distinct codeapp " + "FROM ccol.appli " + "ORDER BY codeapp";

        this.getClient(function (client) {
            var query = client.query(queryText);

            var result = [];

            query.on('row', function (row) {
                result.push(row.codeapp);
            });

            query.on('end', function () {
                console.log('end');
                callback(result);
            });

            query.on('error', function (err) {
                console.warn(err);
            });
        });
    };

    PostgresConnector.prototype.getCoridors = function (callback) {
        var queryText = "SELECT distinct couloir " + "FROM ccol.appli " + "ORDER BY couloir";

        this.getClient(function (client) {
            var query = client.query(queryText);

            var result = [];

            query.on('row', function (row) {
                result.push(row.couloir);
            });

            query.on('end', function () {
                console.log('end');
                callback(result);
            });

            query.on('error', function (err) {
                console.warn(err);
            });
        });
    };

    PostgresConnector.prototype.getEvents = function (callback) {
        var queryText = "SELECT * " + "FROM ccol.metric_events " + "ORDER BY start_time DESC";

        this.getClient(function (client) {
            var query = client.query(queryText);

            var result = [];

            query.on('row', function (row) {
                result.push(row);
            });

            query.on('end', function () {
                console.log('end');
                callback(result);
            });

            query.on('error', function (err) {
                console.warn(err);
            });
        });
    };

    PostgresConnector.prototype.getOverviewData = function (callback) {
        var queryText = "" + " SELECT mv.codeapp, mv.couloir, mv.codetype, mv.start_time, SUM(mv.value) AS value, ms.sante" + " FROM metric_value mv,  metric_stats ms" + " WHERE mv.couloir LIKE 'X_%'" + " AND mv.couloir = ms.couloir" + " AND mv.codeapp = ms.codeapp" + " AND mv.start_time >= ( SELECT max(start_time) as start_time from metric_stats )" + " AND mv.start_time::date = ms.start_time::date" + " GROUP by mv.couloir, mv.codeapp, mv.codetype, mv.start_time, ms.sante;";

        this.getClient(function (client) {
            var query = client.query(queryText);

            var result = [];

            query.on('row', function (row) {
                result.push(row);
            });

            query.on('end', function () {
                console.log('end');
                groupByApplication(result);
            });

            query.on('error', function (err) {
                console.warn(err);
            });
        });

        function computeAbsMax(array) {
            var max = -Infinity;
            var absVal = 0;

            var length = array.length;
            while (length--) {
                absVal = Math.abs(array[length]);
                if (absVal > max)
                    max = absVal;
            }

            return max;
        }

        function groupByApplication(data) {
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
                    for (var codetype in item.types) {
                        var stats = item.types[codetype];
                        mapper[codeapp].types[codetype].resSante = computeAbsMax(stats.detailSante);
                        delete mapper[codeapp].types[codetype].detailSante;
                    }

                    for (var codetype in types) {
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
            }
        }
    };
    return PostgresConnector;
})();
exports.PostgresConnector = PostgresConnector;

module.exports = PostgresConnector;
