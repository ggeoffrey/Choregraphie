var Api = (function () {
    function Api(connector) {
        this.connector = connector;
    }
    Api.prototype.getApplications = function (callback) {
        this.connector.getApplications(callback);
    };

    Api.prototype.getCoridors = function (callback) {
        this.connector.getCoridors(callback);
    };

    Api.prototype.getEvents = function (callback) {
        this.connector.getEvents(callback);
    };
    Api.prototype.getOverviewData = function (callback) {
        this.connector.getOverviewData(callback);
    };
    return Api;
})();
exports.Api = Api;

module.exports = function (connector) {
    var api = new Api(connector);
    return api;
};
