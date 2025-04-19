#!/bin/bash

# Run database migrations if needed
alembic upgrade head

# Start the FastAPI application
# This will serve both the API and the static frontend files
python -m src.main