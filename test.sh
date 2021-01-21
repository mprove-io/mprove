#!/bin/bash

backendOutput="$(cd "m-backend" && yarn test)"
if [[ $? != 0 ]]
then
  echo "$backendOutput"
  echo "backend Fail!"
  exit 1
else 
  echo "backend Success!"
fi

diskOutput="$(cd "m-disk" && yarn test)"
if [[ $? != 0 ]]
then
  echo "$diskOutput"
  echo "disk Fail!"
  exit 1
else 
  echo "disk Success!"
fi

blockmlOutput="$(cd "m-blockml" && yarn test)"
if [[ $? != 0 ]]
then
  echo "$blockmlOutput"
  echo "blockml Fail!"
  exit 1
else 
  echo "blockml Success!"
fi
