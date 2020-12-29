#! /bin/bash

if [ -z ${1+x} ]; then
	$1="Update files"
fi

git status &&
git add -A &&
git commit -am "$1" &&
git push

exit 0
