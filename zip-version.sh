#!/bin/bash

FILENAME=manifest.json

# Get version from manifest
if [ -f "$FILENAME" ]; then
	while read line; do

	IFS=':';
	split=($line);
	unset IFS;

	key=${split[0]}
	value=${split[1]}
	
	# get version number from line 'version'
	tag=\"version\"
	if [ "$key" == "$tag" ]; then
		# delete old zip files
		if [ -f build/de_*.zip ]; then
			rm build/de_*
		fi

		# format version string from '"0.0.1",' to '001'
		formated=$(echo "$value" | sed 's/[\.\,\ "]//g') 
		# create zip
		ZIPNAME="build/de_$formated.zip"

		# pick files and folders to zip
		zip -r "$ZIPNAME" manifest.json images scripts styles popup docs lib

		break
	fi

	done < $FILENAME
else
	echo "File $FILENAME seems to be missing!"
fi
