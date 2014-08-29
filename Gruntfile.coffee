module.exports = (grunt)->
	publicPath = './public'
	privatePath = './private'


	vendorsList = [
					"#{privatePath}/vendors/jquery-1.11.1.js"
					"#{privatePath}/vendors/bootstrap/bootstrap.js"
					"#{privatePath}/vendors/d3.js"
					"#{privatePath}/vendors/d3.force3D.js"
					"#{privatePath}/vendors/underscore-min.js"
					"#{privatePath}/vendors/angular.js"
					"#{privatePath}/vendors/angular-route.js"
					"#{privatePath}/vendors/angular-animate.js"
					"#{privatePath}/vendors/moment.js"
					"#{privatePath}/vendors/snap.js"
					"#{privatePath}/vendors/three-67.js"
					"#{privatePath}/vendors/threejs/*"
					"#{privatePath}/vendors/angular-moment.js"
					"#{privatePath}/vendors/angular-snap.js"
					"#{privatePath}/vendors/OrbitControls.js"
					"#{privatePath}/vendors/helvetiker_regular.typeface.js"
					"#{privatePath}/vendors/Tween.js"
					"#{privatePath}/vendors/Ease.js"
					"#{privatePath}/vendors/lz-string-1.3.3-min.js"
				]
	vendorsDest = "#{publicPath}/javascripts/vendors.js"

	clientList = [
		"#{privatePath}/src/database.ts"
		"#{privatePath}/src/main.ts"
		"#{privatePath}/src/*.ts"
	]

	clientDest = "#{publicPath}/javascripts/choregraphie.js"

	clientOptions = 
		module: 'commonjs'
		target: 'es5'
		sourceMap: false
		declaration: false

	grunt.initConfig
		pkg: grunt.file.readJSON('package.json')
		uglify:
			options:
				banner: '/*! Chorégraphie <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			dist:
				options:
					mangle : true
				files:
					'./public/javascripts/<%= pkg.name %>.js': ['<%= concat.prod.dest %>']
		concat:
			options:
				separator: '\n'
			dev: 
				src: vendorsList
				dest: vendorsDest
			test:
				src: vendorsList.concat [
					"#{privatePath}/vendors/should.js"
					"#{privatePath}/vendors/mocha.js"
				]
				dest: vendorsDest

			prod: 
				src: [
					"#{publicPath}/javascripts/vendors.js"
					"#{publicPath}/javascripts/choregraphie.js"
				]
				dest: "#{publicPath}/javascripts/choregraphie.js"
			
		
		clean:
			dev:
				src: ["#{publicPath}/javascripts/choregraphie.js"]
			
			prod:
				src:
					[
						"#{publicPath}/javascripts/*"
					]
			
			final:
				src:
					[ "#{publicPath}/javascripts/vendors.js" ]
			
		
		copy: 
			jscss: 
				cwd:  "#{privatePath}/vendors/css"
				src: '**'
				dest: "#{publicPath}/stylesheets/js/"
				filter: 'isFile'
				expand: true
				flatten: false
			
		
		typescript: 
			client: 
				src: clientList
				dest: clientDest
				options: clientOptions
					
			preprod: 
				src: clientList.concat [
					"#{privatePath}/tests/*.ts"
				]
				dest: clientDest
				options: clientOptions			
		
		watch: 
			all: 
				files: ['./app.js', './modules/**/*.js', "#{privatePath}/src/*.ts", "#{publicPath}/**"],
				tasks: ['typescript:client', 'express:dev']
			
			client:
				files: [
					"#{privatePath}/src/**/*.ts"
				]
				tasks: ['typescript:client']

			server: 
				files: ['./app.js', './modules/**/*.coffee']
				tasks: ['express:dev']
				options: 
					spawn: false # for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions. Without this option specified express won't be reloaded

			tests:
				files: [
					"#{privatePath}/src/**/*.ts"
					"#{privatePath}/tests/**/*.ts"
				]
				tasks: ['preprod']
		
		express:
			options:   
				port: 3000,
				output: ".+"
				debug: false
			dev:
				options:
					script : "./bin/www"
					background: true

		mochaTest:
			server:
				options:
					reporter: 'nyan'
					require:[
						'coffee-script/register'
						-> should = require('should')
						#'./globals.js',
					]
				src: [
					'tests/**/*.coffee'
					'modules/*Connector/tests/**/*.coffee'
					'modules/**/tests/**/*.coffee'
				]

		typedoc:
			build:
				options:
					module: 'commonjs'
					out: './client_documentation'
					name: 'Chorégraphie - Client'
					target: 'es5'
					readme: 'README-Client.md'
				src: ['./private/src/*']

		codo:
			base:
				options:
					name : '<%= pkg.name %>'
					title: '<%= pkg.name %>' + " - Server"
					readme: 'README-Server.md'
					undocumented: yes
					privates: yes
					stats: yes
					extra: [ "LICENSE" ]
				src : [
					'routes'
					'modules'							
				]
				dest: 'server_documentation'
				

	grunt.loadNpmTasks 'grunt-contrib-concat'
	grunt.loadNpmTasks 'grunt-contrib-uglify'
	grunt.loadNpmTasks 'grunt-contrib-clean'
	grunt.loadNpmTasks 'grunt-contrib-copy'
	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-typescript'
	grunt.loadNpmTasks 'grunt-express-server'
	grunt.loadNpmTasks 'grunt-mocha-test'
	grunt.loadNpmTasks 'grunt-typedoc'
	grunt.loadNpmTasks 'grunt-codo' # CO ffee DOc

	grunt.registerTask('prod', ['clean:prod', 'typescript:client', 'concat:dev', 'concat:prod', 'uglify', 'copy:jscss', 'clean:final'])
	grunt.registerTask('preprod', ['clean:prod', 'typescript:preprod', 'concat:test', 'concat:prod', 'copy:jscss'])
	
	
	grunt.registerTask 'test', ['mochaTest:server']
	grunt.registerTask 'doc', ['typedoc', 'codo']

	grunt.registerTask('default', ['prod'])

