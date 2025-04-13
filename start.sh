#!/bin/bash

# Start frontend in background
cd /app/HypeTrade307
npm run build  # Build the frontend for production

# For production, we'll serve the built files using a simple server
npm install -g serve
serve -s dist -l 5173 &

# Go back to main directory and start the backend
cd /app
python -m src.main