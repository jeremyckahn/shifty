/*global module:false, require:true, console:true */

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

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
        'grunt.js',
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
          'src/shifty.interpolate.js',
          'src/shifty.token.js',
          'src/shifty.outro.js'
        ],
        dest: 'dist/shifty.js'
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'qunit']);
  grunt.registerTask('build',
    ['concat:forRekapi', 'uglify:standardTarget', 'concat:forRekapiDebug', 'doc']);
  grunt.registerTask('build-minimal',
    ['concat:minimal', 'uglify:standardTarget', 'concat:minimalDebug', 'doc']);

  grunt.registerTask('doc', 'Generate API documentation.', function () {
    var fs = require('fs');
    var exec = require('child_process').exec;
    var exportToPath = 'dist/doc/';

    if (!fs.existsSync(exportToPath)) {
      fs.mkdirSync(exportToPath);
    }

    var child = exec(
      'dox-foundation -t Shifty < dist/shifty.js > '
        + exportToPath + 'index.html',

      function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
    });

  });

};
