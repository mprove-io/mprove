#!/bin/bash

containerWorkspaceFolder=$1

# sudo chown node node_modules 
# sudo chown node dist 
# sudo chown node /home/node/mprove_data/organizations
# sudo chown node /home/node/mprove_data/blockml-logs

cp -n $containerWorkspaceFolder/.devcontainer/.zshrc.example $containerWorkspaceFolder/.devcontainer/.zshrc 
ln -sf $containerWorkspaceFolder/.devcontainer/.zshrc ~/.zshrc 


