connector = require '../postgresConnector'


class exports

    @getApplications :  (callback) ->
        if not callback?
            throw 'bad arguments'
        connector.getApplications(callback)
    
    @getCorridors :  (callback) ->
        if not callback?
            throw 'bad arguments'
        connector.getCorridors(callback)
    
    @getEvents :  (callback) ->
        if not callback?
            throw 'bad arguments'
        connector.getEvents(callback)

    @setEvent : (callback, event)->
        if not callback? or typeof event.seen isnt 'boolean' or typeof event.deleted isnt 'boolean'
            throw 'bad arguments'
        connector.setEvent(callback, event)

    @getOverviewData :  (callback) ->
        if not callback?
            throw 'bad arguments'
        connector.getOverviewData(callback)
    

    @getHistory :  (callback, options) ->
        if not callback? or typeof options.app isnt 'string' or typeof options.corridor isnt 'string'
            throw 'bad arguments'
        connector.getHistory(callback, false, options)
    

    @getTrend :  (callback, options) ->
        if not callback? or typeof options.app isnt 'string' or typeof options.corridor isnt 'string'
            throw 'invalid params'
        connector.getTrend(callback, false, options)

    @getCalls :  (callback) ->
        if not callback?
            throw 'invalid params'
        connector.getCalls(callback, false)

    


module.exports = exports
