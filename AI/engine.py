"""
================================================================================
   DEEP LEARNING BIOMETRIC ENGINE (INSIGHTFACE: SCRFD + ARCFACE)
================================================================================
   Dependencies: 
     pip install insightface onnxruntime-gpu opencv-python numpy scikit-learn
"""

import cv2
import numpy as np
import io
import time
import logging
import sys
import warnings
from PIL import Image
from insightface.app import FaceAnalysis
from sklearn.metrics.pairwise import cosine_similarity

warnings.filterwarnings("ignore")

# ---------------- LOGGING ----------------
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("AI_Brain")

# ---------------- CONFIG ----------------
class EngineConfig:
    # 'cuda' for NVIDIA GPU, 'coreml' for Mac M1/M2, 'cpu' for others
    PROVIDERS = ["CUDAExecutionProvider", "CPUExecutionProvider"]
    
    # Cosine Similarity Threshold (0.0 to 1.0)
    # Higher = Stricter match. 0.40 - 0.50 is standard for ArcFace.
    SIMILARITY_THRESHOLD = 0.40 

# ---------------- ENGINE ----------------
class FaceEngine:

    def __init__(self):
        logger.info("=" * 55)
        logger.info(f"🚀 INITIALIZING INSIGHTFACE ENGINE")
        logger.info("=" * 55)

        try:
            # Load SCRFD (Detection) + ArcFace (Recognition)
            # name='buffalo_l' is the robust model pack (Detection: SCRFD, Rec: ResNet50)
            self.app = FaceAnalysis(name="buffalo_l", providers=EngineConfig.PROVIDERS)
            
            # ctx_id=0 sets GPU index (use -1 for CPU)
            self.app.prepare(ctx_id=0, det_size=(640, 640))
            
            logger.info("✅ Models Loaded: SCRFD (Detect) + ArcFace (Recognize)")
        except Exception as e:
            logger.error(f"❌ Critical Error Loading AI: {e}")
            raise e

    # --------------------------------------------------
    def _preprocess(self, image_bytes):
        """
        Decodes bytes to OpenCV BGR format (Required for InsightFace)
        """
        try:
            # 1. Decode bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            
            # 2. Decode to image
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # 3. Handle case where decoding fails
            if img is None:
                # Fallback for some image formats
                image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
                
            return img
        except Exception as e:
            logger.error(f"Image processing failed: {e}")
            return None

    # --------------------------------------------------
    def get_single_embedding(self, image_bytes):
        """
        REGISTRATION MODE: Returns 512-D vector for the largest face.
        """
        start = time.time()
        img = self._preprocess(image_bytes)
        if img is None: return None

        # InsightFace handles Detection + Alignment + Embedding automatically
        faces = self.app.get(img)

        if not faces:
            logger.warning("Registration failed: No face detected.")
            return None
        
        # Sort by size (largest face first) just in case
        faces = sorted(faces, key=lambda x: (x.bbox[2]-x.bbox[0]) * (x.bbox[3]-x.bbox[1]), reverse=True)
        
        # Extract embedding (Normalised 512-D vector)
        embedding = faces[0].embedding.tolist()
        
        duration = (time.time()-start)*1000
        logger.info(f"⚡ Registration Vector Generated in {duration:.2f}ms")

        return embedding

    # --------------------------------------------------
    def recognize_faces_in_group(self, image_bytes, known_students):
        """
        ATTENDANCE MODE: Detects all faces -> Matches with database
        """
        overall_start = time.time()
        img = self._preprocess(image_bytes)
        if img is None: return []

        # 1. Detect & Recognize All Faces
        faces = self.app.get(img)
        
        if not faces:
            logger.info("No faces detected in group photo.")
            return []

        logger.info(f"📸 Detected {len(faces)} faces.")

        if not known_students:
            return []

        # 2. Prepare Database Matrix
        known_vectors = np.array([s["vector"] for s in known_students])
        known_rolls = [s["roll"] for s in known_students]
        
        present_rolls = set()

        # 3. Batch Compare
        for i, face in enumerate(faces):
            # Reshape for sklearn (1, 512)
            current_emb = face.embedding.reshape(1, -1)
            
            # Calculate Cosine Similarity against ALL students
            similarities = cosine_similarity(current_emb, known_vectors)[0]
            
            # Find Best Match
            best_idx = np.argmax(similarities)
            best_score = similarities[best_idx]
            
            if best_score >= EngineConfig.SIMILARITY_THRESHOLD:
                matched_roll = known_rolls[best_idx]
                present_rolls.add(matched_roll)
                logger.info(f"   Face {i+1}: MATCH {matched_roll} (Conf: {best_score*100:.1f}%)")
            else:
                logger.info(f"   Face {i+1}: Unknown (Conf: {best_score*100:.1f}%)")

        total_time = (time.time() - overall_start) * 1000
        logger.info(f"🏁 Processed in {total_time:.2f}ms. Found {len(present_rolls)} students.")
        
        return list(present_rolls)
