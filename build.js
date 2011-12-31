
// --- SETTINGS --- //

var
  VERSION = '0.5.0+',
  DIST_NAME = 'shifty',
  DIST_FOLDER = 'dist',
  SRC_FOLDER = 'src',
  SRC_FILE_NAME_PATTERN = 'shifty.{{moduleName}}.js',
  COMPILER_JAR = 'build/closure_compiler/compiler.jar',
  // module list should be in order
  MODULES_LIST = [
    'license',
    'intro',
    'core',
    'formulas',
    'queue',
    'color',
    'css_units',
    'interpolate',
    'outro'
  ],
  ALWAYS_INCLUDE = [
    'license',
    'intro',
    'core',
    'outro'
  ],
  replacements = {
    'version' : VERSION,
    'build_date' : (new Date()).toGMTString()
  };




// --- SETUP --- //

var
  _cli = require('commander'),
  _fs = require('fs'),
  _path = require('path'),
  _exec = require('child_process').exec,
  _distBaseName = _path.join(__dirname, DIST_FOLDER, DIST_NAME),
  _distFileName = _distBaseName + '.js',
  _distFileNameMin = _distBaseName + '.min.js';

_cli
  .version('0.1.1')
  .option('-e, --exclude <modules>', 'Comma separated list of modules to be excluded from the build (eg. queue,color,css_units).', parseList)
  .option('-i, --include <modules>', 'List of modules to be included. Defaults to all modules. (eg. formulas,color)', parseList)
  .option('--buildver <build version>', 'A string representing the build version to record in the source (eg. 5.0.2)')
  .option('--silent', 'Don\'t display messages.')
  .option('--nosize', 'Don\'t display size info. Avoid errors on Windows or other envs where `cat`, `gzip` and `wc` aren\'t available.')
  .parse(process.argv);

function parseList(str){
  return str.split(',');
}




// --- HELPERS --- //

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


function contains(arr, val) {
  return arr.indexOf(val) !== -1;
}


function moduleToFilePath(moduleName) {
  var fileName = stache(SRC_FILE_NAME_PATTERN, {moduleName : moduleName});
  return _path.join(__dirname, SRC_FOLDER, fileName);
}



// ---  CONCAT --- //

function getFileList() {
  var modules = [];

  if (_cli.include) {
    validateModules(_cli.include);
    modules = MODULES_LIST.filter(function(moduleName){
      return contains(ALWAYS_INCLUDE, moduleName) || contains(_cli.include, moduleName);
    });
  } else {
    modules = MODULES_LIST;
  }

  if (_cli.exclude) {
    validateModules(_cli.exclude);
    modules = modules.filter(function(moduleName){
      return contains(ALWAYS_INCLUDE, moduleName) || !contains(_cli.exclude, moduleName);
    });
  }

  return modules.map(moduleToFilePath);
}


function validateModules(modules) {
  var diff = modules.filter(function(moduleName){
    return !contains(MODULES_LIST, moduleName);
  });
  if (diff.length) {
    console.log('  ERROR: Can\'t find module(s): '+ diff);
    console.log('  Please check if you provided the proper module names on -i,--include and -e,--exclude arguments.');
    process.exit(1);
  }
}


function concatFiles(fileList) {
  var out = fileList.map(function(filePath){
    return _fs.readFileSync(filePath);
  });
  return out.join('\n');
}


if (! _cli.buildver ) {
  console.log('  ERROR: Please provide a version number (with "--buildver").');
  process.exit(1); //exit with error
}

_fs.writeFileSync(_distFileName, stache(concatFiles(getFileList()), replacements));



// --- MINIFICATION ---- //

var
  uglyfyJS = require('uglify-js'),
  jsp = uglyfyJS.parser,
  pro = uglyfyJS.uglify,
  ast = jsp.parse( _fs.readFileSync(_distFileName, 'utf-8') );

ast = pro.ast_mangle(ast);
ast = pro.ast_squeeze(ast);

_fs.writeFileSync(_distFileNameMin, getLicense() + pro.gen_code(ast) );

function getLicense(){
  var srcLicense = _fs.readFileSync(moduleToFilePath('license'), 'utf-8');
  return stache(srcLicense, replacements);
}

if (! _cli.silent) {
  console.log('  Boom! Shifty was built.');
  echoFileSize();
}



// --- SIZE --- //

function echoFileSize() {
  if (_cli.nosize || _cli.silent) return;
  //should be called only after minification completed
  _exec(
    'cat '+ _distFileNameMin +' | gzip -9f | wc -c',
    function (error, stdout, stderr) {
      if (error) {
        console.log(stderr);
      } else {
        console.log('  The file size, minified and gzipped, is: '+ (stdout + '').replace(/[\s\n]/g, '') + ' bytes');
      }
    }
  );
}
