#!/bin/bash

echo "Stopping CyberLink..."

# Stop and remove containers
docker compose down

echo "CyberLink has been stopped."