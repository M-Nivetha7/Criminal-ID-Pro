// Mock video processing service
export class VideoProcessor {
  static async extractFrames(videoFile, interval = 2) {
    // Simulate frame extraction
    return new Promise((resolve) => {
      setTimeout(() => {
        const frames = [
          { timestamp: '00:00:00', imageData: 'frame_1' },
          { timestamp: '00:00:02', imageData: 'frame_2' },
          { timestamp: '00:00:04', imageData: 'frame_3' },
          { timestamp: '00:00:06', imageData: 'frame_4' },
          { timestamp: '00:00:08', imageData: 'frame_5' }
        ];
        resolve(frames);
      }, 2000);
    });
  }

  static async processVideo(videoFile, referenceImage, criminals) {
    // Simulate video processing
    return new Promise((resolve) => {
      setTimeout(() => {
        const matches = [
          { time: '00:01:15', confidence: 92, criminal: criminals[0] },
          { time: '00:02:30', confidence: 88, criminal: criminals[0] },
          { time: '00:04:45', confidence: 95, criminal: criminals[0] }
        ];
        
        resolve({
          matchFound: matches.length > 0,
          matches: matches,
          totalFramesProcessed: 150,
          analysisTime: '4.5 seconds'
        });
      }, 3000);
    });
  }
}