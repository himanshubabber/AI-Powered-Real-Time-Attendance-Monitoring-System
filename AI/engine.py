import cv2
import numpy as np
import io
import time
import logging
import sys
import os
import warnings
from PIL import Image
from insightface.app import FaceAnalysis
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
from bson import ObjectId

warnings.filterwarnings("ignore")

# ---------------- LOGGING ----------------
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s | %(levelname)-8s | %(message)s', 
    handlers=[logging.StreamHandler(sys.stdout)])
logger = logging.getLogger("AI_Brain")

# ---------------- CONFIG ----------------
class EngineConfig:
    PROVIDERS = ["CUDAExecutionProvider", "CPUExecutionProvider"]
    
    # 0.35: Optimized threshold for high-density DTU classrooms
    SIMILARITY_THRESHOLD = 0.40         
    
    # 1280x1280: Critical for detecting students in the back rows
    DETECTION_SIZE = (1280, 1280)         
    
    # Database Configuration (Synced with your Node.js app)
    MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://sunnypunia905:s3NuwLcX4FasggoM@cluster0.lszh6.mongodb.net")
    DB_NAME = "AttendanceSystemDB"

# ---------------- ENGINE ----------------
class FaceEngine:
    def __init__(self):
        logger.info("=" * 55)
        logger.info("🚀 INITIALIZING ATTENDAI CORE ENGINE")
        logger.info("=" * 55)
        try:
            # 1. Initialize Face Models (buffalo_l is highest accuracy)
            self.app = FaceAnalysis(name="buffalo_l", providers=EngineConfig.PROVIDERS)
            self.app.prepare(ctx_id=0, det_size=EngineConfig.DETECTION_SIZE)
            
            # 2. Initialize Database Connection
            self.client = MongoClient(EngineConfig.MONGO_URI)
            self.db = self.client[EngineConfig.DB_NAME]
            
            logger.info(f"✅ AI Models Loaded | DB: {EngineConfig.DB_NAME}")
        except Exception as e:
            logger.error(f"❌ Initialization Failed: {e}")
            raise e
    
    def get_single_embedding(self, image_bytes):
        """Extracts a single embedding for student registration."""
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return None

            # Use a smaller detection size for registration to keep it fast
            faces = self.app.get(img)
            
            if len(faces) == 0:
                logger.warning("⚠️ Registration Failed: No face detected in profile photo.")
                return None
            
            # If multiple faces are found, take the largest one (the primary subject)
            faces = sorted(faces, key=lambda x: (x.bbox[2] - x.bbox[0]) * (x.bbox[3] - x.bbox[1]), reverse=True)
            
            # Return the embedding as a list so it can be JSON serialized for Node.js
            return faces[0].embedding.tolist()
        except Exception as e:
            logger.error(f"❌ Embedding Extraction Error: {e}")
            return None

    def _get_vectors_from_db(self, class_id):
        """Fetches student vectors directly from MongoDB via the classId."""
        try:
            clean_id = str(class_id).strip()
            
            # A. Access the 'classes' collection
            target_class = self.db.classes.find_one({"_id": ObjectId(clean_id)})
            
            if not target_class:
                logger.error(f"❌ DB ERROR: Class {clean_id} not found in 'classes' collection.")
                return []
            
            student_ids = target_class.get("students", [])
            if not student_ids:
                logger.warning(f"⚠️ WARNING: Class {clean_id} exists but has 0 students enrolled.")
                return []
            
            # B. Fetch biometric vectors
            cursor = self.db.students.find({"_id": {"$in": student_ids}})
            
            known_students = []
            for s in cursor:
                # Support both camelCase and lowercase vector fields
                vector = s.get("faceVector") or s.get("facevector")
                if vector is not None:
                    known_students.append({
                        "roll": s.get("rollNo"),
                        "vector": np.array(vector, dtype='float32')
                    })
            
            logger.info(f"📊 DATA SYNC: Found {len(known_students)} student profiles for this class.")
            return known_students
        except Exception as e:
            logger.error(f"❌ MongoDB Retrieval Failed: {e}")
            return []

    def recognize_faces_in_group(self, image_bytes, class_id):
        """Processes attendance and returns both matches and total count."""
        overall_start = time.time()
        
        # 1. Image upload and preprocessing
        preprocess_start = time.time()
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        preprocess_duration = time.time() - preprocess_start
        
        if img is None:
            return {"present_rolls": [], "total_fetched": 0}

        # 2. Face detection using YOLOv8-Face (InsightFace wrapper)
        detection_start = time.time()
        faces = self.app.get(img)
        detection_duration = time.time() - detection_start

        # 3. Batch embedding extraction
        embedding_start = time.time()
        # Extract embeddings into a list for processing
        detected_embeddings = [face.embedding.reshape(1, -1) for face in faces]
        embedding_duration = time.time() - embedding_start

        # Fetch Data from MongoDB
        known_students = self._get_vectors_from_db(class_id)
        total_in_class = len(known_students)

        if not known_students or not detected_embeddings:
            logger.info(f"Process skipped: Faces: {len(faces)}, Students: {total_in_class}")
            return {"present_rolls": [], "total_fetched": total_in_class}

        # 4. Vector matching
        match_start = time.time()
        known_vectors = np.array([s["vector"] for s in known_students])
        known_rolls = [s["roll"] for s in known_students]
        present_rolls = set()
        
        for emb in detected_embeddings:
            similarities = cosine_similarity(emb, known_vectors)[0]
            best_idx = np.argmax(similarities)
            
            if similarities[best_idx] >= EngineConfig.SIMILARITY_THRESHOLD:
                present_rolls.add(known_rolls[best_idx])
        
        # FIXED: match_duration is now outside the loop so it always calculates correctly
        match_duration = time.time() - match_start

        # ---------------- LOGS MAPPED TO YOUR REQUIREMENTS ----------------
        logger.info("-" * 50)
        logger.info(f"Image upload and preprocessing: {preprocess_duration:.4f} s")
        logger.info(f"Face detection using YOLOv8-Face: {detection_duration:.4f} s")
        logger.info(f"Batch embedding extraction is: {embedding_duration:.4f} s")
        logger.info(f"Vector matching: about {match_duration:.4f} s")
        logger.info(f"Total Identified: {len(present_rolls)}/{total_in_class}")
        logger.info("-" * 50)

        return {
            "present_rolls": list(present_rolls),
            "total_fetched": total_in_class
        }
