#!/bin/bash

echo "Testing Backend..."
backendOutput="$(cd "m-backend" && yarn test)"
if [[ $? != 0 ]]
then
  echo "$backendOutput"
  echo "backend Fail!"
  exit 1
else 
  echo "Backend Success!"
fi

echo "Testing Disk..."
diskOutput="$(cd "m-disk" && yarn test)"
if [[ $? != 0 ]]
then
  echo "$diskOutput"
  echo "disk Fail!"
  exit 1
else 
  echo "Disk Success!"
fi

echo "Testing Blockml..."
blockmlOutput="$(cd "m-blockml" && yarn test)"
if [[ $? != 0 ]]
then
  echo "$blockmlOutput"
  echo "blockml Fail!"
  exit 1
else 
  echo "Blockml Success!"
fi

echo "Ok!"
