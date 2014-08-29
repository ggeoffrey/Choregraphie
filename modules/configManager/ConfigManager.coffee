fs = require 'fs'
path = require 'path'


#
#  Manage global configuration.
#
#  Configuration is a set of two files:
#   - config.coffee
#   - restrictedData.json
#  
#  They are both placed at the root of the Chorégraphie project
#
class ConfigManager

	# @property lastEditedConfig [Number] last modification time of the config.coffee file
	@lastEditedConfig : 0
	# @property lastEditedConfigData [Number] last modification time of the restrictedData.json file
	@lastEditedConfigData : 0

	# Path to the config.coffee file
	@configPath : '../../config'

	#
	# Path to the restrictedData.json file
	@dataPath : '../../restrictedData.json'

	# Normalized (full) path to config.coffee
	@fullConfigPath : path.normalize "#{__dirname}/#{@configPath}"

	# Normalized (full) path to restrictedData.json
	@fullConfigDataPath : path.normalize "#{__dirname}/#{@dataPath}"



	# @return [object] the config object
	# 
	# If on of the two files has changed, the config is re-parsed from these files
	#
	# @param callback [Function] [object]
	#
	@getConfig : (callback)->

		actualConfig = require @configPath
		fs.stat @fullConfigPath, (errConf, statConf)=>
			fs.stat @fullConfigDataPath, (errData, statData)=>
				if errConf or errData or not statConf.mtime or not statData.mtime
					callback actualConfig
				
				else if (@lastEditedConfig < statConf.mtime?.getTime() ) or (@lastEditedConfigData < statData.mtime?.getTime() )
					
					@lastEditedConfig = statConf.mtime.getTime()
					@lastEditedConfigData = statData.mtime.getTime()

					delete require.cache[@fullConfigPath]

					callback require @configPath

				else
					callback actualConfig

	#
	# Serialize and write the config on disk
	# @param config [object] the modified config object to save
	# @param callback [Function] called after write on disk is done
	# @return [undefined]
	#
	@saveConfig = (config, callback)=>
		newData = 
			apps: config.apps
			corridors: config.corridors

		json = JSON.stringify newData, null, '\t'

		fs.writeFile @fullConfigDataPath, json, callback






module.exports = ConfigManager