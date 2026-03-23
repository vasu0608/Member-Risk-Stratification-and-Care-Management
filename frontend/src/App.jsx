
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import PopulationDashboard from './pages/PopulationDashboard';
import UploadData from './pages/UploadData';
import AddMember from './pages/AddMember';
import Analytics from './pages/Analytics';
import RealTimeMonitoring from './pages/RealTimeMonitoring';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="app-shell">
        {/* Sidebar is fixed-positioned; content offset is handled in CSS. */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="app-main-content">
          <Routes>
            <Route path="/" element={<PopulationDashboard />} />
            <Route path="/monitoring" element={<RealTimeMonitoring />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/add-member" element={<AddMember />} />
            <Route path="/upload" element={<UploadData />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
