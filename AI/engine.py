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
    
    # GPU (CUDA) or CPU
    PROVIDERS = ["CUDAExecutionProvider", "CPUExecutionProvider"]

    # ArcFace similarity threshold
    SIMILARITY_THRESHOLD = 0.40


# ---------------- ENGINE ----------------
class FaceEngine:

    def __init__(self):

        logger.info("=" * 55)
        logger.info("🚀 INITIALIZING INSIGHTFACE ENGINE")
        logger.info("=" * 55)

        try:
            # SCRFD detection + ArcFace recognition
            self.app = FaceAnalysis(
                name="buffalo_l",
                providers=EngineConfig.PROVIDERS
            )

            # ctx_id = GPU index (0), use -1 for CPU
            self.app.prepare(ctx_id=0, det_size=(640, 640))

            logger.info("✅ Models Loaded: SCRFD + ArcFace")

        except Exception as e:
            logger.error(f"❌ AI Model Load Failed: {e}")
            raise e


    # --------------------------------------------------
    # IMAGE PREPROCESSING
    # --------------------------------------------------

    def _preprocess(self, image_bytes):

        try:

            # convert bytes -> numpy
            nparr = np.frombuffer(image_bytes, np.uint8)

            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

            return img

        except Exception as e:

            logger.error(f"Image processing failed: {e}")
            return None


    # --------------------------------------------------
    # REGISTRATION MODE
    # --------------------------------------------------

    def get_single_embedding(self, image_bytes):

        start = time.time()

        img = self._preprocess(image_bytes)

        if img is None:
            return None

        faces = self.app.get(img)

        if not faces:
            logger.warning("Registration failed: No face detected.")
            return None

        # choose largest face
        faces = sorted(
            faces,
            key=lambda x: (x.bbox[2]-x.bbox[0])*(x.bbox[3]-x.bbox[1]),
            reverse=True
        )

        embedding = faces[0].embedding.tolist()

        duration = (time.time()-start)*1000

        logger.info(f"⚡ Registration Vector Generated in {duration:.2f} ms")

        return embedding


    # --------------------------------------------------
    # ATTENDANCE MODE
    # --------------------------------------------------

    def recognize_faces_in_group(self, image_bytes, known_students):

        overall_start = time.time()

        latency = {}

        # -----------------------------
        # PREPROCESSING
        # -----------------------------
        t0 = time.time()

        img = self._preprocess(image_bytes)

        latency["preprocessing"] = (time.time()-t0)*1000

        if img is None:
            return []


        # -----------------------------
        # FACE DETECTION + ALIGNMENT
        # -----------------------------
        t0 = time.time()

        faces = self.app.get(img)

        latency["face_detection_alignment"] = (time.time()-t0)*1000

        if not faces:
            logger.info("No faces detected in group photo.")
            return []

        logger.info(f"📸 Detected {len(faces)} faces.")

        if not known_students:
            return []


        # -----------------------------
        # BATCH EMBEDDING EXTRACTION
        # -----------------------------
        t0 = time.time()

        embeddings = []
        for face in faces:
            embeddings.append(face.embedding)

        latency["embedding_extraction_batch"] = (time.time()-t0)*1000


        # -----------------------------
        # VECTOR MATCHING
        # -----------------------------
        t0 = time.time()

        known_vectors = np.array([s["vector"] for s in known_students])
        known_rolls = [s["roll"] for s in known_students]

        present_rolls = set()

        for emb in embeddings:

            current_emb = emb.reshape(1, -1)

            similarities = cosine_similarity(current_emb, known_vectors)[0]

            best_idx = np.argmax(similarities)

            best_score = similarities[best_idx]

            if best_score >= EngineConfig.SIMILARITY_THRESHOLD:

                matched_roll = known_rolls[best_idx]

                present_rolls.add(matched_roll)

        latency["vector_matching"] = (time.time()-t0)*1000


        # -----------------------------
        # TOTAL TIME
        # -----------------------------
        latency["total"] = (time.time()-overall_start)*1000


        # -----------------------------
        # PRINT LATENCY
        # -----------------------------
        logger.info("----- LATENCY (ms) -----")

        for k, v in latency.items():

            logger.info(f"{k:25s}: {v:.2f}")


        return list(present_rolls)
