
# @nodoc
class Api

#
# @abstract
# Super-Class for Application and Corridor
#
class Api.Entity

	# @property name [String] Entity's name
	@name : null
	# @property type [String] Entity's origin/type   ['db', 'config']
	@type : null

	#
	# Create a new Entity
	# @param name [String] Entity's name
	# @param type [String] Entity's origin/type   ['db', 'config']
	# @throw ['Bas arguments'] if unknown type or if name is not a valid name
	# @note see checkName
	# @note see checkType
	#
	constructor : (name, type) ->
		
		if @checkName(name) and @checkType(type)
			@name = name.toUpperCase()
			@type = type
		else
			throw "bad arguments ['#{name}', '#{type}']"


	
	# Check if the entity's name is a valid name
	# @return [Boolean]
	checkName : (name)-> 
		(name? and typeof name is 'string')
		

	#  Check if the entity's type is a valid type
	# @return [Boolean]
	checkType : (type) -> type in ['config', 'db']

module.exports = Api.Entity