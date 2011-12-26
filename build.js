
// --- SETTINGS --- //

var
  VERSION = '0.5.0+',
  DIST_NAME = 'shifty',
  DIST_FOLDER = 'dist',
  SRC_FOLDER = 'src',
  COMPILER_JAR = 'build/closure_compiler/compiler.jar',
  FILE_LIST = [
    'shifty.intro.js',
    'shifty.core.js',
    'shifty.formulas.js',
    'shifty.queue.js',
    'shifty.color.js',
    'shifty.css_units.js',
    'shifty.interpolate.js',
    'shifty.outro.js'
  ],
  REPLACEMENTS = {
    'version' : VERSION
  };



// --- SETUP --- //

var
  _fs = require('fs'),
  _path = require('path'),
  _exec = require('child_process').exec,
  _distBaseName = _path.join(__dirname, DIST_FOLDER, DIST_NAME),
  _distFileName = _distBaseName + '.js',
  _distFileNameMin = _distBaseName + '.min.js';


/**
 * Parse string and replace tokens delimited with '{{}}' with object data.
 * @param {string} template String containing {{tokens}}.
 * @param {object} data Object containing replacement values.
 */
function stache(template, data){
  function replaceFn(match, prop){
      return (prop in data)? data[prop] : '';
  }
  return template.replace(/\{\{(\w+)\}\}/g, replaceFn);
}



// ---  CONCAT --- //

function concatFiles(fileList) {
  var out = [];
  fileList.forEach(function(fileName){
    out.push( _fs.readFileSync( _path.join(__dirname, SRC_FOLDER, fileName) ) );
  });
  return out.join('\n');
}

_fs.writeFileSync(_distFileName, stache(concatFiles(FILE_LIST), REPLACEMENTS));



// --- MINIFICATION ---- //

_exec(
    'java -jar '+ COMPILER_JAR +' --js '+ _distFileName +' --js_output_file '+ _distFileNameMin,
  function (error, stdout, stderr) {
    if (error) console.log(stderr);
  }
);



// --- SIZE --- //

_exec(
  'cat '+ _distFileNameMin +' | gzip -9f | wc -c',
  function (error, stdout, stderr) {
    if (error) {
      console.log(stderr);
    } else {
      console.log('Boom!  Shifty was built.  The file size, minified and gzipped, is:');
      console.log( (stdout + '').replace(/[\s\n]/g, '') + ' bytes' );
    }
  }
);
