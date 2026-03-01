
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import PopulationDashboard from './pages/PopulationDashboard';
import UploadData from './pages/UploadData';
import AddMember from './pages/AddMember';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        {/* Sidebar Fixed Width */}
        <div style={{ width: '250px', flexShrink: 0 }}>
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, overflowX: 'hidden' }}>
          <Routes>
            <Route path="/" element={<PopulationDashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/add-member" element={<AddMember />} />
            <Route path="/upload" element={<UploadData />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
