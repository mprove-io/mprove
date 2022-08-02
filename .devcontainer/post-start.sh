#!/bin/bash

containerWorkspaceFolder=$1
$containerWorkspaceFolder/node_modules/.bin/cypress install

# sudo chown node /etc/hosts 

echo "$(echo '127.0.0.1 db' | cat - /etc/hosts)" > /etc/hosts 
echo "$(echo '127.0.0.1 rabbit' | cat - /etc/hosts)" > /etc/hosts  

direnv allow