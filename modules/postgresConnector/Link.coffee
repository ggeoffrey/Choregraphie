class Link
	constructor : (call)->
		@source = call.caller
		@target = call.called
		@value = call.value or 0
		@date = call.starttime

	add : (value) -> @value += parseInt(value, 10) or 0


module.exports = Link