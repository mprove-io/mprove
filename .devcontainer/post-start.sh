#!/bin/bash

echo "post-start ...";

# sudo chown node /etc/hosts 

echo "$(echo '127.0.0.1 db' | cat - /etc/hosts)" > /etc/hosts 
echo "$(echo '127.0.0.1 redis' | cat - /etc/hosts)" > /etc/hosts  
echo "$(echo '127.0.0.1 rabbit' | cat - /etc/hosts)" > /etc/hosts  
echo "$(echo '127.0.0.1 backend' | cat - /etc/hosts)" > /etc/hosts 
echo "$(echo '127.0.0.1 calc-postgres' | cat - /etc/hosts)" > /etc/hosts 
echo "$(echo '127.0.0.1 dwh-postgres' | cat - /etc/hosts)" > /etc/hosts 
echo "$(echo '127.0.0.1 dwh-trino' | cat - /etc/hosts)" > /etc/hosts 
echo "$(echo '127.0.0.1 dwh-presto' | cat - /etc/hosts)" > /etc/hosts 
echo "$(echo '127.0.0.1 dwh-mysql' | cat - /etc/hosts)" > /etc/hosts 
echo "$(echo '127.0.0.1 dwh-clickhouse' | cat - /etc/hosts)" > /etc/hosts 

direnv allow