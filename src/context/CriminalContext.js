import React, { createContext, useContext, useState } from 'react';

const CriminalContext = createContext();

export const useCriminal = () => {
  const context = useContext(CriminalContext);
  if (!context) {
    throw new Error('useCriminal must be used within a CriminalProvider');
  }
  return context;
};

export const CriminalProvider = ({ children }) => {
  const [criminals, setCriminals] = useState([
    {
      id: 1,
      name: "John Smith",
      crime: "Armed Robbery",
      severity: "High",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      status: "Wanted",
      lastSeen: "2024-01-15"
    },
    {
      id: 2,
      name: "Maria Garcia",
      crime: "Credit Card Fraud",
      severity: "Medium",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      status: "Suspected",
      lastSeen: "2024-01-10"
    }
  ]);

  const [analysisResults, setAnalysisResults] = useState(null);

  const addCriminal = (criminal) => {
    const newCriminal = {
      ...criminal,
      id: Date.now(),
    };
    setCriminals(prev => [...prev, newCriminal]);
  };

  const value = {
    criminals,
    addCriminal,
    analysisResults,
    setAnalysisResults
  };

  return (
    <CriminalContext.Provider value={value}>
      {children}
    </CriminalContext.Provider>
  );
};
