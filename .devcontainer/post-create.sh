#!/bin/bash

touch .envrc

containerWorkspaceFolder=$1
cp -n $containerWorkspaceFolder/.devcontainer/.zshrc.example $containerWorkspaceFolder/.devcontainer/.zshrc 
ln -sf $containerWorkspaceFolder/.devcontainer/.zshrc ~/.zshrc 

curl -sSLO https://werf.io/install.sh && chmod +x install.sh
mkdir -p /root/werf-setup/ && mv ./install.sh /root/werf-setup/
echo -ne '\n' | /root/werf-setup/install.sh --version 1.2 --channel stable

# sudo chown node node_modules 
# sudo chown node dist 
# sudo chown node /home/node/mprove_data/organizations
# sudo chown node /home/node/mprove_data/blockml-logs




