/*global module:false, require:true, console:true */

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-codepainter');
  grunt.loadNpmTasks('grunt-dox');

  var banner = [
        '/*! <%= pkg.name %> - v<%= pkg.version %> - ',
        '<%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.homepage %> */\n'
      ].join('');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    qunit: {
      files: ['tests/*.html']
    },
    uglify: {
      standardTarget: {
        files: {
          'dist/shifty.min.js': [
            'dist/shifty.js'
          ]
        }
      },
      options: {
        banner: banner
      }
    },
    jshint: {
      all_files: [
        'src/shifty.!(intro|outro|const)*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    concat: {
      options: {
        banner: banner
      },
      minimal: {
        src: [
          'src/shifty.intro.js',
          'src/shifty.const.js',
          'src/shifty.core.js',
          'src/shifty.outro.js'
        ],
        dest: 'dist/shifty.js'
      },
      minimalDebug: {
        src: [
          'src/shifty.intro.js',
          'src/shifty.core.js',
          'src/shifty.outro.js'
        ],
        dest: 'dist/shifty.js'
      },
      // Includes extensions needed by Rekapi (see: rekapi.com)
      forRekapi: {
        src: [
          'src/shifty.intro.js',
          'src/shifty.const.js',
          'src/shifty.core.js',
          'src/shifty.formulas.js',
          'src/shifty.bezier.js',
          'src/shifty.interpolate.js',
          'src/shifty.token.js',
          'src/shifty.outro.js'
        ],
        dest: 'dist/shifty.js'
      },
      forRekapiDebug: {
        src: [
          'src/shifty.intro.js',
          'src/shifty.core.js',
          'src/shifty.formulas.js',
          'src/shifty.bezier.js',
          'src/shifty.interpolate.js',
          'src/shifty.token.js',
          'src/shifty.outro.js'
        ],
        dest: 'dist/shifty.js'
      }
    },
    dox: {
      options: {
        title: 'Shifty'
      },
      files: {
        src: [
          'src/shifty.core.js',
          'src/shifty.interpolate.js',
          'src/shifty.bezier.js',
          'src/shifty.token.js'
        ],
        dest: 'dist/doc'
      }
    },
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        commit: false,
        createTag: false,
        tagName: '%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false
      }
    },
    codepainter: {
      source: {
        options: {
          json: '.codepainterrc'
        },
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['shifty.!(intro|outro|const)*.js'],
          dest: 'src/'
        }]
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'qunit']);
  grunt.registerTask('build',
    ['concat:forRekapi', 'uglify:standardTarget', 'concat:forRekapiDebug', 'dox']);
  grunt.registerTask('build-minimal',
    ['concat:minimal', 'uglify:standardTarget', 'concat:minimalDebug', 'dox']);

};
