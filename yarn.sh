#!/bin/bash

echo "Yarn Top..."
topOutput="$(yarn)"
if [[ $? != 0 ]]
then
  echo "$topOutput"
  echo "Top Fail!"
  exit 1
fi

echo "Yarn Common..."
commonOutput="$(cd "m-common/ts" && yarn)"
if [[ $? != 0 ]]
then
  echo "$commonOutput"
  echo "Common Fail!"
  exit 1
fi

echo "Yarn Backend..."
backendOutput="$(cd "m-backend" && yarn)"
if [[ $? != 0 ]]
then
  echo "$backendOutput"
  echo "backend Fail!"
  exit 1
fi

echo "Yarn Disk..."
diskOutput="$(cd "m-disk" && yarn)"
if [[ $? != 0 ]]
then
  echo "$diskOutput"
  echo "disk Fail!"
  exit 1
fi

echo "Yarn Blockml..."
blockmlOutput="$(cd "m-blockml" && yarn)"
if [[ $? != 0 ]]
then
  echo "$blockmlOutput"
  echo "blockml Fail!"
  exit 1
fi

echo "Ok!"
