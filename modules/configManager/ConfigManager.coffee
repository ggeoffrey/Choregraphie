fs = require 'fs'
path = require 'path'



class ConfigManager

	@lastEditedConfig = 0
	@lastEditedConfigData = 0

	@configPath = '../../config'
	@dataPath = '../../restrictedData.json'

	@fullConfigPath = path.normalize "#{__dirname}/#{@configPath}"
	@fullConfigDataPath = path.normalize "#{__dirname}/#{@dataPath}"




	@getConfig = (callback)->

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


	@saveConfig = (config, callback)=>
		newData = 
			apps: config.apps
			corridors: config.corridors

		json = JSON.stringify newData, null, '\t'

		fs.writeFile @fullConfigDataPath, json, callback






module.exports = ConfigManager