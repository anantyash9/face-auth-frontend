import fastapi
import uvicorn
import requests
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import numpy as np
import cv2
import base64
import os

# a class store dataurl


class DataUrl(BaseModel):
    dataURL: str


app = fastapi.FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# post endpoint to accept dataurl


@app.post("/dataurl")
async def dataurl(dataURL: DataUrl):
    # get the dataurl and convert to base64
    strs = dataURL.dataURL.split(",")[1]
    # load the base64  image to opencv
    img = cv2.imdecode(np.frombuffer(base64.b64decode(strs), np.uint8), -1)
    cv2.imwrite("image.jpg", img)
    return {"message": "success"}

# get endpoint to open chrome browser and open localhost:4200


@app.get("/open")
async def open():
    os.system('open -a "Google Chrome" http://localhost:4200')
    return {"message": "success"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
