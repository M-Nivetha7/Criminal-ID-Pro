import React from 'react';
import { Clock, AlertTriangle, CheckCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Results = ({ results }) => {
  if (!results) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Analysis Results</h3>
        <div className="text-center py-12 text-gray-500">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p>Upload media and start analysis to see results</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h3 className="text-xl font-semibold mb-6 text-gray-800">Analysis Results</h3>
      
      <div className="space-y-6">
        <div className={`p-4 rounded-xl ${
          results.matchFound 
            ? 'bg-red-50 border border-red-200' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center gap-3">
            {results.matchFound ? (
              <AlertTriangle className="h-8 w-8 text-red-600" />
            ) : (
              <CheckCircle className="h-8 w-8 text-green-600" />
            )}
            <div>
              <h4 className="font-semibold text-gray-800">
                {results.matchFound ? 'Match Found!' : 'No Match Found'}
              </h4>
              <p className="text-gray-600">
                {results.matchFound 
                  ? 'Criminal identified in the video' 
                  : 'No criminal matches found'
                }
              </p>
            </div>
          </div>
        </div>

        {results.matchFound && results.criminal && (
          <div className="border border-gray-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Identified Criminal</h4>
            <div className="flex items-center gap-4">
              <img
                src={results.criminal.image}
                alt={results.criminal.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h5 className="font-semibold text-gray-800">{results.criminal.name}</h5>
                <p className="text-sm text-gray-600">{results.criminal.crime}</p>
                <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  {results.criminal.severity} Risk
                </span>
              </div>
            </div>
          </div>
        )}

        {results.matchFound && results.timestamps && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Detection Timestamps
            </h4>
            <div className="space-y-2">
              {results.timestamps.map((timestamp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-mono text-gray-800">{timestamp.time}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    timestamp.confidence > 90 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {timestamp.confidence}% confidence
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-gray-600 border-t pt-4">
          Analysis completed in {results.analysisTime || '2.8 seconds'}
        </div>
      </div>
    </motion.div>
  );
};

export default Results;