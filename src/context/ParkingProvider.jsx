import React, { createContext, useContext, useState, useEffect } from 'react';

const ParkingContext = createContext();

export const useParking = () => useContext(ParkingContext);

// Base API URL — set VITE_API_URL in your deployment environment (.env file or hosting config)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const ParkingProvider = ({ children }) => {

  const [slots, setSlots] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ available: 0, occupied: 0, booked: 0, fined: 0, totalRevenue: 0 });
  const [settings, setSettings] = useState({ totalSlots: 12, fineAmount: 50, hourlyRate: 20 });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch and apply latest data from the API
  const fetchStatus = async () => {
      try {
          const res = await fetch(`${API_BASE}/api/status`);
          if (res.ok) {
              const data = await res.json();

              setSlots(prev => {
                  const newSlots = (data.slots || []).sort((a, b) =>
                      a.slotId.localeCompare(b.slotId, undefined, { numeric: true, sensitivity: 'base' })
                  );
                  if (JSON.stringify(prev) === JSON.stringify(newSlots)) return prev;
                  return newSlots;
              });

              setLogs(prev => {
                  if (JSON.stringify(prev) === JSON.stringify(data.logs)) return prev;
                  return data.logs || [];
              });

              setStats(prev => {
                  if (JSON.stringify(prev) === JSON.stringify(data.stats)) return prev;
                  return data.stats || { available: 12, occupied: 0, booked: 0, fined: 0, totalRevenue: 0 };
              });

              if (data.settings) {
                  setSettings(prev => {
                      if (JSON.stringify(prev) === JSON.stringify(data.settings)) return prev;
                      return data.settings;
                  });
              }
          }
      } catch (error) {
          console.log('Waiting for backend API to start...');
      } finally {
          setLoading(false);
      }
  };

  const fetchNow = () => fetchStatus();

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Actions ──────────────────────────────────────────────────────────

  const simulateArrival = async (slotId, plateNumber) => {
    try {
        await fetch(`${API_BASE}/api/slots/${slotId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'occupied', plateNumber, entryTime: new Date() })
        });
        await fetch(`${API_BASE}/api/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'CAMERA: ENTRY', plateNumber, slotId })
        });
        fetchStatus();
    } catch (e) { console.error('Error simulating arrival:', e); }
  };

  const simulateDeparture = async (slotId) => {
    try {
        const slot = slots.find(s => s.slotId === slotId);
        if (!slot) return;

        // Calculate fee
        const entryTime = slot.entryTime || slot.bookingTime || new Date();
        const durationMs = new Date() - new Date(entryTime);
        const durationHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
        const amount = durationHours * (settings.hourlyRate || 20);

        await fetch(`${API_BASE}/api/slots/${slotId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'available', plateNumber: null, entryTime: null, bookingTime: null, bookingDuration: 0 })
        });

        await fetch(`${API_BASE}/api/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              event: 'SENSOR: EXIT', 
              plateNumber: slot.plateNumber, 
              slotId, 
              amount: amount,
              details: `Stay duration: ${durationHours}h. Total Fee: ₹${amount}` 
            })
        });
        fetchStatus();
        return { success: true, amount };
    } catch (e) { 
        console.error('Error simulating departure:', e); 
        throw e;
    }
  };

  const simulateBadParking = async (slotId, plateNumber) => {
    try {
        await fetch(`${API_BASE}/api/slots/${slotId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'fined', plateNumber, entryTime: new Date() })
        });
        await fetch(`${API_BASE}/api/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'CAMERA: FINE ISSUED', plateNumber, slotId, details: 'Improper parking alignment detected' })
        });
        fetchStatus();
    } catch (e) { console.error('Error simulating bad parking:', e); }
  };

  const bookSlot = async (slotId, plateNumber, duration = 1) => {
     try {
        await fetch(`${API_BASE}/api/slots/${slotId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              status: 'booked', 
              plateNumber, 
              bookingTime: new Date(),
              bookingDuration: parseInt(duration)
            })
        });
        await fetch(`${API_BASE}/api/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              event: 'USER: BOOKING', 
              plateNumber, 
              slotId, 
              details: `Reserved for ${duration} hours` 
            })
        });
        fetchStatus();
    } catch (e) { console.error('Error booking slot:', e); }
  };

  return (
    <ParkingContext.Provider
      value={{
        slots, stats, logs, settings,
        simulateArrival, simulateDeparture, simulateBadParking, bookSlot,
        fetchNow, loading, activeFilter, setActiveFilter,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};
