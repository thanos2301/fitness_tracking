import cv2
import mediapipe as mp
import numpy as np
import json
import sys

def analyze_form(exercise_type):
    # Initialize Mediapipe Pose
    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils

    cap = cv2.VideoCapture(0)  # Open webcam

    # Function to calculate angle between three points
    def calculate_angle(a, b, c):
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)

        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
        angle = np.abs(radians * 180.0 / np.pi)

        if angle > 180.0:
            angle = 360 - angle

        return angle

    feedback = []
    
    # Start Pose Estimation
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Convert to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = pose.process(frame_rgb)

            if result.pose_landmarks:
                landmarks = result.pose_landmarks.landmark

                if exercise_type.lower() == 'squat':
                    hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x, 
                          landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
                    knee = [landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].x, 
                           landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].y]
                    ankle = [landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].x, 
                            landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y]

                    knee_angle = calculate_angle(hip, knee, ankle)
                    
                    feedback_data = {
                        "exercise": "squat",
                        "angle": knee_angle,
                        "feedback": get_squat_feedback(knee_angle)
                    }
                    feedback.append(feedback_data)

                elif exercise_type.lower() == 'curl':
                    shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                              landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
                    elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                            landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
                    wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                            landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]

                    elbow_angle = calculate_angle(shoulder, elbow, wrist)
                    
                    feedback_data = {
                        "exercise": "curl",
                        "angle": elbow_angle,
                        "feedback": get_curl_feedback(elbow_angle)
                    }
                    feedback.append(feedback_data)

                elif exercise_type.lower() == 'pushup':
                    shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                              landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
                    elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                            landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
                    wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                            landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]

                    pushup_angle = calculate_angle(shoulder, elbow, wrist)
                    
                    feedback_data = {
                        "exercise": "pushup",
                        "angle": pushup_angle,
                        "feedback": get_pushup_feedback(pushup_angle)
                    }
                    feedback.append(feedback_data)

            if cv2.waitKey(10) & 0xFF == ord('q'):
                break

    cap.release()
    cv2.destroyAllWindows()
    
    return feedback

def get_squat_feedback(angle):
    if angle > 160:
        return {"message": "Stand Tall", "status": "good"}
    elif angle < 90:
        return {"message": "Too Low!", "status": "bad"}
    else:
        return {"message": "Good Squat", "status": "perfect"}

def get_curl_feedback(angle):
    if angle > 150:
        return {"message": "Arm Extended", "status": "good"}
    elif angle < 50:
        return {"message": "Curl Complete!", "status": "perfect"}
    else:
        return {"message": "Keep Curling!", "status": "progress"}

def get_pushup_feedback(angle):
    if angle > 160:
        return {"message": "Up Position", "status": "good"}
    elif angle < 90:
        return {"message": "Push-Up Done!", "status": "perfect"}
    else:
        return {"message": "Going Down...", "status": "progress"}

if __name__ == "__main__":
    exercise_type = sys.argv[1]
    feedback = analyze_form(exercise_type)
    print(json.dumps(feedback)) 