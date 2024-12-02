#!/bin/bash

# add background script compatability to classes
addClassToWindow() {
	CLASSNAME=$1
	FILE_PATH=$2

	line="window.$CLASSNAME = $CLASSNAME;"

	# preserve the original file
	cp $FILE_PATH $FILE_PATH.bak

	echo $line >> $FILE_PATH
	echo "Added $line to $FILE_PATH"
}

removeImportScripts() {
	FILE_PATH=$1

	# preserve the original file
	cp $FILE_PATH $FILE_PATH.bak

	# remove import scripts
	sed -i '/importScripts(/,/^)/d' $FILE_PATH
	echo "Removed import scripts from $FILE_PATH"
}

CHATGPTJS="scripts/ai/chatgpt.js"
QUERYJS="scripts/ai/query.js"
BACKGROUNDJS="scripts/background.js"

addClassToWindow "OpenAIAgent" $CHATGPTJS
addClassToWindow "QueryGenerator" $QUERYJS

removeImportScripts $BACKGROUNDJS

# return list of files changed above
echo "$CHATGPTJS.bak $QUERYJS.bak $BACKGROUNDJS.bak"