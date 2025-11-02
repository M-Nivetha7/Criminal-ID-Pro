# simple_face_analyzer_fixed.py
import cv2
import numpy as np
import os
from datetime import datetime

# Optional import for SSIM
try:
    from skimage.metrics import structural_similarity as ssim
except Exception:
    ssim = None

class SimpleFaceAnalyzer:
    def __init__(self,
                 cascade_path=None,
                 confidence_threshold=85,
                 min_face_size=90,
                 debug_save=True):
        # Reference storage
        self.reference_face = None          # grayscale crop of reference
        self.reference_standard = None      # resized standard (100x100)
        self.reference_features = None
        self.reference_embedding = None

        # Detector
        if cascade_path is None:
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)

        # Strictness params
        self.confidence_threshold = confidence_threshold
        self.min_face_size = min_face_size
        self.strict_mode = True

        # Debugging
        self.debug_save = debug_save
        if self.debug_save:
            os.makedirs("debug_frames", exist_ok=True)

        # Try to load facenet (optional) for embeddings
        self.use_facenet = False
        self.torch = None
        self.facenet = None
        try:
            import torch
            from facenet_pytorch import InceptionResnetV1, MTCNN
            self.torch = torch
            # InceptionResnetV1 pretrained on vggface2
            self.facenet = InceptionResnetV1(pretrained='vggface2').eval()
            # Optionally use MTCNN for alignment if available
            self.mtcnn = MTCNN(keep_all=False)  # if you want aligned crops set to True earlier
            self.use_facenet = True
            print("🧠 FaceNet + MTCNN available -> using embeddings & alignment")
        except Exception:
            # facenet not available: continue with classical methods only
            self.mtcnn = None
            self.facenet = None
            self.torch = None
            print("⚠️ FaceNet/MTCNN not available — using classical OpenCV/SSIM methods (recommended to install facenet-pytorch for best results)")

    # -------------------------
    # Utilities
    # -------------------------
    def format_timestamp(self, seconds):
        """Format seconds to HH:MM:SS"""
        try:
            seconds = int(seconds)
            hours = seconds // 3600
            minutes = (seconds % 3600) // 60
            secs = seconds % 60
            return f"{hours:02d}:{minutes:02d}:{secs:02d}"
        except:
            return "00:00:00"

    def _debug_save_frame(self, frame, face_box, filename_prefix):
        """Save debug crop + full frame for inspection"""
        try:
            x, y, w, h = face_box
            crop = frame[y:y+h, x:x+w]
            cv2.imwrite(f"debug_frames/{filename_prefix}_crop.jpg", crop)
            cv2.imwrite(f"debug_frames/{filename_prefix}_frame.jpg", frame)
        except Exception as e:
            print("Debug save error:", e)

    # -------------------------
    # Feature extraction
    # -------------------------
    def simplified_lbp(self, image):
        """Very simple texture descriptor (placeholder for LBP)"""
        try:
            mean, std_dev = cv2.meanStdDev(image)
            return [float(std_dev[0][0]) / 100.0]
        except:
            return [0.0]

    def extract_face_features(self, face_image):
        """
        Extract features from a grayscale face crop.
        Returns (feature_vector, standardized_face_resized)
        """
        try:
            if face_image is None or face_image.size == 0:
                return None, None

            # Standard size for these features
            standard_face = cv2.resize(face_image, (100, 100))
            equalized = cv2.equalizeHist(standard_face)
            blurred = cv2.GaussianBlur(equalized, (3, 3), 0)

            # Histogram
            hist = cv2.calcHist([blurred], [0], None, [256], [0, 256]).flatten().astype(np.float32)
            # Normalize histogram
            if np.linalg.norm(hist) > 1e-6:
                hist = hist / np.linalg.norm(hist)
            else:
                hist = hist

            # Edges
            edges = cv2.Canny(blurred, 50, 150)
            edge_density = float(np.sum(edges)) / (edges.shape[0] * edges.shape[1] + 1e-9)

            # Texture
            lbp = self.simplified_lbp(blurred)

            features = np.concatenate([hist, [edge_density], lbp]).astype(np.float32)
            return features, standard_face
        except Exception as e:
            print("Feature extraction error:", e)
            return None, None

    # -------------------------
    # Embedding extraction (FaceNet)
    # -------------------------
    def extract_embedding(self, face_gray):
        """
        Returns normalized 512-d embedding if facenet available, else None.
        face_gray: grayscale crop (H x W)
        """
        if not self.use_facenet or self.facenet is None:
            return None

        try:
            # If MTCNN is available and can align, we could use it; but here convert grayscale -> RGB
            # Resize to 160x160 and convert to RGB
            face_rgb = cv2.cvtColor(face_gray, cv2.COLOR_GRAY2BGR)
            face_rgb = cv2.cvtColor(face_rgb, cv2.COLOR_BGR2RGB)
            face_resized = cv2.resize(face_rgb, (160, 160)).astype(np.float32) / 255.0

            # (C, H, W)
            arr = np.transpose(face_resized, (2, 0, 1))
            tensor = self.torch.tensor(arr).unsqueeze(0)  # shape (1,3,160,160)
            # normalize to [-1,1] as facenet-pytorch expects
            tensor = (tensor - 0.5) / 0.5

            with self.torch.no_grad():
                emb = self.facenet(tensor).cpu().numpy().flatten()

            # Normalize to unit vector
            norm = np.linalg.norm(emb)
            if norm > 1e-6:
                emb = emb / norm
            return emb
        except Exception as e:
            print("Embedding extraction error:", e)
            return None

    # -------------------------
    # Load reference
    # -------------------------
    def load_reference_face(self, image_path):
        """
        Load reference face image from disk.
        Returns: (True/False, message)
        """
        try:
            if not os.path.exists(image_path):
                return False, "Reference image not found"

            img = cv2.imread(image_path)
            if img is None:
                return False, "Could not read reference image"

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # Strict detection parameters for reference
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.2,
                minNeighbors=8,
                minSize=(self.min_face_size, self.min_face_size),
                flags=cv2.CASCADE_SCALE_IMAGE
            )

            if len(faces) == 0:
                return False, "No clear face detected in reference image"

            # Choose largest & most centered face
            faces = sorted(faces, key=lambda r: (r[2]*r[3], -abs((r[0]+r[2]//2) - gray.shape[1]//2)), reverse=True)
            x, y, w, h = faces[0]

            # Validate size in image
            if (w / float(gray.shape[1])) < 0.12:
                return False, "Face in reference image is too small"

            ref_crop = gray[y:y+h, x:x+w]
            self.reference_face = ref_crop.copy()
            self.reference_standard = cv2.resize(ref_crop, (100, 100))

            # Extract features
            features, _ = self.extract_face_features(self.reference_face)
            if features is None or np.isnan(features).any() or np.linalg.norm(features) < 1e-6:
                return False, "Could not extract valid features from reference"

            self.reference_features = features

            # If facenet available compute embedding
            if self.use_facenet:
                emb = self.extract_embedding(self.reference_face)
                if emb is not None:
                    self.reference_embedding = emb

            print(f"✅ Reference face loaded: size={self.reference_face.shape}, embedding={'yes' if self.reference_embedding is not None else 'no'}")
            return True, "Reference loaded"
        except Exception as e:
            return False, f"Error loading reference: {e}"

    # -------------------------
    # Comparison
    # -------------------------
    def _cosine_similarity(self, a, b):
        """Cosine similarity in [-1,1]."""
        try:
            a = a.astype(np.float32)
            b = b.astype(np.float32)
            denom = (np.linalg.norm(a) * np.linalg.norm(b))
            if denom < 1e-8:
                return 0.0
            cos = float(np.dot(a, b) / denom)
            # clamp
            cos = max(-1.0, min(1.0, cos))
            return cos
        except:
            return 0.0

    def compare_faces_strict(self, current_face):
        """
        Compares a current grayscale face crop against the loaded reference.
        Returns (confidence_percent, status_string)
        """
        try:
            if self.reference_features is None or self.reference_face is None:
                return 0, "No reference"

            # Basic guards
            if current_face is None or current_face.size == 0:
                return 0, "Bad input face"

            # Extract features for candidate
            current_features, current_standard = self.extract_face_features(current_face)
            if current_features is None or np.isnan(current_features).any() or np.linalg.norm(current_features) < 1e-6:
                return 0, "Bad features"

            # Method A: feature vector cosine (weighted)
            feature_cos = self._cosine_similarity(self.reference_features, current_features)  # in [-1,1]
            feature_similarity = max(0.0, feature_cos) * 30.0  # map positive cosines to weight

            # Method B: template matching
            template_similarity = 0.0
            try:
                # Resize current to reference size to compare structure (use normalized coeff)
                ref_h, ref_w = self.reference_face.shape[:2]
                curr_resized = cv2.resize(current_face, (ref_w, ref_h))
                # matchTemplate expects template (ref) and image (curr_resized)
                res = cv2.matchTemplate(curr_resized, self.reference_face, cv2.TM_CCOEFF_NORMED)
                # For equal sized images res is 1x1 but still use minMaxLoc
                _, tscore, _, _ = cv2.minMaxLoc(res)
                template_similarity = max(0.0, float(tscore)) * 25.0
            except Exception:
                template_similarity = 0.0

            # Method C: structural similarity (SSIM)
            structural_similarity = 0.0
            if ssim is not None:
                try:
                    ref_ssim = cv2.resize(self.reference_standard, (100, 100))
                    curr_ssim = cv2.resize(current_face, (100, 100))
                    # ssim expects 2D arrays for grayscale
                    s = ssim(ref_ssim, curr_ssim)
                    structural_similarity = max(0.0, float(s)) * 20.0
                except Exception:
                    structural_similarity = 0.0

            # Method D: FaceNet embedding (if available)
            embedding_similarity = 0.0
            if self.reference_embedding is not None and self.use_facenet:
                try:
                    curr_emb = self.extract_embedding(current_face)
                    if curr_emb is not None:
                        cos_emb = self._cosine_similarity(self.reference_embedding, curr_emb)  # in [-1,1]
                        cos_emb = max(0.0, cos_emb)
                        embedding_similarity = cos_emb * 100.0  # map to percentage
                except Exception:
                    embedding_similarity = 0.0

            # Combine signals
            if embedding_similarity > 0:
                # When embedding exists, favor it heavily
                total_confidence = embedding_similarity * 0.85 + (template_similarity + structural_similarity) * 0.15
            else:
                total_confidence = feature_similarity + template_similarity + structural_similarity

            # Penalize if template is very weak and no embedding
            if template_similarity < 10.0 and embedding_similarity == 0:
                total_confidence *= 0.85

            # Additional rule-based checks to avoid sum of many weak signals becoming a match
            # Require either decent template or structural evidence or embedding to consider high confidence
            has_template_support = template_similarity >= 12.0
            has_structural_support = structural_similarity >= 10.0
            has_embedding_support = embedding_similarity >= 70.0  # embedding is strong indicator

            # If no single support, penalize
            if not (has_template_support or has_structural_support or has_embedding_support):
                total_confidence *= 0.75

            total_confidence = min(100.0, float(total_confidence))

            status = "STRICT_MATCH" if total_confidence >= self.confidence_threshold else "NO_MATCH"

            # Debug print for each comparison
            print(f"   Scores -> Embedding: {embedding_similarity:.1f}%, Features: {feature_similarity:.1f}%, Template: {template_similarity:.1f}%, Structural: {structural_similarity:.1f}% | Total: {total_confidence:.1f}% [{status}]")

            return total_confidence, status

        except Exception as e:
            print("Comparison error:", e)
            return 0, "Error"

    # -------------------------
    # Video analyzer
    # -------------------------
    def analyze_video(self, video_path, process_every_n_frames=15, save_matches=True):
        """
        Analyze video and return dictionary result containing high-confidence matches only.
        process_every_n_frames: sample interval to speed up processing (default 15)
        """
        try:
            if self.reference_face is None:
                return {"error": "No reference face loaded"}

            if not os.path.exists(video_path):
                return {"error": "Video file not found"}

            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return {"error": "Could not open video"}

            fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)

            frame_count = 0
            true_matches = []
            all_faces_detected = 0
            rejected_matches = 0

            print(f"🎬 Starting video analysis: {os.path.basename(video_path)}")
            print(f"📊 Video frames: {total_frames}, FPS: {fps:.2f}")
            print(f"🎯 Confidence threshold (strict): {self.confidence_threshold}%")

            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                if frame_count % process_every_n_frames == 0:
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

                    faces = self.face_cascade.detectMultiScale(
                        gray,
                        scaleFactor=1.25,
                        minNeighbors=6,
                        minSize=(self.min_face_size, self.min_face_size),
                        flags=cv2.CASCADE_SCALE_IMAGE
                    )

                    all_faces_detected += len(faces)

                    for (x, y, w, h) in faces:
                        # Add small padding to the crop to include whole face
                        pad = int(0.05 * (w + h) / 2)
                        x0 = max(0, x - pad)
                        y0 = max(0, y - pad)
                        x1 = min(gray.shape[1], x + w + pad)
                        y1 = min(gray.shape[0], y + h + pad)

                        current_face = gray[y0:y1, x0:x1]
                        confidence, status = self.compare_faces_strict(current_face)

                        timestamp_seconds = frame_count / fps
                        timestamp = self.format_timestamp(timestamp_seconds)

                        if confidence >= self.confidence_threshold:
                            match_info = {
                                "time": timestamp,
                                "confidence": round(confidence, 2),
                                "frame": frame_count,
                                "box": [int(x0), int(y0), int(x1-x0), int(y1-y0)],
                                "status": "✅ HIGH CONFIDENCE MATCH"
                            }
                            true_matches.append(match_info)
                            print(f"🎯 ✅ TRUE MATCH at {timestamp} - {confidence:.1f}%")

                            # Save debug crops
                            if self.debug_save and save_matches:
                                self._debug_save_frame(frame, (x0, y0, x1-x0, y1-y0), f"true_{frame_count}_{int(confidence)}")
                        else:
                            rejected_matches += 1
                            # Save borderline rejects for inspection
                            if self.debug_save and confidence > 40.0:
                                self._debug_save_frame(frame, (x0, y0, x1-x0, y1-y0), f"rejected_{frame_count}_{int(confidence)}")
                            if confidence > 50:
                                print(f"   ❌ REJECTED at {timestamp} - {confidence:.1f}% (need {self.confidence_threshold}%)")

                frame_count += 1

                # progress logs occasionally
                if total_frames > 0 and frame_count % 200 == 0:
                    progress = (frame_count / total_frames) * 100.0
                    print(f"📈 Progress: {progress:.1f}% | Frames processed: {frame_count}/{total_frames} | True matches: {len(true_matches)}")

            cap.release()

            summary = {
                "matchFound": len(true_matches) > 0,
                "timestamps": true_matches,
                "totalFramesProcessed": frame_count,
                "totalFacesDetected": all_faces_detected,
                "targetDetections": len(true_matches),
                "rejectedDetections": rejected_matches,
                "confidenceThreshold": self.confidence_threshold,
                "method": "STRICT OpenCV + Multi-Method Validation (embedding if available)",
                "note": "Only very high confidence matches are included in timestamps. See debug_frames/ for saved crops."
            }

            print("\n📊 ANALYSIS SUMMARY:")
            print(f"   Frames processed: {frame_count}")
            print(f"   Faces detected: {all_faces_detected}")
            print(f"   True matches: {len(true_matches)}")
            print(f"   Rejected: {rejected_matches}")
            print(f"   Final result: {'TARGET FOUND' if len(true_matches) > 0 else 'TARGET NOT FOUND'}")

            return summary

        except Exception as e:
            return {"error": f"Video analysis error: {e}"}


# -------------------------
# Example usage (run as script)
# -------------------------
if __name__ == "__main__":
    # Example flow: update paths accordingly
    ref_path = "reference.jpg"   # path to your reference image
    video_path = "input_video.mp4"  # path to video to analyze

    analyzer = SimpleFaceAnalyzer(confidence_threshold=85, min_face_size=90, debug_save=True)
    ok, msg = analyzer.load_reference_face(ref_path)
    print("Load reference:", ok, msg)
    if ok:
        result = analyzer.analyze_video(video_path, process_every_n_frames=10, save_matches=True)
        print("Result:", result)
    else:
        print("Failed to load reference; aborting.")
