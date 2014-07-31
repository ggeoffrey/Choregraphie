var lzString = require('lz-string');

var io; // io instance initilized in app.js
var api = require('../api');


var init = function(socketIOInstance){
    if(!io){
        io = socketIOInstance;
        
    }
    return SocketManager;
};

var compress = function( object ){
     var json = JSON.stringify(object);
     return lzString.compressToBase64(json);
};
/*var inflate = function( string, callback ){
    var compressor = zlib.createInflate();
    var clear = new Buffer(string, 'base64');
    var buffer = new Buffer(clear);
    compressor.write(buffer);
    compressor.end();

    var output = new Buffer(0);

    compressor.on('data', function(data){
        output = Buffer.concat([output, data]);
    });

    compressor.on('end', function(err){
        var json = output.toString();
        var obj = JSON.parse(json);
        callback(obj);
    }); 
};
*/
var SocketManager = {};

    SocketManager.listenToSockets = function () {
        
        io.on('connection', function (socket) {
            socket.on('getApplications', function (data, callback) {
                api.getApplications(function(data){
                    callback(compress(data));
                });
            });
            socket.on('getCorridors', function (data, callback) {
                api.getCorridors(function(data){
                    callback(compress(data));
                });
            });
            socket.on('getOverviewData', function (data, callback) {
                api.getOverviewData(function(data){
                    callback(compress(data));
                });
            });

            socket.on('getHistory', function (data, callback) {
                api.getHistory(function(data){
                    callback(compress(data));
                }, data);
            });

            socket.on('getTrend', function (data, callback) {
                api.getTrend(function(data){
                    callback(compress(data));
                }, data);
            });

            socket.on('getEvents', function (data, callback) {
                api.getEvents(function(data){
                    callback(compress(data));
                });
            });

            socket.on('setEvents', function (event) {

                var next = function (result) {
                    if(result){
                        socket.broadcast.emit('eventChanged', event);
                        socket.emit('eventChanged', event);
                    }
                };
                api.setEvent(next, event);
            });

            socket.on('getCalls', function (data, callback) {
                api.getCalls(function(calls){
                    callback(compress(calls));
                });
            });
        });
    };



module.exports = init;
