
var io; // io instance initilized in app.js
var api = require('../api');


var init = function(socketIOInstance){
    if(!io){
        io = socketIOInstance;
    }
    return SocketManager;
};

var SocketManager = {};

    SocketManager.listenToSockets = function () {
        
        io.on('connection', function (socket) {
            socket.on('getApplications', function (data, callback) {
                api.getApplications(callback);
            });
            socket.on('getCorridors', function (data, callback) {
                api.getCorridors(callback);
            });
            socket.on('getOverviewData', function (data, callback) {
                api.getOverviewData(callback);
            });

            socket.on('getHistory', function (data, callback) {
                api.getHistory(callback, data);
            });

            socket.on('getTrend', function (data, callback) {
                api.getTrend(callback, data);
            });

            socket.on('getEvents', function (data, callback) {
                api.getEvents(callback);
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
                api.getCalls(callback);
            });
        });
    };



module.exports = init;
