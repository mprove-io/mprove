#!/bin/bash

touch .envrc

containerWorkspaceFolder=$1
cp -n $containerWorkspaceFolder/.devcontainer/.zshrc.example $containerWorkspaceFolder/.devcontainer/.zshrc 
ln -sf $containerWorkspaceFolder/.devcontainer/.zshrc ~/.zshrc 

# sudo chown node node_modules 
# sudo chown node dist 
# sudo chown node /home/node/mprove_data/organizations
# sudo chown node /home/node/mprove_data/blockml-logs




