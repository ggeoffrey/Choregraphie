# @nodoc
class Connector


#
# Real object for manipulating Events
# ** SHOULD ** be translated
class Connector.Event
	# 
	# Extract usefull informations from an Event
	# @param rawEvent [object] And object comming from the database
	#
	constructor: (rawEvent) ->
		{
			@id,
			@codeapp,
			@couloir,
			@codetype,
			@start_time,
			@seen,
			@deleted,
			@old_value,
			@value,
			@diff_stddev,
			@type
		} = rawEvent


module.exports = Connector.Event