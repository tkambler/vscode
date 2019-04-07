#!/bin/bash
set -e

dir="$(realpath $(dirname $(dirname $0)))"

export MSYS_NO_PATHCONV=1; docker run --rm -it -v "$dir":"/mnt/src" "chriscamicas/node-xvfb:latest" bash
# first
# cp -r /mnt/src /home/node && cd /home/node/src && yarn install
# iterate
# cp -r /mnt/src/src/ /home/node/src && cp -r /mnt/src/test/ /home/node/src && yarn run build && xvfb-run yarn run test

