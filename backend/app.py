from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
from werkzeug.utils import secure_filename
from simple_face_analyzer import SimpleFaceAnalyzer

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mov', 'avi', 'mkv'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024

# Create upload directories
os.makedirs(os.path.join(UPLOAD_FOLDER, 'images'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_FOLDER, 'videos'), exist_ok=True)

# Initialize analyzer
analyzer = SimpleFaceAnalyzer()

def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ML Backend is running!", "port": 5000, "method": "OpenCV Face Detection"})

@app.route('/api/upload-reference', methods=['POST'])
def upload_reference():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if file and allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS):
            filename = secure_filename(f"ref_{uuid.uuid4()}_{file.filename}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'images', filename)
            file.save(filepath)
            
            # Load reference face
            success, message = analyzer.load_reference_face(filepath)
            
            if success:
                return jsonify({
                    "success": True,
                    "message": message,
                    "filename": filename
                })
            else:
                return jsonify({"error": message}), 400
        else:
            return jsonify({"error": "Invalid file type"}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze-video', methods=['POST'])
def analyze_video():
    try:
        if 'video' not in request.files:
            return jsonify({"error": "No video file provided"}), 400
        
        file = request.files['video']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if file and allowed_file(file.filename, ALLOWED_VIDEO_EXTENSIONS):
            filename = secure_filename(f"video_{uuid.uuid4()}_{file.filename}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'videos', filename)
            file.save(filepath)
            
            print("🎬 Starting REAL face detection analysis...")
            result = analyzer.analyze_video(filepath)
            
            if "error" in result:
                return jsonify({"error": result["error"]}), 400
            
            return jsonify(result)
        else:
            return jsonify({"error": "Invalid file type"}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Criminal Identification Backend...")
    print("👤 Using OpenCV Face Detection (More Reliable)")
    print("🎯 Method: Haar Cascade + Template Matching")
    print("🌐 Backend running on: http://localhost:5000")
    app.run(debug=True, port=5000, host='0.0.0.0')
