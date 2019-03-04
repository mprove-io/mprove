#!/usr/bin/env bash

webhook_url="https://hooks.slack.com/services/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"
channel="#notifications"
username="Docker"
#text=`lynx --dump http://localhost:8080 | sed '/^$/d'`
docker images us.gcr.io/mprove-1201/mprove-blockml-node
text=`docker images --filter "since=us.gcr.io/mprove-1201/mprove-blockml-node:2018.06.11.0.3" us.gcr.io/mprove-1201/mprove-blockml-node | grep -v '<none>' | grep -v REPOSITORY | awk '{print $1":"$2" - "$4" "$5" "$6" "$7" "$8;}'`

escapedText=$(echo $text | sed 's/us.gcr.io/\nus.gcr.io/g'  )

#json="{\"channel\": \"$channel\", \"username\":\"$username\", \"icon_emoji\":\":robot_face:\", \"attachments\":[{\"color\":\"danger\" , \"text\": \"$escapedText\"}]}"
json="{\"channel\": \"$channel\", \"username\":\"$username\", \"icon_emoji\":\":whale:\", \"text\": \"$escapedText\"}"

curl -s -d "payload=$json" "$webhook_url"


