#!/usr/bin/env bash

#180808.1.0

limit=5000000
free_on_sda=`df | grep sda | awk '{print $4}'`

echo $free_on_sda

if [ "$free_on_sda" -gt "$limit" ];
then
    echo "all ok";
else
    echo "limit exeeded";
    exit 1
fi;
