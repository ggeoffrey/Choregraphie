class Application
	@name = null
	@type = null

	constructor : (name, type) ->
		if checkName(name) and checkType(type)
			@name = name.toUpperCase()
			@type = type
		else
			throw 'bad arguments'

	checkName = (name) -> name? and typeof name is 'string' and name.length is 4

	checkType = (type) -> type in ['config', 'db']


module.exports = Application