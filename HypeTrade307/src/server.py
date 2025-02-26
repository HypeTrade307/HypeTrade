from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend"))) # increasing visibility!
import search_users as su
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Union
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

class InputData(BaseModel):
    text: str


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins (change this in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    text: str

@app.post("/process")
def process_text(data: InputData) -> List[str]:  # allow int values
    return su.search(data.text)