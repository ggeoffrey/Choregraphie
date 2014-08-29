# @nodoc
class Connector

#
# A call between 2 apps 
# 
class Connector.Call

    # @param app [String] caller name
    # @param codetype [String] type
    # @param hashtagSeparatedString [String] code coming from database matching this example: **```<calledApp>#<service>#<method>#<version>```**
    # If you want a different pattern, be sure to adapt the Connector.getCalls method
    # @param corridor [String]
    # @param value [Number] how many calls ?
    # @param starttime [Date] 
    constructor : (app, codetype, hashtagSeparatedString, corridor, value, starttime)->
        if app is 'SFIS'
            @caller = codetype.replace('nb_appelFI_', '')
        else
            @caller = app

        [ignoreThisValue, @called, @service, @method, @version] = hashtagSeparatedString.split '#'

        @corridor = corridor
        @value = parseInt(value, 10)
        @starttime = starttime



module.exports = Connector.Call;