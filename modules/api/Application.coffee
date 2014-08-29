Entity = require './Entity'


# @nodoc
class Api

#
#	Describe an Application recorded in database or in restrictedData.json file
#
class Api.Application extends Entity

	# @overload super
	constructor : (name, type) ->
		super name, type

	# @overload Entity.checkName
	# Check if application's name is valid
	# @param name [string] application's name
	checkName : (name) -> 
		(name? and typeof name is 'string') and (name.length is 4)



module.exports = Api.Application