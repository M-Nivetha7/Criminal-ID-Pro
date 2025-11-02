# Face Recognition in Video

Real-time face detection and recognition system using OpenCV and deep learning. Upload a reference image and analyze videos to find matching faces with timestamps.

## Quick Start

You'll need two terminal windows:
- Terminal A: Python/Flask backend
- Terminal B: React frontend

### 1. Setup & Run Backend

```bash
# Go to project root
cd "/Users/nivetham/Documents/face identification in video"

# Create Python virtual environment (run once)
python3 -m venv .venv

# Activate virtual environment (run every new terminal)
source .venv/bin/activate

# Install Python dependencies (run once)
pip install --upgrade pip
pip install -r backend/requirements.txt

# Start the Flask backend
cd backend
python3 app.py
```

The backend should show:
- "🚀 Starting Criminal Identification Backend..."
- "🌐 Backend running on: http://localhost:5000"

### 2. Run Frontend

In a new terminal:

```bash
# Go to project root
cd "/Users/nivetham/Documents/face identification in video"

# Install Node dependencies (run once)
npm install

# Start React development server
npm start
```

The UI will open at http://localhost:3000

### 3. Quick API Tests

With backend running, you can test the endpoints:

```bash
# Health check
curl -v http://localhost:5000/api/health

# Upload reference image (required before analysis)
curl -v -X POST -F "image=@/path/to/reference.jpg" http://localhost:5000/api/upload-reference

# Analyze video (after reference upload)
curl -v -X POST -F "video=@/path/to/video.mp4" http://localhost:5000/api/analyze-video
```

### Usage Flow

1. Start both backend (Terminal A) and frontend (Terminal B)
2. Open http://localhost:3000 in your browser
3. Upload a reference face image (clear, front-facing photo)
4. Upload a video to analyze
5. View results with timestamps and confidence scores

## Troubleshooting

### Backend Issues

- "ModuleNotFoundError": Make sure to run `python3 app.py` from inside the `backend/` directory
- Port 5000 in use: The backend will try the next available port automatically
- Upload errors: Check terminal A for detailed error messages (e.g., "No face detected", "Face too small")
- Large files fail: Default limit is 100MB. To increase, edit MAX_CONTENT_LENGTH in `backend/app.py`

### Frontend Issues

- "Failed to fetch": Ensure backend is running (Terminal A) and accessible
- HTTP 400 errors: The UI now shows the backend's error message (e.g., "Please upload reference first")
- Form field names must be exactly:
  - Reference upload: field name "image"
  - Video upload: field name "video"

### Quick Verification Script

Test all endpoints with one command (backend must be running):

```bash
cd "/Users/nivetham/Documents/face identification in video/backend"
source ../.venv/bin/activate
python3 test_api.py
```

## Dependencies

### Backend
- Flask
- OpenCV
- NumPy
- PyTorch (optional, for FaceNet embeddings)
- facenet-pytorch (optional, for better accuracy)

### Frontend
- React
- axios
- framer-motion
- chart.js

## File Structure

```
.
├── backend/               # Flask server
│   ├── app.py            # Main backend entry
│   ├── simple_face_analyzer.py  # Face detection/matching
│   └── requirements.txt  # Python dependencies
├── src/                  # React frontend
│   ├── components/       # UI components
│   └── pages/           # React pages/routes
└── package.json         # Node dependencies
```# FACE_TRACE
# FACE_TRACE
