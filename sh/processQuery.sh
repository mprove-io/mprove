#!/usr/bin/env bash

# DOMAIN
export DOMAIN="http://localhost:8080"
#export DOMAIN="https://dev.mprove.io"
#export DOMAIN="https://arhar.online"

export BEARER="Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJtS1o2UzRCTzNvaWFWQUdJeFlvbWpyTWJvQ2dsSnRVRyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTEyNzQ2NjEyNDM5Mzk3NTEyOTI3IiwiZW1haWxfdmVyaWZpZWQiOiJ0cnVlIiwidXNlcl9pZCI6Imdvb2dsZS1vYXV0aDJ8MTEyNzQ2NjEyNDM5Mzk3NTEyOTI3IiwiaXNzIjoiaHR0cHM6Ly9hbGJlZG8uYXV0aDAuY29tLyIsIm5hbWUiOiJKb2huIFNtaXRoIiwibmlja25hbWUiOiJqb2huU21pdGgiLCJleHAiOjE3OTM5ODEyMzIsImlhdCI6MTQ3ODYyMTIzMiwiZW1haWwiOiJqb2huU21pdGhAZXhhbXBsZS5jb20iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDQuZ29vZ2xldXNlcmNvbnRlbnQuY29tLy1BQkZGazhDekUway9BQUFBQUFBQUFBSS9BQUFBQUFBQUFSNC9PS0VYZS1Kemthcy9waG90by5qcGcifQ.cp53OOXDSi1L1OKZqMSORVGQ57V81syHVNJc47RJ7Bg"

#-H "Authorization: $BEARER" \
curl $DOMAIN/api/v2/processQuery \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-X POST \
-d @processQuery.json