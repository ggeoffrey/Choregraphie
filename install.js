/*
	Chorégraphie install script
	Written in JS to avoid UNIX/Windows dependencies

	- Please be sure you have NPM (it should be automaticaly installed with NodeJS)
	- Please be sure to install NodeJS by compiling the source code. Do NOT do apt-get install node
	- Please be sure to install GRUNT-CLI
	*/

	var exec = require('child_process').exec;
	var log = console.log;

	log('\n\n');
	log('##########################################');
	log('# Welcome to the Chorégraphie installer. #');
	log('##########################################');
	log('\n');
	log('The following commands will be run :');
	log('  npm -v');
	log('  grunt --version');
	log('  npm install');
	log('  grunt');
	log('\n\n');





	function checkNeeds(callback){

		exec('npm -v', function(err, stdout, stderr){
			if(err) {
				log(err);
				log('npm should be available globally on your system to continue.\n\n Please check your NodeJS installation.');
			}
			else{
				log('npm : ok');
				exec('grunt --version', function(err, stdout, stderr ){
					if(err){
						log(err);
						log('grunt should be available globally on your system to continue.\n\n Please do `[sudo] npm install -g grunt-cli`');
					}
					else{
						log('grunt : ok');
						callback();
					}
				});
			}
		});
	}


	function install(){
		exec('npm install', function(err, stdout, stderr){
			if(err){
				log('An error as occured while installing dependencies. *Maybe* you doesn\'t have a C++ compiler available ?');
				log('Check at ./npm-debug.log.');
				log(stdout);
			}
			else{
				exec('npm install --dev', function(err, stdout, stderr){
					if(err){
						log('Unable to install dev dependencies.');
						log('Check at ./npm-debug.log.');
					}
					else{
						exec('grunt', function(err, stdout, stderr){
							if(err){
								log('Unable to build Chorégraphie. Have you write rights on ./public folder ?')
								log('Have you all dependencies installed ?');
							}
							else{
								success();
							}
						});
						
					}
				});
			}

		});
	}



	function success(){
		log(' ******    SUCCESS   ****** ');
		log('\n\nThe default port is 3001. Be sure to configure your VirtualHost to `proxy` mode, and to forward requests to this port.');
		log('You can also change it in config.js');
		log('Looking for the database config ? Look in ./modules/<your_db_type>Connector/config.js');
		log('\nYou can run tests on server with `grunt test`');
		log('You can run tests on client be browsing to http://your_domain/pointing/to/choregraphie/?tests=true');
		log('Some tests may fail (timeout) if you database is too slow.');
		log('\n\n');
	}

	checkNeeds(function(){
		install();
	});
