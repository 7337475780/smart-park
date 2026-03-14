import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, X, Save, CheckCircle2, Users, User, Shield, ShieldAlert, ShieldOff } from 'lucide-react';
import { useParking } from '../context/ParkingProvider';

// Base API URL — set VITE_API_URL in your deployment environment
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = ({ onClose }) => {
  const { settings } = useParking();
  const [totalSlots, setTotalSlots] = useState(settings?.totalSlots || 12);
  const [fineAmount, setFineAmount] = useState(settings?.fineAmount || 50);
  const [hourlyRate, setHourlyRate] = useState(settings?.hourlyRate || 20);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [activeTab, setActiveTab] = useState('settings');
  const [userList, setUserList] = useState([]);
  const [userActionLoading, setUserActionLoading] = useState(null);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0 && !initialized) {
        if (settings.totalSlots !== undefined) setTotalSlots(settings.totalSlots);
        if (settings.fineAmount !== undefined) setFineAmount(settings.fineAmount);
        if (settings.hourlyRate !== undefined) setHourlyRate(settings.hourlyRate);
        setInitialized(true);
    }
  }, [settings, initialized]);

  const fetchUsers = async () => {
    try {
        const res = await fetch(`${API_BASE}/api/users`);
        if (res.ok) setUserList(await res.json());
    } catch (e) { console.error('Failed to fetch users'); }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const handleRoleChange = async (userId, newRole) => {
    setUserActionLoading(userId);
    try {
        const res = await fetch(`${API_BASE}/api/users/${userId}/role`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole })
        });
        if (res.ok) fetchUsers();
    } catch (e) {
        alert('Failed to update user role');
    } finally {
        setUserActionLoading(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch(`${API_BASE}/api/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            totalSlots: totalSlots !== '' ? Number(totalSlots) : settings.totalSlots,
            fineAmount: fineAmount !== '' ? Number(fineAmount) : settings.fineAmount,
            hourlyRate: hourlyRate !== '' ? Number(hourlyRate) : settings.hourlyRate,
          })
      });

      if (response.ok) {
          setSaveSuccess(true);
          setTimeout(() => { setSaveSuccess(false); onClose(); }, 1500);
      } else {
          alert('Failed to save settings.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: '1rem',
    }}>
      <div className="glass-panel modal-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SettingsIcon className="text-accent" size={20} /> Admin Panel
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <button
            className={`btn ${activeTab === 'settings' ? 'btn-primary' : ''}`}
            style={{ flex: '1 1 auto', minWidth: '120px', height: '36px', fontSize: '0.82rem' }}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={13} style={{ marginRight: '5px' }} /> App Config
          </button>
          <button
            className={`btn ${activeTab === 'users' ? 'btn-primary' : ''}`}
            style={{ flex: '1 1 auto', minWidth: '120px', height: '36px', fontSize: '0.82rem' }}
            onClick={() => setActiveTab('users')}
          >
            <Users size={13} style={{ marginRight: '5px' }} /> Users
          </button>
        </div>

        {activeTab === 'settings' ? (
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Total Parking Slots</label>
              <input type="number" min="1" max="100" className="form-input"
                value={totalSlots} onChange={e => setTotalSlots(e.target.value)} required />
              <p className="text-xs text-muted" style={{ marginTop: '0.4rem' }}>
                Warning: Reducing slots will delete the highest-ID slots from the database.
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Violation Fine (₹)</label>
              <input type="number" min="0" step="5" className="form-input"
                value={fineAmount} onChange={e => setFineAmount(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Hourly Rate (₹)</label>
              <input type="number" min="0" step="1" className="form-input"
                value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} required />
              <p className="text-xs text-muted" style={{ marginTop: '0.4rem' }}>
                Calculated dynamically based on stay duration.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button type="button" className="btn" style={{ flex: '1 1 auto', minWidth: '100px' }} onClick={onClose} disabled={isSaving}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: '2 1 auto', minWidth: '160px' }} disabled={isSaving || saveSuccess}>
                {isSaving ? 'Saving...' : saveSuccess
                  ? <><CheckCircle2 size={16} style={{ marginRight: '6px' }} />Saved!</>
                  : <><Save size={16} style={{ marginRight: '6px' }} />Apply Changes</>}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            <p className="text-sm text-secondary" style={{ marginBottom: '1.25rem' }}>
              Promote users to Admin or remove privileges. The default 'admin' account cannot be modified.
            </p>
            {userList.map(user => (
              <div key={user._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.65rem 0.75rem',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: '0.75rem',
                marginBottom: '0.4rem',
                flexWrap: 'wrap', gap: '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    padding: '0.4rem', borderRadius: '50%',
                    backgroundColor: user.role === 'admin' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                  }}>
                    {user.role === 'admin'
                      ? <Shield size={14} style={{ color: 'var(--status-available)' }} />
                      : <User size={14} className="text-secondary" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>{user.username}</div>
                    <div className="text-xs text-muted">{user.role}</div>
                  </div>
                </div>

                {user.username !== 'admin' && (
                  <button
                    className="btn text-xs"
                    style={{
                      height: '30px', fontSize: '0.75rem',
                      borderColor: user.role === 'admin' ? '#ef4444' : 'var(--status-available)',
                      color:       user.role === 'admin' ? '#ef4444' : 'var(--status-available)',
                      opacity: userActionLoading === user._id ? 0.5 : 1,
                    }}
                    disabled={userActionLoading === user._id}
                    onClick={() => handleRoleChange(user._id, user.role === 'admin' ? 'user' : 'admin')}
                  >
                    {user.role === 'admin'
                      ? <><ShieldOff size={12} style={{ marginRight: '3px' }} />Remove</>
                      : <><ShieldAlert size={12} style={{ marginRight: '3px' }} />Make Admin</>}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
