#!/bin/bash

FILENAME=manifest.json
PLATFORM=${1:-chromium}
MANIFEST_PATH=platform/$PLATFORM

# Get version from manifest
if [ -f "$MANIFEST_PATH/$FILENAME" ]; then
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
		if [ -f build/${PLATFORM}_*.zip ]; then
			rm build/${PLATFORM}_*
		fi

		# format version string from '"0.0.1",' to '001'
		formated=$(echo "$value" | sed 's/[\.\,\ "]//g') 
		# create zip
		ZIPNAME="build/${PLATFORM}_${formated}.zip"

		# put manifest outside temporarily
		cp $MANIFEST_PATH/manifest.json .

		# pick files and folders to zip
		zip -r "$ZIPNAME" manifest.json images scripts styles popup docs lib

		# remove manifest
		rm manifest.json

		break
	fi

	done < $MANIFEST_PATH/$FILENAME
else
	echo "File $MANIFEST_PATH/$FILENAME seems to be missing!"
fi