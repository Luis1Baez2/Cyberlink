#!/bin/bash

echo "Fixing database permissions..."

# Stop containers
docker compose down

# Ensure directories exist with correct permissions
mkdir -p data uploads backups
chmod -R 777 data uploads backups

# Remove any existing database lock files
rm -f data/*.db-journal
rm -f data/*.db-wal
rm -f data/*.db-shm

# If database doesn't exist, create it
if [ ! -f data/cyberlink.db ]; then
    echo "Creating new database..."
    touch data/cyberlink.db
fi

# Set permissions
chmod 777 data/cyberlink.db

# Start containers
docker compose up -d

# Wait for initialization
sleep 5

# Check logs
echo "Checking application status..."
docker compose logs --tail=20 app