// Mock data for the application
export const mockCriminals = [
  {
    id: 1,
    name: "John Smith",
    crime: "Armed Robbery",
    severity: "High",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    status: "Wanted",
    lastSeen: "2024-01-15",
    age: "35",
    height: "6'2\""
  },
  {
    id: 2,
    name: "Maria Garcia",
    crime: "Credit Card Fraud",
    severity: "Medium",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    status: "Suspected",
    lastSeen: "2024-01-10",
    age: "28",
    height: "5'6\""
  },
  {
    id: 3,
    name: "Robert Johnson",
    crime: "Burglary",
    severity: "High",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    status: "Wanted",
    lastSeen: "2024-01-08",
    age: "42",
    height: "5'11\""
  }
];

export const mockAnalysisResults = {
  matchFound: true,
  criminal: mockCriminals[0],
  timestamps: [
    { time: '00:01:23', confidence: 92, cameraId: 'CAM-01', location: 'Main Entrance' },
    { time: '00:02:45', confidence: 88, cameraId: 'CAM-03', location: 'Parking Lot' },
    { time: '00:04:12', confidence: 95, cameraId: 'CAM-02', location: 'Lobby' }
  ],
  analysisTime: '3.2 seconds'
};