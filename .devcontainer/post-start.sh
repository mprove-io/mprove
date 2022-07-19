#!/bin/bash

sudo chown node /etc/hosts 

echo "$(echo '127.0.0.1 db' | cat - /etc/hosts)" > /etc/hosts 
echo "$(echo '127.0.0.1 rabbit' | cat - /etc/hosts)" > /etc/hosts 