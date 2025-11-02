import face_recognition
import cv2
import numpy as np
import os
from sklearn.svm import SVC
from sklearn.preprocessing import LabelEncoder
import joblib

class FaceClassifier:
    def __init__(self):
        self.model = None
        self.label_encoder = LabelEncoder()
        self.reference_encoding = None
        self.reference_name = "target_person"
        self.model_path = "face_classifier_model.pkl"
        self.confidence_threshold = 0.6
        
    def train_classifier(self, reference_image_path):
        """Train ML classifier on the reference face"""
        try:
            print("Loading reference image for ML training...")
            reference_image = face_recognition.load_image_file(reference_image_path)
            reference_encodings = face_recognition.face_encodings(reference_image)
            
            if len(reference_encodings) == 0:
                return False, "No face found in reference image"
            
            self.reference_encoding = reference_encodings[0]
            print("Reference face encoded successfully")
            
            # Create training data
            X_train = [self.reference_encoding]
            y_train = [self.reference_name]
            
            # Add negative examples
            for i in range(3):
                noise = np.random.normal(0, 0.05, self.reference_encoding.shape)
                negative_encoding = self.reference_encoding + noise
                X_train.append(negative_encoding)
                y_train.append("unknown")
            
            X_train = np.array(X_train)
            y_train = np.array(y_train)
            
            # Train SVM classifier
            y_encoded = self.label_encoder.fit_transform(y_train)
            self.model = SVC(kernel='linear', probability=True, random_state=42)
            self.model.fit(X_train, y_encoded)
            
            # Save model
            model_data = {
                'model': self.model,
                'label_encoder': self.label_encoder,
                'reference_encoding': self.reference_encoding
            }
            joblib.dump(model_data, self.model_path)
            
            return True, "ML classifier trained successfully"
            
        except Exception as e:
            return False, f"Error training classifier: {str(e)}"
    
    def classify_face(self, face_encoding):
        """Classify if face matches reference"""
        try:
            if self.model is None:
                # Fallback to distance-based matching
                if self.reference_encoding is not None:
                    distance = face_recognition.face_distance([self.reference_encoding], face_encoding)[0]
                    confidence = max(0, 1 - distance)
                    is_match = confidence >= self.confidence_threshold
                    return is_match, confidence
                return False, 0
            
            # Use ML model
            probabilities = self.model.predict_proba([face_encoding])[0]
            predicted_class = self.model.predict([face_encoding])[0]
            predicted_label = self.label_encoder.inverse_transform([predicted_class])[0]
            
            confidence = probabilities[predicted_class]
            is_target_person = (predicted_label == self.reference_name)
            
            return is_target_person, confidence
            
        except Exception as e:
            print(f"Classification error: {e}")
            return False, 0
    
    def analyze_video(self, video_path):
        """Real ML analysis of video"""
        try:
            if self.reference_encoding is None:
                return {"error": "No reference face loaded"}
            
            print(f"Starting ML analysis of video: {video_path}")
            video_capture = cv2.VideoCapture(video_path)
            if not video_capture.isOpened():
                return {"error": "Could not open video file"}
            
            fps = video_capture.get(cv2.CAP_PROP_FPS)
            frame_count = 0
            matches = []
            total_faces_detected = 0
            
            while True:
                ret, frame = video_capture.read()
                if not ret:
                    break
                
                # Process every 3rd frame for performance
                if frame_count % 3 == 0:
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    
                    # Detect faces
                    face_locations = face_recognition.face_locations(rgb_frame, model="hog")
                    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
                    
                    total_faces_detected += len(face_encodings)
                    
                    for i, face_encoding in enumerate(face_encodings):
                        # Real ML classification
                        is_target_person, confidence = self.classify_face(face_encoding)
                        
                        if is_target_person and confidence >= self.confidence_threshold:
                            timestamp_seconds = frame_count / fps
                            timestamp = self.format_timestamp(timestamp_seconds)
                            
                            matches.append({
                                "time": timestamp,
                                "confidence": round(confidence * 100, 2),
                                "frame": frame_count
                            })
                            print(f"Match found at {timestamp} - Confidence: {confidence:.2f}")
                
                frame_count += 1
                
                # Show progress
                if frame_count % 30 == 0:
                    print(f"Processed {frame_count} frames... Found {len(matches)} matches")
            
            video_capture.release()
            
            result = {
                "matchFound": len(matches) > 0,
                "timestamps": matches,
                "totalFrames": frame_count,
                "totalFacesDetected": total_faces_detected,
                "targetDetections": len(matches),
                "confidenceThreshold": self.confidence_threshold * 100,
                "analysisTime": "Real ML Analysis Complete"
            }
            
            print(f"ML Analysis Complete: {len(matches)} target detections")
            return result
            
        except Exception as e:
            return {"error": f"Error analyzing video: {str(e)}"}
    
    def format_timestamp(self, seconds):
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        seconds = int(seconds % 60)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

class FaceAnalyzer:
    def __init__(self):
        self.classifier = FaceClassifier()
        
    def load_reference_face(self, image_path):
        return self.classifier.train_classifier(image_path)
    
    def analyze_video(self, video_path):
        return self.classifier.analyze_video(video_path)
