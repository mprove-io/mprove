#!/bin/bash

containerWorkspaceFolder=$1

echo $containerWorkspaceFolder 

sudo chown node node_modules 
 
sudo chown node /etc/hosts 

cp -n $containerWorkspaceFolder/.devcontainer/.zshrc.example $containerWorkspaceFolder/.devcontainer/.zshrc 
ln -sf $containerWorkspaceFolder/.devcontainer/.zshrc ~/.zshrc 

echo "$(echo '127.0.0.1 db' | cat - /etc/hosts)" > /etc/hosts 
echo "$(echo '127.0.0.1 rabbit' | cat - /etc/hosts)" > /etc/hosts 

