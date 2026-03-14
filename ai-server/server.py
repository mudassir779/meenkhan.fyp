from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import numpy as np
import cv2
from ultralytics import YOLO
import os

app = FastAPI(title="SAFORA AI Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "driver_training", "saved_models", "driver_behavior_4class_model.pt")
model = None

CLASS_NAMES = {0: "drowsy", 1: "distraction", 2: "drunk", 3: "normal"}
CLASS_MOODS = {
    "drowsy": {"mood": "Tired", "emoji": "😴", "alertness": "Low"},
    "distraction": {"mood": "Distracted", "emoji": "📱", "alertness": "Low"},
    "drunk": {"mood": "Impaired", "emoji": "⚠️", "alertness": "Critical"},
    "normal": {"mood": "Alert", "emoji": "😊", "alertness": "High"},
}


def get_model():
    global model
    if model is None:
        if os.path.exists(MODEL_PATH):
            model = YOLO(MODEL_PATH)
            print(f"Model loaded from {MODEL_PATH}")
        else:
            # Try alternative paths
            alt_paths = [
                "/Users/mudassir/driver_training/saved_models/driver_behavior_4class_model.pt",
                "/Users/mudassir/driver_training/runs/driver_behavior_4class_full/weights/best.pt",
            ]
            for p in alt_paths:
                if os.path.exists(p):
                    model = YOLO(p)
                    print(f"Model loaded from {p}")
                    break
            if model is None:
                print("WARNING: No model file found!")
    return model


class FrameRequest(BaseModel):
    image: str  # base64 encoded image


class PredictionResponse(BaseModel):
    success: bool
    prediction: str
    confidence: float
    mood: str
    emoji: str
    alertness: str
    eyes: str
    all_detections: list


@app.on_event("startup")
async def startup():
    get_model()


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict", response_model=PredictionResponse)
async def predict(req: FrameRequest):
    m = get_model()
    if m is None:
        return PredictionResponse(
            success=False,
            prediction="normal",
            confidence=0,
            mood="Unknown",
            emoji="❓",
            alertness="Unknown",
            eyes="Unknown",
            all_detections=[],
        )

    try:
        # Decode base64 image
        img_data = req.image
        if "," in img_data:
            img_data = img_data.split(",")[1]

        img_bytes = base64.b64decode(img_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return PredictionResponse(
                success=False, prediction="normal", confidence=0,
                mood="Alert", emoji="😊", alertness="High", eyes="Open",
                all_detections=[],
            )

        # Run inference
        results = m(img, imgsz=320, conf=0.5, verbose=False)

        all_detections = []
        best_class = "normal"
        best_conf = 0.0

        for r in results:
            if r.boxes is not None and len(r.boxes) > 0:
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    cls_name = CLASS_NAMES.get(cls_id, "unknown")
                    all_detections.append({
                        "class": cls_name,
                        "confidence": round(conf, 3),
                        "bbox": box.xyxy[0].tolist(),
                    })
                    if conf > best_conf:
                        best_conf = conf
                        best_class = cls_name

        mood_data = CLASS_MOODS.get(best_class, CLASS_MOODS["normal"])

        # Determine eyes state based on class
        eyes = "Open"
        if best_class == "drowsy" and best_conf > 0.7:
            eyes = "Closing"
        elif best_class == "drunk":
            eyes = "Impaired"

        return PredictionResponse(
            success=True,
            prediction=best_class,
            confidence=round(best_conf * 100, 1),
            mood=mood_data["mood"],
            emoji=mood_data["emoji"],
            alertness=mood_data["alertness"],
            eyes=eyes,
            all_detections=all_detections,
        )

    except Exception as e:
        print(f"Prediction error: {e}")
        return PredictionResponse(
            success=False, prediction="normal", confidence=0,
            mood="Alert", emoji="😊", alertness="High", eyes="Open",
            all_detections=[],
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
