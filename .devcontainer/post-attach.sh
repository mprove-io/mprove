#!/bin/bash

echo "post-attach ...";

cp -n /mprove/.devcontainer/.zshrc.example /mprove/.devcontainer/.zshrc 
ln -sf /mprove/.devcontainer/.zshrc /root/.zshrc 

# instead of post-create.sh ${containerWorkspaceFolder}
# echo $1;
# containerWorkspaceFolder=$1
# cp -n $containerWorkspaceFolder/.devcontainer/.zshrc.example $containerWorkspaceFolder/.devcontainer/.zshrc 
# ln -sf $containerWorkspaceFolder/.devcontainer/.zshrc ~/.zshrc
