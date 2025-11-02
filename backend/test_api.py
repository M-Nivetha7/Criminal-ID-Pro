import requests
import os

def test_backend():
    BASE_URL = "http://localhost:5000"
    
    # 1. Test health endpoint
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Health check response: {response.json()}")
    except Exception as e:
        print(f"Error connecting to backend: {str(e)}")
        return
    
    # 2. Check upload directories exist
    print("\n2. Checking upload directories...")
    upload_dirs = ['uploads/images', 'uploads/videos']
    for dir_path in upload_dirs:
        if os.path.exists(dir_path):
            print(f"✅ {dir_path} exists")
            # Test write permissions
            try:
                test_file = os.path.join(dir_path, 'test_write')
                with open(test_file, 'w') as f:
                    f.write('test')
                os.remove(test_file)
                print(f"✅ {dir_path} is writable")
            except Exception as e:
                print(f"❌ {dir_path} is not writable: {str(e)}")
        else:
            print(f"❌ {dir_path} does not exist")
    
    # 3. Test reference image upload (if test image exists)
    print("\n3. Testing reference image upload...")
    test_image = "test_reference.jpg"  # Put a test image in backend folder
    if os.path.exists(test_image):
        try:
            with open(test_image, 'rb') as f:
                response = requests.post(
                    f"{BASE_URL}/api/upload-reference",
                    files={'image': ('test_reference.jpg', f, 'image/jpeg')}
                )
            print(f"Reference upload response: {response.json()}")
        except Exception as e:
            print(f"Error uploading reference: {str(e)}")
    else:
        print("❌ No test reference image found. Create test_reference.jpg in backend folder")
    
    # 4. Test video analysis (if test video exists)
    print("\n4. Testing video analysis...")
    test_video = "test_video.mp4"  # Put a test video in backend folder
    if os.path.exists(test_video):
        try:
            with open(test_video, 'rb') as f:
                response = requests.post(
                    f"{BASE_URL}/api/analyze-video",
                    files={'video': ('test_video.mp4', f, 'video/mp4')}
                )
            print(f"Video analysis response: {response.json()}")
        except Exception as e:
            print(f"Error analyzing video: {str(e)}")
    else:
        print("❌ No test video found. Create test_video.mp4 in backend folder")

if __name__ == "__main__":
    test_backend()