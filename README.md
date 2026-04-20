# 🎯 AttendAI: Privacy-Centric AI Attendance Monitoring System

## 📌 Overview
Manual attendance systems are inefficient and prone to proxy marking and human error. AttendAI presents a privacy-first automated biometric attendance system that replaces manual roll calls with high-speed deep learning.

The system integrates advanced object detection with cheat-proof biometric verification, achieving ~98% accuracy even in challenging, crowded classroom environments.

---

## 🚀 Key Features

- **Privacy-By-Design Architecture**  
  Ensures student privacy by offloading biometric processing and avoiding raw image storage.

- **Real-Time Multi-Student Detection**  
  Identifies dozens of students simultaneously, even with partial occlusions or varied seating angles.

- **High-Accuracy Recognition (~98%)**  
  Uses discriminative power to separate students with similar facial features.

- **Handles Large Classrooms**  
  Optimized for detecting small faces in high-density environments using a single forward pass.

- **Automated Marking & Reporting**  
  Generates attendance documents in real-time upon matching faces against the database.

- **Secure Class Management**  
  Features unique Class ID generation for student enrollment and teacher-led management.

---

## 🔒 Privacy & Security Framework

AttendAI is built with a **Privacy-First philosophy** to protect student biometric data:

- **Mathematical Anonymization**  
  Faces are converted into a 512-dimensional floating-point vector instead of storing images.

- **One-Way Mapping**  
  Each student is mapped to a unique point in a 512-D hyperspace, making reconstruction impossible.

- **Biometric Offloading**  
  Raw image processing happens locally in the Python edge service; only embeddings are sent to backend.

- **Secure Database Design**  
  MongoDB stores face embeddings and class structures without complex relational dependencies.

---

## 🧠 How it Works (Core Functioning)

AttendAI operates through a four-stage pipeline:

### 1. Image Acquisition & Preprocessing
A teacher uploads a classroom image via the React frontend. The Node.js backend handles the request and fetches student embeddings for the class.

### 2. Spatial Face Detection (YOLOv8)
The image is processed using YOLOv8, which detects multiple faces in a single forward pass using grid-based spatial regression.

### 3. Biometric Feature Extraction (ArcFace)
Detected faces are passed through ArcFace, which generates 512-D embeddings using deep CNN-based feature extraction with angular margin loss for better separability.

### 4. Vector Matching & Attendance Logging
Embeddings are compared using Cosine Similarity / Euclidean Distance. If similarity exceeds threshold (e.g., 0.40), attendance is marked and stored in MongoDB.

---

## 🏗️ System Architecture

## ⚙️ Phase 1: AI Engine (Python)
- Handles deep learning workloads
- Uses OpenCV, NumPy, InsightFace
- Performs YOLOv8 detection + ArcFace embedding

---

## 🌐 Phase 2: Backend (Node.js & MongoDB)
- Scalable API architecture
- Handles class management and attendance logs
- Stores 512-D embeddings efficiently
- Supports async scaling (e.g., RabbitMQ integration)

---

## 💻 Phase 3: Frontend (React)
- Simple interface for teachers and students
- Upload images for attendance marking
- Real-time detection results display

---

## 📧 Contact & Suggestions

For technical support, collaboration, or suggestions:

- 📩 Email: attendai.eight@gmail.com  
