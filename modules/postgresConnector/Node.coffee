# @nodoc
class Connector

# A node can be anything ( An application, a method, a service, etc... )
#
class Connector.Node
	# @param name [String] Node's name
	# @param type [String] Node's type
	# @param value [Number] Node's size
	constructor: (@name, @type, value) ->
		@value = parseInt(value, 10) or 0
	
	# Add value to a node to make it bigger
	# @param value [Number]
	add : (value) -> @value += parseInt(value, 10) or 0

module.exports = Connector.Node