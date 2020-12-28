#! /bin/bash

if [ -z ${1+x} ]; then
	echo "  You failed to add a commit message!"
	echo "  EXAMPLE: ./doGit.sh \"Update files\""
	exit 1
fi

git status &&
git add -A &&
git commit -am "$1" &&
git push

exit 0
