from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import traceback
from engine import FaceEngine

# Initialize FastAPI
app = FastAPI(title="AI Attendance API")

# Allow your Node.js backend to talk to this API securely (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load AI Engine
print("Loading AI Engine...")
try:
    engine = FaceEngine()
except Exception as e:
    print(f"CRITICAL ERROR LOADING ENGINE: {e}")

@app.post("/get_embedding")
async def get_embedding(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        vector = engine.get_single_embedding(image_bytes)
        
        if vector is None:
            raise HTTPException(status_code=400, detail="No face detected in photo")
            
        return {"success": True, "vector": vector}
        
    except Exception as e:
        print(f"Error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/check_attendance")
async def check_attendance(image: UploadFile = File(...), students_data: str = Form(...)):
    try:
        image_bytes = await image.read()
        
        try:
            students_list = json.loads(students_data)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in students_data")
            
        if not students_list:
            return {"success": True, "present_roll_nos": []}

        # Run AI Recognition
        present_rolls = engine.recognize_faces_in_group(image_bytes, students_list)
        
        return {
            "success": True,
            "present_roll_nos": present_rolls
        }

    except Exception as e:
        print(f"Error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
