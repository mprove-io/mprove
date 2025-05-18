#!/bin/bash

echo "post-start ...";

# sudo chown node /etc/hosts 
# sudo chmod -R 775 "/root/mprove_data/redis"

echo "$(echo '127.0.0.1 db' | cat - /etc/hosts)" > /etc/hosts 
echo "$(echo '127.0.0.1 db-main' | cat - /etc/hosts)" > /etc/hosts 
echo "$(echo '127.0.0.1 redis' | cat - /etc/hosts)" > /etc/hosts  
echo "$(echo '127.0.0.1 rabbit' | cat - /etc/hosts)" > /etc/hosts  
echo "$(echo '127.0.0.1 backend' | cat - /etc/hosts)" > /etc/hosts 
echo "$(echo '127.0.0.1 dwh-postgres' | cat - /etc/hosts)" > /etc/hosts 

direnv allow