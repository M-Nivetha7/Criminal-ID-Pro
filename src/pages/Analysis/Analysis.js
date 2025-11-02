import React, { useState } from 'react';
import { useCriminal } from '../../context/CriminalContext';
import UploadZone from '../../components/UploadZone/UploadZone';
import AnalysisPanel from '../../components/AnalysisPanel/AnalysisPanel';
import Results from '../../components/Results/Results';
import Timeline from '../../components/Timeline/Timeline';
import { motion } from 'framer-motion';

const Analysis = () => {
  const { criminals, setAnalysisResults } = useCriminal();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [backendStatus, setBackendStatus] = useState('unknown');

  const testBackendConnection = async () => {
    try {
      setBackendStatus('checking');
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      console.log('Backend connection:', data);
      setBackendStatus('connected');
      alert(`✅ Backend is running!\nPort: ${data.port}\nStatus: ${data.status}\nMethod: ${data.method || 'Deep Learning Face Recognition'}`);
    } catch (error) {
      console.error('Backend connection failed:', error);
      setBackendStatus('disconnected');
      alert('❌ Cannot connect to ML backend.\n\nPlease make sure:\n1. Python server is running on port 5000\n2. Backend dependencies are installed\n3. No firewall blocking the connection');
    }
  };

  const analyzeMedia = async () => {
    if (!selectedImage || !selectedVideo) {
      alert('Please upload both a reference face image and a video to analyze');
      return;
    }

    // Validate file types
    if (!selectedImage.type.startsWith('image/')) {
      alert('Please upload a valid image file for the reference face');
      return;
    }

    if (!selectedVideo.type.startsWith('video/')) {
      alert('Please upload a valid video file for analysis');
      return;
    }

    setIsAnalyzing(true);
    setResults(null);
    
    try {
      console.log('Starting ML face classification analysis...');

      // Step 1: Upload reference image to Python backend for ML training
      const imageFormData = new FormData();
      imageFormData.append('image', selectedImage);
      
      console.log('📷 Training ML classifier on reference face...');
      const imageResponse = await fetch('http://localhost:5000/api/upload-reference', {
        method: 'POST',
        body: imageFormData,
      });
      
      if (!imageResponse.ok) {
        // Try to parse backend JSON error to show helpful message
        let errMsg = `HTTP error! status: ${imageResponse.status}`;
        try {
          const errBody = await imageResponse.json();
          if (errBody && errBody.error) errMsg = errBody.error;
          else errMsg += ` - ${JSON.stringify(errBody)}`;
        } catch (e) {
          const text = await imageResponse.text();
          if (text) errMsg = text;
        }
        throw new Error(errMsg);
      }

      const imageResult = await imageResponse.json();
      console.log('ML training result:', imageResult);
      
      if (!imageResult.success) {
        throw new Error(imageResult.error || 'Failed to train ML classifier on reference face');
      }

      // Step 2: Analyze video with ML classification
      const videoFormData = new FormData();
      videoFormData.append('video', selectedVideo);
      
      console.log('🎥 Analyzing video with ML face classification...');
      const videoResponse = await fetch('http://localhost:5000/api/analyze-video', {
        method: 'POST',
        body: videoFormData,
      });
      
      if (!videoResponse.ok) {
        // Parse backend error JSON when possible so UI shows the real cause
        let errMsg = `HTTP error! status: ${videoResponse.status}`;
        try {
          const errBody = await videoResponse.json();
          if (errBody && errBody.error) errMsg = errBody.error;
          else errMsg += ` - ${JSON.stringify(errBody)}`;
        } catch (e) {
          const text = await videoResponse.text();
          if (text) errMsg = text;
        }
        throw new Error(errMsg);
      }

      const videoResult = await videoResponse.json();
      console.log('ML classification results:', videoResult);
      
      if (videoResult.error) {
        throw new Error(videoResult.error);
      }

      // Format results for frontend display - FIXED PROPERTY NAMES
      const formattedResults = {
        matchFound: videoResult.matchFound || false,
        criminal: {
          name: "Target Person",
          crime: "Reference Face Match",
          severity: "High",
          image: URL.createObjectURL(selectedImage)
        },
        timestamps: videoResult.timestamps || [],
        analysisTime: videoResult.analysisTime || 'Analysis Complete',
        totalFrames: videoResult.totalFrames || 0,
        // FIXED: Use correct property names from backend response
        mlStats: {
          totalFacesDetected: videoResult.totalFacesDetected || 0,
          targetDetections: videoResult.targetDetections || 0,
          differentPeopleDetected: videoResult.differentPeopleDetected || 0,
          confidenceThreshold: (videoResult.similarityThreshold || 0.7) * 100,
          analysisMethod: videoResult.method || "Deep Learning Analysis",
          accuracyNote: videoResult.accuracyNote || "Using advanced face recognition"
        }
      };
      
      setResults(formattedResults);
      setAnalysisResults(formattedResults);
      
      console.log('✅ ML analysis completed successfully!');
      
    } catch (error) {
      console.error('❌ Analysis error:', error);
      
      if (error.message.includes('Failed to fetch')) {
        alert(`🚨 Connection Error: Cannot reach ML backend\n\nPlease ensure:\n1. Python server is running on port 5000\n2. Run "python3 app.py" in backend folder\n3. Check firewall settings\n\nError: ${error.message}`);
      } else if (error.message.includes('face')) {
        alert(`🤖 ML Analysis Error: ${error.message}\n\nPlease upload a clear face image where the face is visible and well-lit.`);
      } else if (error.message.includes('video')) {
        alert(`🎥 Video Error: ${error.message}\n\nPlease check the video file is supported (MP4, MOV, AVI) and not corrupted.`);
      } else {
        alert(`❌ Analysis Failed: ${error.message}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getBackendStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-red-500';
      case 'checking': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getBackendStatusText = () => {
    switch (backendStatus) {
      case 'connected': return 'ML Backend Connected';
      case 'disconnected': return 'ML Backend Offline';
      case 'checking': return 'Checking Connection...';
      default: return 'Check ML Backend';
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Deep Learning Face Analysis</h1>
          <p className="text-white/80 mb-4 text-lg">
            Powered by MTCNN + FaceNet (VGGFace2)
          </p>
          
          {/* Backend Status */}
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className={`w-3 h-3 rounded-full ${getBackendStatusColor()} animate-pulse`}></div>
            <button 
              onClick={testBackendConnection}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <span>{getBackendStatusText()}</span>
            </button>
          </div>
        </motion.div>

        {/* Main Analysis Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <UploadZone
              type="image"
              onFileUpload={setSelectedImage}
              selectedFile={selectedImage}
              onClear={() => setSelectedImage(null)}
            />
            <UploadZone
              type="video"
              onFileUpload={setSelectedVideo}
              selectedFile={selectedVideo}
              onClear={() => setSelectedVideo(null)}
            />

            {/* Upload Status */}
            {(selectedImage || selectedVideo) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4"
              >
                <h4 className="font-semibold text-gray-800 mb-2">Ready for Analysis</h4>
                <div className="space-y-2 text-sm">
                  {selectedImage && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference Face:</span>
                      <span className="text-green-600 font-medium">✓ Ready</span>
                    </div>
                  )}
                  {selectedVideo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Analysis Video:</span>
                      <span className="text-green-600 font-medium">✓ Ready</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Analysis Panel */}
          <AnalysisPanel
            isAnalyzing={isAnalyzing}
            onAnalyze={analyzeMedia}
            results={results}
            hasFiles={selectedImage && selectedVideo}
          />
        </div>

        {/* Results Section */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{results.mlStats?.totalFacesDetected || 0}</div>
                <div className="text-sm text-gray-600">Total Faces</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{results.mlStats?.targetDetections || 0}</div>
                <div className="text-sm text-gray-600">Target Matches</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{results.mlStats?.differentPeopleDetected || 0}</div>
                <div className="text-sm text-gray-600">Different People</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{results.timestamps.length}</div>
                <div className="text-sm text-gray-600">Detection Events</div>
              </div>
            </div>

            {/* Main Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Results results={results} />
              <Timeline events={results.timestamps} />
            </div>

            {/* Analysis Info */}
            {results.mlStats && (
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Analysis Information</h3>
                <div className="text-sm text-gray-600">
                  <p><strong>Method:</strong> {results.mlStats.analysisMethod}</p>
                  <p><strong>Note:</strong> {results.mlStats.accuracyNote}</p>
                  <p><strong>Frames Processed:</strong> {results.totalFrames}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Analysis;
