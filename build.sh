#!/bin/bash

FILENAME=manifest.json
PLATFORM=${1:-chromium}
KEEP_MANIFEST=NO

# parse arguments
for i in "$@"
do
case $i in
	--keep-manifest)
	KEEP_MANIFEST=YES
	shift
	;;
	--platform=*)
	PLATFORM="${i#*=}"
	shift
	;;
	*)
	# unknown option
	;;
esac
done

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
		if [ -f build/DuoExplained_*.${PLATFORM}.zip ]; then
			rm build/DuoExplained_*.${PLATFORM}.zip
		fi

		# format version string from '"0.0.1",' to '001'
		formated=$(echo "$value" | sed 's/[\,\ "]//g') 
		# create zip
		ZIPNAME="build/DuoExplained_${formated}.${PLATFORM}.zip"

		# put manifest outside temporarily
		cp $MANIFEST_PATH/manifest.json .

		# pick files and folders to zip
		zip -r "$ZIPNAME" manifest.json images scripts styles popup docs lib locales

		if [ "$KEEP_MANIFEST" == "NO" ]; then
			# remove manifest
			rm manifest.json
		fi

		break
	fi

	done < $MANIFEST_PATH/$FILENAME
else
	echo "File $MANIFEST_PATH/$FILENAME seems to be missing!"
fi