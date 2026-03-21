import React, { useState } from 'react';
import { useParking } from '../context/ParkingProvider';
import { useNotifications } from './NotificationPortal';
import { X } from 'lucide-react';

const BookingModal = ({ onClose }) => {
  const { slots, bookSlot } = useParking();
  const { showToast } = useNotifications();
  const [plate, setPlate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [duration, setDuration] = useState('1');

  const availableSlots = slots.filter(s => s.status === 'available');

  const handleBooking = async (e) => {
    e.preventDefault();
    if (plate && selectedSlot) {
      try {
        await bookSlot(selectedSlot, plate, duration);
        showToast(`Slot ${selectedSlot} reserved successfully`, 'success');
        onClose();
      } catch (err) {
        showToast('Failed to reserve slot', 'error');
      }
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: '1rem',
    }}>
      <div className="glass-panel modal-panel" style={{
        width: '100%', maxWidth: '500px', padding: '2rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem' }}>Reserve a Slot</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {availableSlots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--status-occupied)' }}>
            No parking slots available for reservation.
          </div>
        ) : (
          <form onSubmit={handleBooking}>
            <div className="form-group">
              <label className="form-label">Vehicle License Plate</label>
              <input
                type="text" className="form-input"
                value={plate} onChange={e => setPlate(e.target.value)}
                placeholder="Enter plate number" required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Select Available Slot</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
                gap: '0.6rem',
                maxHeight: '180px',
                overflowY: 'auto',
                padding: '0.5rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '0.75rem',
                border: '1px solid var(--glass-border)',
              }}>
                {availableSlots.map(s => (
                  <div
                    key={s.slotId}
                    onClick={() => setSelectedSlot(s.slotId)}
                    style={{
                      padding: '0.65rem 0.5rem',
                      textAlign: 'center',
                      borderRadius: '0.5rem',
                      border: `1px solid ${selectedSlot === s.slotId ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)'}`,
                      backgroundColor: selectedSlot === s.slotId ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      color: selectedSlot === s.slotId ? 'var(--text-primary)' : 'var(--text-secondary)',
                      boxShadow: selectedSlot === s.slotId ? '0 0 12px rgba(99,102,241,0.3)' : 'none',
                    }}
                  >
                    {s.slotId}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Duration (Hours)</label>
              <input
                type="number" min="1" max="24" className="form-input"
                value={duration} onChange={e => setDuration(e.target.value)} required
              />
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm Booking</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
