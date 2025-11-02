import React from 'react';
import { Play, Cpu, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AnalysisPanel = ({ isAnalyzing, onAnalyze, results, hasFiles }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="card p-6"
    >
      <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
        <Cpu className="h-6 w-6 text-purple-600" />
        ML Analysis Control
      </h3>
      
      <div className="space-y-6">
        <motion.button
          whileHover={{ scale: hasFiles ? 1.02 : 1 }}
          whileTap={{ scale: hasFiles ? 0.98 : 1 }}
          onClick={onAnalyze}
          disabled={isAnalyzing || !hasFiles}
          className={`w-full py-4 rounded-2xl font-semibold text-lg shadow-2xl flex items-center justify-center gap-3 transition-all ${
            hasFiles 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>ML Analysis Running...</span>
            </>
          ) : (
            <>
              <Play className="h-6 w-6" />
              <span>Start ML Analysis</span>
            </>
          )}
        </motion.button>

        {!hasFiles && (
          <div className="text-center text-gray-500 text-sm">
            Upload both reference image and video to start ML analysis
          </div>
        )}

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl ${
              results.matchFound 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {results.matchFound ? (
                <AlertCircle className="h-8 w-8 text-red-600" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-600" />
              )}
              <div>
                <h4 className="font-semibold text-gray-800">
                  {results.matchFound ? 'Target Person Found!' : 'Target Person Not Found'}
                </h4>
                <p className="text-gray-600">
                  {results.matchFound 
                    ? `ML model detected ${results.timestamps.length} matches in video` 
                    : 'No confident matches found above threshold'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ML Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-800 mb-2">ML Classification Active</h4>
          <p className="text-blue-700 text-sm">
            Using SVM machine learning to classify if the reference person appears in the video
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisPanel;