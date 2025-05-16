#!/bin/bash

echo "init ...";

git config --local user.email $(git config user.email)
git config --local user.name $(git config user.name)
