#! /bin/bash

npm install
npm run dev
echo HELLOOOOOO
#uvicorn HypeTrade307.src.server:app --reload --host 0.0.0.0 --port 8080
uvicorn src.main:app --host 0.0.0.0 --port 8080