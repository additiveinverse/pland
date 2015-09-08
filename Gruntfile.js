module.exports = function ( grunt ) {
	var name = "<%= pkg.name %>-v<%= pkg.version%>"
	var manifestcss = {
      "build/css/layout.min.css": [
        "app_modules/normalize-less/normalize.less",
        "app/less/base-*.less"
      ],
      "build/css/<%= pkg.name %>.css": "app/less/global.less"
    }
	var manifestjs = "<%= pkg.manifest.js %>"
	var reports = "reports/<%= pkg.name %>-"

	grunt.initConfig( {
		config: {
			lib: "app_modules/",
			tmp: "temp/",
			app: {
				root: "app/",
				js: "app/",
				less: "app/less/",
				partials: "app/partials/",
				img: "app/images/",
				tpl: "templates/"
			},
			dist: {
				root: "build/",
				css: "build/css/",
				js: "build/js/",
				img: "build/img/"
			},
			manifest: {
				css: {
					"build/css/layout.min.css":
					[
						"app_modules/normalize-less/normalize.less",
						"app/less/base-*.less"
					],
					"build/css/<%= pkg.name %>.css": "app/less/global.less"
		    }
			}
		},

		pkg: grunt.file.readJSON( 'package.json' ),

		banner: "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
			' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

		// ///////////////////////////////////////////////////////////////// scaffold
		concat: {
			options: {
				separator: " ",
				banner: "<%= banner %>"
			},
			appJS: {
				src: [
					"<%= config.app.js %>prm.*.js"
				],
				dest: "<%= config.dist.js %>prm.js"
			},
			libJS: {
				src: [
					"<%= config.lib %>/angular/angular.min.js",
					"<%= config.lib %>/angular-animate/angular-animate.min.js",
					"<%= config.lib %>/angular-route/angular-route.min.js",
					"<%= config.lib %>/angular-sanitize/angular-sanitize.min.js"
				],
				dest: "<%= config.dist.js %>angular.js"
			}
		},

		// ///////////////////////////////////////////////////////////////// linting / testing / cleanup
		lesslint: {
			src: "<%= config.app.less %>*.less",
			csslintrc: '.csslintrc',
			options: {
				formatters: [ {
					id: 'text',
					dest: reports + 'CSSlint.txt'
				} ]
			}
		},

		jsonlint: {
			config: {
				src: [ "config.json", "package.json", "bower.json" ]
			},
			data: {
				src: [ "<%= config.app.root %>*.json", "<%= config.dist.js %>*.json" ]
			}
		},

		strip: {
			main: {
				src: "<%= config.app %>autocomplete.js",
				dest: "<%= config.tmpDist %>autocomplete.js",
				options: {
					nodes: [ "console.log", "console.dir", "debug" ]
				}
			}
		},

		jsbeautifier: {
			files: manifestjs,
			options: {
				css: {
					indentSize: 2,
					indentWithTabs: true,
					selectorSeperatorNewline: true,
					newLineBetweenRules: true
				},
				js: {
					braceStyle: "collapse",
					breakChainedMethods: false,
					e4x: false,
					evalCode: false,
					indentChar: " ",
					indentLevel: 0,
					indentSize: 2,
					indentWithTabs: true,
					jslintHappy: true,
					keepArrayIndentation: false,
					keepFunctionIndentation: true,
					maxPreserveNewlines: 10,
					preserveNewlines: true,
					spaceBeforeConditional: true,
					spaceInParen: true,
					unescapeStrings: false,
					wrapLineLength: 0,
					endWithNewline: true
				}
			}
		},

		// ///////////////////////////////////////////////////////////////// compile
		less: {
			dev: {
				options: {
					path: "<%= config.app.less %>",
					cleancss: false
				},
				files: "<%= config.manifest.css %>"
			},
			production: {
				options: {
					path: "<%= config.app.less %>",
					compress: true,
					cleancss: true
				},
				files: "<%= config.manifest.css %>"
			}
		},

		jade: {
			compile: {
				options: {
					pretty: true,
					data: function( dest, src ) {
						return grunt.file.readJSON("config.json")
					}
				},
				files: {
					"<%= config.dist.root %>index.html": "<%= config.app.tpl %>index.jade"
				}
			}
		},

		ngtemplates: {
			proem: {
				src: "<%= config.app.partials %>*.html",
				dest: "<%= config.app.js %>prm.tpl.js",
				options: {
					htmlmin: {
						collapseWhitespace: true,
						collapseBooleanAttributes: true
					}
				}
			}
		},

		// ///////////////////////////////////////////////////////////////// minifying
		minjson: {
			compile: {
				files: {
					"<%= config.dist.js %>discog.json": [ "<%= config.app.root %>.json" ]
				}
			}
		},

		imagemin: {
			dynamic: {
				options: {
					optimizationLevel: 5,
					pngquant: true
				},
				files: [ {
					expand: true,
					cwd: "<%= config.app.img %>",
					src: [ '**/*.{png,jpg,gif}' ],
					dest: "<%= config.dist.img %>"
				} ]
			}
		},

		uglify: {
			options: {
				banner: "<%= banner %>",
				sourceMap: true,
				screwIE8: false
			},
			dist: {
				src: "<%= manifest.js_bundle %>",
				dest: "<%= config.dist %>prm.<%= pkg.name %>.min.js"
			}
		},

		htmlmin: {
			dist: {
				options: {
					removeComments: true,
					removeAttributeQuotes: true,
					useShortDocType: true,
					collapseWhitespace: true
				},
				files: {
					'<%= prod.root %>index.html': '<%= prod.root %>index.html'
				}
			}
		},
		// ///////////////////////////////////////////////////////////////// build / deploy / workflow
		bump: {
			options: {
				files: [ "package.json", "bower.json" ],
				updateConfigs: [],
				commit: true,
				commitMessage: "Release v%VERSION%",
				commitFiles: [ "package.json", "bower.json" ],
				createTag: true,
				tagName: "%VERSION%",
				tagMessage: "%VERSION%",
				push: true,
				pushTo: "origin",
				gitDescribeOptions: "--tags --always --abbrev=1 --dirty=-d",
				globalReplace: false
			}
		},

		connect: {
			server: {
				options: {
					port: "9001",
					base: "build/",
					protocol: "http",
					hostname: "localhost",
					livereload: true,
					open: {
						target: "http://localhost:9001/", // target url to open
						appName: "Chrome"
					},
				}
			}
		},

		watch: {
			files: [
				"Gruntfile.js",
				"templates/**/*",
				"<%= config.app.root %>**/*"
			],
			tasks: [
				"less:dev",
				"newer:jade",
				"newer:ngtemplates",
				"concat",
				"jshint"
			],
			options: {
				reload: true,
				livereload: true,
				spawn: false,
				dateFormat: function ( time ) {
					grunt.log.writeln( "The watch finished in " + time + "ms at" + ( new Date() ).toString() );
				}
			}
		},

		concurrent: {
			target: {
				tasks: [ "connect", "watch" ],
				options: {
					logConcurrentOutput: true
				}
			}
		}
	} );

	require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );

	// init
	grunt.registerTask( "devint", [ "jade", "less:dev" ] )
	// Develop
	grunt.registerTask( "default", [ "jade", "connect", "watch" ] );

	// Test
	grunt.registerTask( 'test', [ "lesslint", 'jsonlint' ] );

	grunt.registerTask( "dataprep", [ "minjson", "jsonlint" ] );

	// Deploy
	grunt.registerTask( 'deploy', [ 'less:prod', 'test', 'imagemin', 'ngtemplates', 'concat' ] );
}
