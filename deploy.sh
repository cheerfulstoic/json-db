#!/usr/bin/env sh

# abort on errors
set -e

# build
yarn build

git add dist
git commit -m 'deploy'

git push


