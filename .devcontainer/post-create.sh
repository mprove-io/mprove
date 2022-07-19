#!/bin/bash

containerWorkspaceFolder=$1

sudo chown node node_modules 
sudo chown node dist 

cp -n $containerWorkspaceFolder/.devcontainer/.zshrc.example $containerWorkspaceFolder/.devcontainer/.zshrc 
ln -sf $containerWorkspaceFolder/.devcontainer/.zshrc ~/.zshrc 


