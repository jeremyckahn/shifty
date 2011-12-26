
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
  FILE_ALWAYS_KEEP = [
    'shifty.intro.js',
    'shifty.core.js',
    'shifty.outro.js'
  ],
  REPLACEMENTS = {
    'version' : VERSION
  };



// --- SETUP --- //

var
  _cli = require('commander'),
  _fs = require('fs'),
  _path = require('path'),
  _exec = require('child_process').exec,
  _distBaseName = _path.join(__dirname, DIST_FOLDER, DIST_NAME),
  _distFileName = _distBaseName + '.js',
  _distFileNameMin = _distBaseName + '.min.js',
  _fileList = [];


_cli
  .version('0.1.0')
  .option('-e, --exclude [modules]', 'Comma separated list of modules to be excluded from the build (eg. queue,color,css_units).', parseList)
  .option('-i, --include [modules]', 'List of modules to be included. Defaults to all modules. (eg. formulas,color)', parseList)
  .option('--silent', 'Don\'t display messages.')
  .option('--nosize', 'Don\'t display size info. Avoid errors on Windows or other envs where `cat`, `gzip` and `wc` aren\'t available.')
  .parse(process.argv);

function parseList(str){
  return str.split(',');
}

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


function matchContain(arr, val) {
  var result = false;
  if (arr) {
    result = arr.some(function(item){
      return val.indexOf(item) !== -1;
    });
  }
  return result;
}

if (_cli.include) {
  _fileList = FILE_LIST.filter(function(fileName){
    return matchContain(FILE_ALWAYS_KEEP, fileName) || matchContain(_cli.include, fileName);
  });
} else {
  _fileList = FILE_LIST;
}

if (_cli.exclude) {
  _fileList = _fileList.filter(function(fileName){
    return matchContain(FILE_ALWAYS_KEEP, fileName) || !matchContain(_cli.exclude, fileName);
  });
}



// ---  CONCAT --- //

function concatFiles(fileList) {
  var out = [];
  fileList.forEach(function(fileName){
    out.push( _fs.readFileSync( _path.join(__dirname, SRC_FOLDER, fileName) ) );
  });
  return out.join('\n');
}

_fs.writeFileSync(_distFileName, stache(concatFiles(_fileList), REPLACEMENTS));



// --- MINIFICATION ---- //

_exec(
  'java -jar '+ COMPILER_JAR +' --js '+ _distFileName +' --js_output_file '+ _distFileNameMin,
  function (error, stdout, stderr) {
    if (error) {
      console.log(stderr);
    } else {
      if (! _cli.silent && ! _cli.nosize) {
        echoFileSize();
      }
    }
  }
);



// --- SIZE --- //

function echoFileSize() {
  //should be called only after minification completed
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
}
