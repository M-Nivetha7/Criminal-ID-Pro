import cv2
import numpy as np
import torch
import torchvision
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
import os
from sklearn.metrics.pairwise import cosine_similarity
import warnings
warnings.filterwarnings('ignore')

class RealFaceRecognizer:
    def __init__(self):
        # Initialize MTCNN for face detection
        self.mtcnn = MTCNN(
            image_size=160, 
            margin=20, 
            min_face_size=40,
            thresholds=[0.6, 0.7, 0.7], 
            factor=0.709,
            post_process=True,
            device='cpu'
        )
        
        # Initialize FaceNet for face recognition
        self.facenet = InceptionResnetV1(pretrained='vggface2').eval()
        
        self.reference_embedding = None
        self.similarity_threshold = 0.7  # Cosine similarity threshold
        
        print("🤖 Deep Learning Face Recognition Model Loaded!")
        print("🔬 Using MTCNN + FaceNet (VGGFace2)")
        
    def get_face_embedding(self, image_path):
        """Extract face embedding using FaceNet"""
        try:
            # Load image
            img = Image.open(image_path).convert('RGB')
            
            # Detect face and get embedding
            face = self.mtcnn(img)
            
            if face is None:
                return None, "No face detected"
            
            # Get embedding
            with torch.no_grad():
                embedding = self.facenet(face.unsqueeze(0))
            
            return embedding[0].numpy(), "Success"
            
        except Exception as e:
            return None, f"Error: {str(e)}"
    
    def load_reference_face(self, image_path):
        """Load reference face and extract embedding"""
        try:
            print(f"🔍 Loading reference face: {os.path.basename(image_path)}")
            
            embedding, message = self.get_face_embedding(image_path)
            
            if embedding is None:
                return False, message
            
            self.reference_embedding = embedding
            print(f"✅ Reference face embedding extracted successfully!")
            print(f"📐 Embedding dimension: {embedding.shape}")
            return True, "Reference face loaded successfully"
            
        except Exception as e:
            return False, f"Error loading reference: {str(e)}"
    
    def recognize_face_in_frame(self, frame):
        """Recognize face in a video frame"""
        try:
            if self.reference_embedding is None:
                return 0, "No reference"
            
            # Convert frame to PIL Image
            pil_image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            
            # Detect face and get embedding
            face = self.mtcnn(pil_image)
            
            if face is None:
                return 0, "No face detected"
            
            # Get embedding for detected face
            with torch.no_grad():
                current_embedding = self.facenet(face.unsqueeze(0))[0].numpy()
            
            # Calculate cosine similarity
            similarity = cosine_similarity(
                [self.reference_embedding], 
                [current_embedding]
            )[0][0]
            
            return similarity, "Success"
            
        except Exception as e:
            return 0, f"Recognition error: {str(e)}"
    
    def analyze_video_properly(self, video_path):
        """Analyze video with proper face recognition"""
        try:
            if self.reference_embedding is None:
                return {"error": "❌ No reference face loaded"}
            
            print(f"🎬 Starting PROPER face recognition analysis...")
            print(f"🎯 Similarity threshold: {self.similarity_threshold}")
            
            cap = cv2.VideoCapture(video_path)
            
            if not cap.isOpened():
                return {"error": "❌ Could not open video file"}
            
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            frame_count = 0
            true_matches = []
            all_faces_detected = 0
            different_people_detected = 0
            
            print(f"📊 Video info: {total_frames} frames, {fps:.1f} FPS")
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Process every 10th frame for performance
                if frame_count % 10 == 0:
                    # Recognize face in current frame
                    similarity, status = self.recognize_face_in_frame(frame)
                    
                    if "No face detected" not in status:
                        all_faces_detected += 1
                        
                        timestamp_seconds = frame_count / fps
                        timestamp = self.format_timestamp(timestamp_seconds)
                        
                        # Convert similarity to percentage
                        similarity_percent = similarity * 100
                        
                        if similarity >= self.similarity_threshold:
                            true_matches.append({
                                "time": timestamp,
                                "confidence": round(similarity_percent, 2),
                                "frame": frame_count,
                                "status": "✅ SAME PERSON"
                            })
                            print(f"🎯 ✅ SAME PERSON at {timestamp} - {similarity_percent:.1f}% similarity")
                        else:
                            different_people_detected += 1
                            if similarity > 0.3:  # Only log somewhat similar faces
                                print(f"❌ DIFFERENT PERSON at {timestamp} - {similarity_percent:.1f}% similarity")
                
                frame_count += 1
                
                # Show progress
                if frame_count % 100 == 0:
                    progress = (frame_count / total_frames) * 100
                    print(f"📈 Progress: {progress:.1f}% | Frames: {frame_count}/{total_frames} | Same Person: {len(true_matches)} | Different People: {different_people_detected}")
            
            cap.release()
            
            # Analysis summary
            result = {
                "matchFound": len(true_matches) > 0,
                "timestamps": true_matches,
                "totalFrames": frame_count,
                "totalFacesDetected": all_faces_detected,
                "targetDetections": len(true_matches),
                "differentPeopleDetected": different_people_detected,
                "analysisTime": f"Processed {frame_count} frames",
                "similarityThreshold": self.similarity_threshold,
                "method": "Deep Learning: MTCNN + FaceNet (VGGFace2)",
                "accuracyNote": f"Uses cosine similarity of face embeddings. {different_people_detected} different people detected."
            }
            
            print(f"\n📊 DEEP LEARNING ANALYSIS SUMMARY:")
            print(f"✅ Total frames processed: {frame_count}")
            print(f"👥 Total faces detected: {all_faces_detected}")
            print(f"🎯 Same person matches: {len(true_matches)}")
            print(f"🚫 Different people detected: {different_people_detected}")
            print(f"🎯 Final result: {'REFERENCE PERSON FOUND' if len(true_matches) > 0 else 'REFERENCE PERSON NOT FOUND'}")
            
            return result
            
        except Exception as e:
            return {"error": f"❌ Video analysis error: {str(e)}"}
    
    def format_timestamp(self, seconds):
        """Format seconds to HH:MM:SS"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        seconds = int(seconds % 60)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

# Simple fallback if deep learning fails
class SimpleFaceAnalyzer:
    def __init__(self):
        self.recognizer = RealFaceRecognizer()
    
    def load_reference_face(self, image_path):
        return self.recognizer.load_reference_face(image_path)
    
    def analyze_video(self, video_path):
        return self.recognizer.analyze_video_properly(video_path)