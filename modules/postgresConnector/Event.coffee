class Event
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


module.exports = Event