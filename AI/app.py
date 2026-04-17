"""
================================================================================
   FLASK API SERVER
   ----------------
   Description: Exposes AI endpoints for Node.js Backend.
   Endpoints:
     - POST /get_embedding   (Registration)
     - POST /check_attendance (Attendance)
   
   Port: 5001 (Changed to avoid macOS AirPlay conflict)
================================================================================
"""

from flask import Flask, request, jsonify
from engine import FaceEngine # Import logic from engine.py
import json
import sys
import io

# Initialize Flask
app = Flask(__name__)

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Initialize AI Engine (Loads Models immediately on startup)
try:
    engine = FaceEngine()
except Exception as e:
    print(f"CRITICAL: Could not start AI Engine. Error: {e}")
    sys.exit(1)

# ------------------------------------------------------------------------------
# ROUTE 1: REGISTER STUDENT
# Input: Single Photo (Multipart Form)
# Output: JSON { success: true, vector: [0.1, 0.2...] }
# ------------------------------------------------------------------------------
@app.route('/get_embedding', methods=['POST'])
def get_embedding():
    if 'image' not in request.files:
        return jsonify({"success": False, "error": "No image part in request"}), 400

    file = request.files['image']
    
    try:
        # Read file bytes directly (No saving to disk needed)
        image_bytes = file.read()
        
        vector = engine.get_single_embedding(image_bytes)
        
        if vector is None:
            return jsonify({"success": False, "error": "No face detected in photo"}), 400
            
        return jsonify({
            "success": True, 
            "vector": vector
        })

    except Exception as e:
        print(f"Error processing registration: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ------------------------------------------------------------------------------
# ROUTE 2: CHECK ATTENDANCE
# Input: 
#   - image: Group Photo (Multipart Form)
#   - students_data: JSON String of [{"roll": "101", "vector": [...]}, ...]
# Output: JSON { success: true, present_roll_nos: ["101", "105"] }
# ------------------------------------------------------------------------------
@app.route('/check_attendance', methods=['POST'])
def check_attendance():
    if 'image' not in request.files:
        return jsonify({"success": False, "error": "No image provided"}), 400
            
    # We now look for classId instead of students_data
    class_id = request.form.get('classId')
    if not class_id:
        return jsonify({"success": False, "error": "No classId provided"}), 400

    try:
        file = request.files['image']
        image_bytes = file.read()
        
        # Calling the engine which now returns a dictionary
        result = engine.recognize_faces_in_group(image_bytes, class_id)
        
        # result is {"present_rolls": [...], "total_fetched": X}
        return jsonify({
            "success": True,
            "present_roll_nos": result.get("present_rolls", []),
            "total_students_fetched": result.get("total_fetched", 0)
        })
    except Exception as e:
        print(f"Error checking attendance: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ------------------------------------------------------------------------------
# SERVER STARTUP
# ------------------------------------------------------------------------------
if __name__ == '__main__':
    # We use Port 5001 to avoid the "Address already in use" error
    PORT = 5001
    
    print("\n" + "="*50)
    print(f"🔥 PYTHON AI SERVER STARTED ON PORT {PORT}")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=PORT, debug=True)
