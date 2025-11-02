import React from 'react';
import { Clock, MapPin, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const Timeline = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Detection Timeline</h3>
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No detection events to display</p>
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
      <h3 className="text-xl font-semibold mb-6 text-gray-800">Detection Timeline</h3>
      
      <div className="space-y-4">
        {events.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-indigo-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800">{event.time}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.confidence > 90 
                    ? 'bg-green-100 text-green-800'
                    : event.confidence > 80
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {event.confidence}% confidence
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Camera className="h-4 w-4" />
                  <span>Camera {event.cameraId}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Timeline;