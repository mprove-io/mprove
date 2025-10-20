#!/bin/bash

# Universal script to start Docker Compose services and follow their logs

# Check if at least one service is provided as an argument
if [ $# -eq 0 ]; then
  echo "Usage: $0 <service1> <service2> <service3> ..."
  echo "Example: $0 db rabbit valkey dwh-postgres"
  exit 1
fi

# Define the Docker Compose files
COMPOSE_FILES="-f docker-compose.yml -f docker-compose.lab.yml"

# Get the services from arguments
SERVICES="$@"

# Start the services in detached mode
echo "Starting services: $SERVICES"
docker compose $COMPOSE_FILES up -d $SERVICES

# Check if the 'up' command was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to start services: $SERVICES"
  exit 1
fi

# Follow the logs for the specified services
echo "Following logs for services: $SERVICES"
docker compose $COMPOSE_FILES logs -f $SERVICES

# Check if the 'logs' command was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to follow logs for services: $SERVICES"
  exit 1
fi