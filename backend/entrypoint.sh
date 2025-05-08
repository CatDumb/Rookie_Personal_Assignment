#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z database 5432; do
  sleep 0.1
done
echo "Database is up and running!"

# Apply database migrations
echo "Running database migrations..."
alembic upgrade head

# Seed the database if it hasn't been seeded before
if [ ! -f /app/.db_seeded ]; then
    echo "Seeding database..."
    python dataseed.py
    touch /app/.db_seeded
    echo "Database seeded successfully!"
else
    echo "Database already seeded, skipping..."
fi

# Start the application
echo "Starting application..."
exec "$@"
