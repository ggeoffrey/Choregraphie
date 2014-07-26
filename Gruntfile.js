// Generated by CoffeeScript 1.7.1
(function () {
    module.exports = function (grunt) {
        var privatePath, publicPath;
        publicPath = './public';
        privatePath = './private';
        grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            uglify: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
                },
                dist: {
                    files: {
                        './public/<%= pkg.name %>.js': ['<%= concat.prod.dest %>']
                    }
                }
            },
            concat: {
                options: {
                    separator: '\n'
                },
                dev: {
                    src: [
                        privatePath + '/vendors/jquery-1.11.1.js',
                        privatePath + '/vendors/bootstrap/bootstrap.js',
                        privatePath + '/vendors/d3.js',
                        privatePath + '/vendors/d3.force3D.js',
                        privatePath + '/vendors/underscore-min.js',
                        privatePath + '/vendors/angular.js',
                        privatePath + '/vendors/angular-route.js',
                        privatePath + '/vendors/angular-animate.js',
                        privatePath + '/vendors/moment.js',
                        privatePath + '/vendors/snap.js',
                        privatePath + '/vendors/three-67.js',
                        privatePath + '/vendors/threejs/*',
                        privatePath + '/vendors/angular-moment.js',
                        privatePath + '/vendors/angular-snap.js',
                        privatePath + '/vendors/OrbitControls.js',
                        privatePath + '/vendors/helvetiker_regular.typeface.js',
                        privatePath + '/vendors/Tween.js',
                        privatePath + '/vendors/Ease.js'
                    ],
                    dest: publicPath + '/javascripts/vendors.js'
                },
                prod: {
                    src: [
                        publicPath + '/javascripts/vendors.js',
                        publicPath + '/javascripts/choregraphie.js'
                    ],
                    dest: publicPath + '/javascripts/choregraphie.js'
                }
            },
            clean: {
                dev: {
                    src: [publicPath + '/javascripts/choregraphie.js']
                },
                prod: {
                    src:
                        [
                            publicPath + '/javascripts/'
                        ]
                }
            },
            copy: {
                jscss: {
                    cwd: privatePath + '/vendors/css',
                    src: '**',
                    dest: publicPath + '/stylesheets/js/',
                    filter: 'isFile',
                    expand: true,
                    flatten: false
                }
            },
            typescript: {
                client: {
                    src: [privatePath + '/src/database.ts', privatePath + '/src/main.ts', privatePath + '/src/*.ts'],
                    dest: publicPath + '/javascripts/choregraphie.js',
                    options: {
                        module: 'commonjs',
                        target: 'es5',
                        sourceMap: false,
                        declaration: false
                    }
                }
            },
            watch: {
                all: {
                    files: ['./app.js', './modules/**/*.js', privatePath + '/src/*.ts', publicPath + '/**'],
                    tasks: ['jshint', 'typescript:client', 'express:dev']
                },
                client: {
                    files: [privatePath + '/src/**/*.ts'],
                    tasks: ['typescript:client']
                },
                server: {
                    files: ['./app.js', './modules/**/*.js'],
                    tasks: ['jshint', 'express:dev'],
                    options: {
                      spawn: false // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions. Without this option specified express won't be reloaded
                    }
                }
            },
            jshint: {
                ignore_warning: {
                  options: {
                    '-W015': true,
                  },
                  src: [ './app.js' , './modules/**/*.js','./routes/**/*.js' ],
                },
            },
            express: {
                options: {   
                  port: 3000,
                  output: ".+",
                  debug: false
                },
                dev:{
                    options:{
                        script : "./bin/www",
                        background: true,
                        node_env: 'development',
                    }
                }
            }            
        });
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-contrib-clean');
        grunt.loadNpmTasks('grunt-contrib-copy');
        grunt.loadNpmTasks('grunt-contrib-watch');
        grunt.loadNpmTasks('grunt-typescript');
        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-express-server');


        grunt.registerTask('assets', ['shell:copy_assets']);
        grunt.registerTask('prod', ['clean:prod', 'typescript:client', 'concat:dev', 'concat:prod', 'uglify', 'copy:jscss']);
        grunt.registerTask('preprod', ['clean:prod', 'typescript:client', 'concat:dev', 'concat:prod', 'copy:jscss']);
        grunt.registerTask('dev', ['clean:dev', 'typescript:client', 'concat:dev', 'copy:jscss']);
        grunt.registerTask('quickDev', ['typescript:client', 'concat:dev', 'copy:jscss']);
        grunt.registerTask('default', ['dev']);
    };

}).call(this);
