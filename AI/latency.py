import time
import json
import numpy as np
from engine import FaceEngine
from sklearn.metrics.pairwise import cosine_similarity

class LatencyProfiler:
    def __init__(self):
        self.engine = FaceEngine()

    def measure_latency(self, image_bytes, students_list):
        timings = {}

        # --------------------------------------------------
        # 1. Image upload + preprocessing
        # --------------------------------------------------
        t0 = time.time()
        img = self.engine._preprocess(image_bytes)
        t1 = time.time()

        if img is None:
            raise ValueError("Image preprocessing failed")

        timings["image_upload_preprocessing"] = (t1 - t0)

        # --------------------------------------------------
        # 2. Face detection (SCRFD / YOLOv8-Face equivalent)
        # --------------------------------------------------
        t2 = time.time()
        faces = self.engine.app.get(img)
        t3 = time.time()

        timings["face_detection"] = (t3 - t2)

        if not faces:
            return timings, []

        # --------------------------------------------------
        # 3. Batch embedding extraction (ArcFace)
        # --------------------------------------------------
        t4 = time.time()
        embeddings = np.array([face.embedding for face in faces])
        t5 = time.time()

        timings["batch_embedding_extraction"] = (t5 - t4)

        # --------------------------------------------------
        # 4. Vector matching (Cosine similarity)
        # --------------------------------------------------
        t6 = time.time()

        known_vectors = np.array([s["vector"] for s in students_list])
        known_rolls = [s["roll"] for s in students_list]

        present_rolls = set()

        for emb in embeddings:
            sims = cosine_similarity(emb.reshape(1, -1), known_vectors)[0]
            idx = np.argmax(sims)
            if sims[idx] >= 0.40:
                present_rolls.add(known_rolls[idx])

        t7 = time.time()

        timings["vector_matching"] = (t7 - t6)

        return timings, list(present_rolls)

    # --------------------------------------------------
    # Pretty print for paper / report
    # --------------------------------------------------
    @staticmethod
    def print_report(timings):
        print("\n================ LATENCY BREAKDOWN ================\n")
        total = 0
        for k, v in timings.items():
            print(f"{k.replace('_',' ').title():35s}: {v:.4f} sec")
            total += v

        print("-" * 55)
        print(f"{'Total Latency':35s}: {total:.4f} sec")
        print("=" * 55 + "\n")


# --------------------------------------------------
# Example Usage
# --------------------------------------------------
if __name__ == "__main__":
    profiler = LatencyProfiler()

    # Load test image
    with open("group_photo.jpg", "rb") as f:
        image_bytes = f.read()

    # Load registered students
    with open("students.json", "r") as f:
        students_list = json.load(f)

    timings, present = profiler.measure_latency(image_bytes, students_list)

    profiler.print_report(timings)
    print("Present Students:", present)
