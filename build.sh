#!/bin/sh
set -e
rm -rf dist
tsc && vite build
cp -R music dist/music
cp -R html dist/html
