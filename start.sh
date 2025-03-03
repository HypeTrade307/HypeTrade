#! /bin/bash

npm install
npm run dev
uvicorn src.main:app --host 0.0.0.0 --port 8080