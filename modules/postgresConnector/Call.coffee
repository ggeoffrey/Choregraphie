class Call
	constructor : (app, codetype, hashtagSeparatedString, corridor, value, starttime)->
		if app is 'SFIS'
			@caller = codetype.replace('nb_appelFI_', '')
		else
			@caller = app

		[ignoreThisValue, @called, @service, @method, @version] = hashtagSeparatedString.split '#'

		@corridor = corridor
		@value = parseInt(value, 10)
		@starttime = starttime



module.exports = Call;