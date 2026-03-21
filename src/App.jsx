import React from 'react';
import { ParkingProvider } from './context/ParkingProvider';
import { AuthProvider } from './context/AuthProvider';
import { NotificationProvider } from './components/NotificationPortal';
import DashboardLayout from './components/DashboardLayout';
import MobileScanner from './components/MobileScanner';
import './index.css';

function App() {
  const isScanner = window.location.pathname === '/scan';

  return (
    <AuthProvider>
      <NotificationProvider>
        <ParkingProvider>
          <div className="app-container">
            {isScanner ? <MobileScanner /> : <DashboardLayout />}
          </div>
        </ParkingProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
