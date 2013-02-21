/*global module:false, require:true, console:true */

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
    uglify: {
      mangle: {
        defines: {
          SHIFTY_DEBUG: ['name', 'false'],
          SHIFTY_DEBUG_NOW: ['name', 'false']
        }
      }
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
        Tweenable: true,
        module: true,
        define: true
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
  grunt.registerTask('build', 'concat:forRekapi min doc');
  grunt.registerTask('build-minimal', 'concat:minimal min doc');

  grunt.registerTask('doc', 'Generate API documentation.', function () {
    var fs = require('fs');
    var exec = require('child_process').exec;
    var exportToPath = 'dist/doc/';

    if (!fs.existsSync(exportToPath)) {
      fs.mkdirSync(exportToPath);
    }

    var child = exec(
      'dox-foundation < dist/shifty.js > ' + exportToPath + 'index.html',
      function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
    });

  });

};
