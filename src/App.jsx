import React from 'react';
import { ParkingProvider } from './context/ParkingProvider';
import { AuthProvider } from './context/AuthProvider';
import DashboardLayout from './components/DashboardLayout';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <ParkingProvider>
        <div className="app-container">
          <DashboardLayout />
        </div>
      </ParkingProvider>
    </AuthProvider>
  );
}

export default App;
