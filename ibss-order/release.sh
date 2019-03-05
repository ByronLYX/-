#!/bin/bash

npm --registry http://registry.npm.taobao.org install

if [[ -n $1 ]]; then
    cdn = `echo $1 | sed 's/\\r\\n//g' | sed 's/\\r//g' | sed 's/\\n//g'`
    release_cdn=$1 npm run release
else
    npm run release
fi
