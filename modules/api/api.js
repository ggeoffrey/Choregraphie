var connector = require('../postgresConnector');


var exports = {};

    exports.getApplications = function (callback) {
        connector.getApplications(callback);
    };
    exports.getCorridors = function (callback) {
        connector.getCorridors(callback);
    };
    exports.getEvents = function (callback) {
        connector.getEvents(callback);
    };

    exports.setEvent = function(callback, event){
        connector.setEvent(callback, event);
    };

    exports.getOverviewData = function (callback) {
        connector.getOverviewData(callback);
    };

    exports.getHistory = function (callback, options) {
        console.log('getHistory');
        connector.getHistory(callback, false, options);
    };

    exports.getTrend = function (callback, options) {
        connector.getTrend(callback, false, options);
    };

    exports.getCalls = function (callback) {
        connector.getCalls(callback, false);
    };


module.exports = exports;
