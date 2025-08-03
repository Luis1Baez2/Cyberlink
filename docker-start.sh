#!/bin/bash

echo "Starting CyberLink with Docker..."

# Check if .env file exists, if not create from example
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env file to set your JWT_SECRET and other configurations"
fi

# Create necessary directories
mkdir -p data uploads backups

# Start services
docker compose up -d

echo "CyberLink is starting..."
echo "Application will be available at http://localhost:5051"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop: docker compose down"