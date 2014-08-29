# @nodoc
class Connector



#
# Database configuration for the current Connector module
#
#
class Connector.Config

	
	# @property host [String] Server hostname
	#
	# @property user [String] Database login user
	#
	# @property pass [String] Database login password
	#
	# @property databaseName [String] Database name
	constructor : ->

		@host = 'localhost'
		@user = 'ccol'
		@pass = 'ccol'
		@databaseName = 'ccol'








module.exports = new Connector.Config()