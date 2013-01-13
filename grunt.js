/*global module:false*/

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: [
        '/*! <%= pkg.name %> - v<%= pkg.version %> - ',
        '<%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.homepage %> */'
      ].join('')
    },
    qunit: {
      files: ['tests/*.html']
    },
    lint: {
      files: [
        'grunt.js',
        'src/shifty.!(intro|outro)*.js'
      ]
    },
    jshint: {
      options: {
          asi: false,
          boss: true,
          browser: true,
          curly: true,
          eqeqeq: true,
          eqnull: true,
          immed: true,
          lastsemic: true,
          latedef: true,
          laxbreak: true,
          laxcomma: true,
          newcap: true,
          noarg: true,
          nomen: false,
          plusplus: false,
          sub: true,
          undef: true,
          white: false
      },
      globals: {
        SHIFTY_DEBUG_NOW: true,
        Tweenable: true
      }
    },
    concat: {
      minimal: {
        src: [
          '<banner>',
          'src/shifty.intro.js',
          'src/shifty.core.js',
          'src/shifty.outro.js'
        ],
        dest: 'dist/shifty.js'
      },
      // Includes extensions needed by Rekapi (see: rekapi.com)
      forRekapi: {
        src: [
          '<banner>',
          'src/shifty.intro.js',
          'src/shifty.core.js',
          'src/shifty.formulas.js',
          'src/shifty.interpolate.js',
          'src/shifty.token.js',
          'src/shifty.outro.js'
        ],
        dest: 'dist/shifty.js'
      }
    },
    min: {
      dist: {
        src: ['<banner>', 'dist/shifty.js'],
        dest: 'dist/shifty.min.js'
      }
    }
  });

  grunt.registerTask('default', 'lint qunit');
  grunt.registerTask('build', 'concat:forRekapi min');
  grunt.registerTask('build-minimal', 'concat:minimal min');

};
