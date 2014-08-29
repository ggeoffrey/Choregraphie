Entity = require './Entity'

# @nodoc
class Api

#
#	Describe a Corridor recorded in database or in restrictedData.json file
#
class Api.Corridor extends Entity

	# @overload super
	constructor : (name, type) ->
		super name, type

	# @overload Entity.checkName
	# Check if Corridor's name is valid
	# @param name [string] Corridor's name
	checkName : (name) -> 
		(name? and typeof name is 'string') and (name.length is 4 or name.length is 5)



module.exports = Api.Corridor