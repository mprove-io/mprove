#!/bin/bash

echo "init ...";

# Only set if the value actually exists on the host
if email=$(git config user.email) && [ -n "$email" ]; then
    git config --local user.email "$email"
fi

if name=$(git config user.name) && [ -n "$name" ]; then
    git config --local user.name "$name"
fi