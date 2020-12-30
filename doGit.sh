#! /bin/bash

if [ $# -eq 0 ]; then
	1="Update files"
fi

git status &&
git add -A &&
git commit -am "$1" &&
git push

exit 0
