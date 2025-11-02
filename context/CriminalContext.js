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
    },
    {
      id: 3,
      name: "Robert Johnson",
      crime: "Burglary",
      severity: "High",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      status: "Wanted",
      lastSeen: "2024-01-08"
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

  const updateCriminal = (id, updatedData) => {
    setCriminals(prev => prev.map(criminal => 
      criminal.id === id ? { ...criminal, ...updatedData } : criminal
    ));
  };

  const deleteCriminal = (id) => {
    setCriminals(prev => prev.filter(criminal => criminal.id !== id));
  };

  const value = {
    criminals,
    addCriminal,
    updateCriminal,
    deleteCriminal,
    analysisResults,
    setAnalysisResults
  };

  return (
    <CriminalContext.Provider value={value}>
      {children}
    </CriminalContext.Provider>
  );
};