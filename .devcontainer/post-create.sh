#!/bin/bash

echo "post-create ...";

touch .envrc

pnpm config set minimumReleaseAge 2880

