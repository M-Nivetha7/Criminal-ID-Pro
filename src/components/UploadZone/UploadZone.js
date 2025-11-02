import React from 'react';
import { Upload, Video, Image, X } from 'lucide-react';
import { motion } from 'framer-motion';

const UploadZone = ({ type, onFileUpload, selectedFile, onClear }) => {
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size
      const maxSize = type === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for images, 100MB for videos
      if (file.size > maxSize) {
        alert(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
        return;
      }
      onFileUpload(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        {type === 'image' ? 'Reference Face Image' : 'Surveillance Video'}
      </h3>
      
      <div
        className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById(`file-input-${type}`).click()}
      >
        {selectedFile ? (
          <div className="relative">
            {type === 'image' ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Uploaded reference face"
                className="max-w-full h-64 object-contain rounded-xl mx-auto"
              />
            ) : (
              <div className="relative">
                <video
                  src={URL.createObjectURL(selectedFile)}
                  className="max-w-full h-64 object-contain rounded-xl mx-auto"
                  controls
                />
                <div className="mt-2 text-sm text-gray-600">
                  Video ready for ML analysis
                </div>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mt-2 text-sm text-green-600">
              ✓ {selectedFile.name} ({Math.round(selectedFile.size / 1024 / 1024)}MB)
            </div>
          </div>
        ) : (
          <div>
            {type === 'image' ? (
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            ) : (
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            )}
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">
              Drag and drop your {type === 'image' ? 'face image' : 'video'} here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              {type === 'image' 
                ? 'Supports: JPG, PNG, WEBP (Max: 10MB)' 
                : 'Supports: MP4, MOV, AVI (Max: 100MB)'
              }
            </p>
          </div>
        )}
        
        <input
          id={`file-input-${type}`}
          type="file"
          accept={type === 'image' ? 'image/*' : 'video/*'}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </motion.div>
  );
};

export default UploadZone;