import React from 'react';
import { ParkingProvider } from './context/ParkingProvider';
import { AuthProvider } from './context/AuthProvider';
import { NotificationProvider } from './components/NotificationPortal';
import DashboardLayout from './components/DashboardLayout';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ParkingProvider>
          <div className="app-container">
            <DashboardLayout />
          </div>
        </ParkingProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
