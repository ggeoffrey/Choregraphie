var SocketManager = (function () {
    function SocketManager(io, api) {
        this.io = io;
        this.api = api;

        this.listenToSockets();
    }
    SocketManager.prototype.listenToSockets = function () {
        var _this = this;
        this.io.on('connection', function (socket) {
            socket.on('getApplications', function (data, callback) {
                _this.api.getApplications(callback);
            });
            socket.on('getCoridors', function (data, callback) {
                _this.api.getCoridors(callback);
            });
            socket.on('getEvents', function (data, callback) {
                _this.api.getEvents(callback);
            });
            socket.on('getOverviewData', function (data, callback) {
                _this.api.getOverviewData(callback);
            });
        });
    };
    return SocketManager;
})();

module.exports = SocketManager;
