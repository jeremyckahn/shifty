#!/bin/bash
#Shifty build script.  Cobbled together with help from: http://blog.badsyntax.co/post/1465134196/minifying-javascript-using-google-closure-compiler-and

echo \
"/**
Shifty - A teeny tiny tweening engine in JavaScript. v${1}
By Jeremy Kahn - jeremyckahn@gmail.com

For instructions on how to use Shifty, please consult the README: https://github.com/jeremyckahn/shifty/blob/master/README.md

MIT Lincense.  This code free to use, modify, distribute and enjoy.
*/" | cat > /tmp/shifty.license.js

echo "(function(){" | cat > /tmp/shifty.header.js

echo "\n}());" | cat > /tmp/shifty.footer.js

# All the files to build...
cat /tmp/shifty.license.js \
  /tmp/shifty.header.js \
  src/shifty.core.js \
  src/shifty.formulas.js \
  src/shifty.queue.js \
  src/shifty.color.js \
  src/shifty.css_units.js \
  src/shifty.interpolate.js \
  /tmp/shifty.footer.js \
  > shifty.js


in=shifty.js
out=/tmp/shifty.compiled.js

curl -s \
  -d compilation_level=SIMPLE_OPTIMIZATIONS \
  -d output_format=text \
  -d output_info=compiled_code \
  --data-urlencode "js_code@${in}" \
  http://closure-compiler.appspot.com/compile \
   > $out

cat /tmp/shifty.license.js $out > builds/shifty.min.js

echo 'Boom!  Shifty was built.  The file size, minified and gzipped, is:'
echo `cat builds/shifty.min.js | gzip -9f | wc -c` "bytes"
