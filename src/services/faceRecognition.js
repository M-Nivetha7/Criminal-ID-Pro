// Mock face recognition service
export class FaceRecognitionService {
  static async loadModels() {
    // Simulate model loading
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Face recognition models loaded');
        resolve(true);
      }, 1000);
    });
  }

  static async detectFaces(image) {
    // Simulate face detection
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            detection: { score: 0.98 },
            landmarks: {},
            descriptor: new Float32Array(128)
          }
        ]);
      }, 500);
    });
  }

  static async recognizeFace(imageDescriptor, criminalDescriptors) {
    // Simulate face recognition
    return new Promise((resolve) => {
      setTimeout(() => {
        const match = Math.random() > 0.3; // 70% chance of match for demo
        resolve({
          match,
          confidence: match ? Math.random() * 20 + 80 : Math.random() * 30, // 80-100% if match, 0-30% if not
          criminal: match ? criminalDescriptors[0] : null
        });
      }, 1000);
    });
  }
}