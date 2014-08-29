# @nodoc
class Connector


#
# A link between two nodes
#
class Connector.Link

	@source : ''
	@target : ''
	@value : 0
	@date : null

	# @param call [Object] A raw call coming from the database.
	constructor : (call)->
		@source = call.caller
		@target = call.called
		@value = call.value or 0
		@date = call.starttime

	# Add a value to a link to make it bigger
	# @param value [Number]
	add : (value) -> @value += parseInt(value, 10) or 0


module.exports = Connector.Link