connector = require '../postgresConnector'


class exports

    @getApplications :  (callback) ->
        connector.getApplications(callback)
    
    @getCorridors :  (callback) ->
        connector.getCorridors(callback)
    
    @getEvents :  (callback) ->
        connector.getEvents(callback)

    @setEvent : (callback, event)->
        connector.setEvent(callback, event)

    @getOverviewData :  (callback) ->
        connector.getOverviewData(callback)
    

    @getHistory :  (callback, options) ->
        connector.getHistory(callback, false, options)
    

    @getTrend :  (callback, options) ->
        connector.getTrend(callback, false, options)

    @getCalls :  (callback) ->
        connector.getCalls(callback, false)

    


module.exports = exports
