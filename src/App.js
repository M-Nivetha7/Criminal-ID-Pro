import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CriminalProvider } from './context/CriminalContext.js';
import Header from './components/Header/Header.js';
import Dashboard from './pages/Dashboard/Dashboard.js';
import Analysis from './pages/Analysis/Analysis.js';
import Database from './pages/Database/Database.js';

function App() {
  return (
    <CriminalProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analyze" element={<Analysis />} />
              <Route path="/database" element={<Database />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CriminalProvider>
  );
}

export default App;