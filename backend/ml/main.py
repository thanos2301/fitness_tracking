from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import mediapipe as mp
from fastapi.responses import JSONResponse
import io
from PIL import Image
from typing import Dict, Any

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Mediapipe Pose
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# Global state for rep counting
exercise_states: Dict[str, Dict[str, Any]] = {}

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    return 360 - angle if angle > 180.0 else angle

@app.get("/")
async def root():
    return {"message": "ML Service is running"}

@app.post("/process")
async def process_frame(file: UploadFile = File(...), exercise: str = "squat"):
    try:
        print(f"Processing {exercise} exercise frame")  # Debug log
        
        # Read and process the image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Convert to RGB for mediapipe
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = pose.process(image_rgb)

        if not results.pose_landmarks:
            return JSONResponse(content={
                "exercise": exercise,
                "form_feedback": "No person detected",
                "rep_count": exercise_states.get(exercise, {}).get('count', 0),
                "stage": "unknown",
                "prev_stage": "unknown"
            })

        # Initialize or get exercise state
        if exercise not in exercise_states:
            exercise_states[exercise] = {
                'count': 0,
                'stage': 'up',
                'prev_stage': 'up',
                'last_angle': 0
            }

        state = exercise_states[exercise]
        prev_stage = state['stage']  # Store previous stage
        landmarks = results.pose_landmarks.landmark

        # Exercise-specific processing
        if exercise == "bicep":
            # Use right arm for bicep curls
            shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                       landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
            elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                    landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
            wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                    landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]
            
            angle = calculate_angle(shoulder, elbow, wrist)
            
            # Update stage and count
            if angle > 150 and state['stage'] == 'up':
                state['stage'] = 'down'
            elif angle < 50 and state['stage'] == 'down':
                state['stage'] = 'up'
                if prev_stage == 'down':  # Only increment if coming from down position
                    state['count'] += 1
            
            form_feedback = "Good form" if 30 < angle < 160 else "Keep your elbow steady"

        elif exercise == "pushup":
            shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                       landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
            elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                    landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
            wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                    landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]
            
            angle = calculate_angle(shoulder, elbow, wrist)
            
            if angle > 160 and state['stage'] == 'down':
                state['stage'] = 'up'
                state['count'] += 1
            elif angle < 90 and state['stage'] == 'up':
                state['stage'] = 'down'
            
            form_feedback = "Good form" if 45 < angle < 160 else "Keep your body straight"

        elif exercise == "squat":
            hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                   landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
            knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
            ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
            
            angle = calculate_angle(hip, knee, ankle)
            
            if angle < 90 and state['stage'] == 'up':
                state['stage'] = 'down'
            elif angle > 160 and state['stage'] == 'down':
                state['stage'] = 'up'
                state['count'] += 1
            
            form_feedback = "Good form" if 60 < angle < 160 else "Adjust your squat depth"

        # Store previous stage
        state['prev_stage'] = prev_stage

        return JSONResponse(content={
            "exercise": exercise,
            "form_feedback": form_feedback,
            "rep_count": state['count'],
            "stage": state['stage'],
            "prev_stage": prev_stage
        })

    except Exception as e:
        print(f"Error processing frame: {str(e)}")
        return JSONResponse(
            content={"error": "Error processing frame", "details": str(e)},
            status_code=500
        )

@app.get("/reset/{exercise}")
async def reset_exercise(exercise: str):
    print(f"Resetting counter for {exercise}")  # Debug log
    if exercise in exercise_states:
        exercise_states[exercise] = {
            'count': 0,
            'stage': 'up',
            'prev_stage': 'up',
            'last_angle': 0
        }
    return {"message": f"Reset {exercise} counter"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
