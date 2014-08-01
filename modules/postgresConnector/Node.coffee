class Node
	constructor: (@name, @type, value) ->
		@value = parseInt(value, 10) or 0
	
	add : (value) -> @value += parseInt(value, 10) or 0

module.exports = Node