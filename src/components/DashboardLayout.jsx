import React, { useState } from 'react';
import Dashboard from './Dashboard';
import SlotGrid from './SlotGrid';
import LogsTable from './LogsTable';
import BookingModal from './BookingModal';
import ImageUploadModal from './ImageUploadModal';
import AdminDashboard from './AdminDashboard';
import AuthModal from './AuthModal';
import Notifications from './Notifications';
import AITrends from './AITrends';
import SimulationPanel from './SimulationPanel';
import VisionMonitor from './VisionMonitor';
import { Camera, Car, UploadCloud, Settings as SettingsIcon, LogIn, LogOut, User, Menu, X, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthProvider';
import { useParking } from '../context/ParkingProvider';

const DashboardLayout = () => {
  const { activeFilter, setActiveFilter } = useParking();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSimOpen, setIsSimOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  const filters = [
    { id: 'all',       label: 'All',      cls: 'all' },
    { id: 'available', label: 'Available', cls: 'available' },
    { id: 'occupied',  label: 'Occupied',  cls: 'occupied' },
    { id: 'booked',    label: 'Reserved',  cls: 'booked' },
    { id: 'fined',     label: 'Fined',     cls: 'fined' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Navigation Bar ─────────────────────────────────── */}
      <header
        className="glass-panel nav-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          borderRadius: '0',
          borderTop: '0', borderLeft: '0', borderRight: '0',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
            padding: '8px', borderRadius: '12px',
            boxShadow: '0 4px 15px var(--accent-glow)',
            flexShrink: 0,
          }}>
            <Camera size={22} color="white" />
          </div>
          <div>
            <h2 className="nav-brand-title" style={{ fontSize: '1.15rem', lineHeight: 1 }}>SmartPark AI</h2>
            <span className="hero-subtitle text-xs text-secondary">Live Automated View</span>
          </div>
        </div>

        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Actions */}
        <div className={`nav-actions ${isMobileMenuOpen ? 'open' : ''}`} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {isAdmin && (
            <>
              <button className="btn" onClick={() => setIsAdminOpen(true)}
                style={{ borderColor: 'var(--text-muted)', color: 'var(--text-secondary)' }}>
                <SettingsIcon size={15} style={{ marginRight: '5px' }} /> Admin
              </button>
              <button className="btn" onClick={() => setIsUploadOpen(true)}
                style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
                <UploadCloud size={15} style={{ marginRight: '5px' }} /> Upload AI
              </button>
            </>
          )}

          <div className="nav-separator" style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)', margin: '0 0.25rem' }} />

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <User size={15} className="text-accent" /> {user.username}
              </div>
              <button className="btn" onClick={logout}
                style={{ padding: '0.4rem 0.75rem', borderColor: '#ef4444', color: '#ef4444' }}>
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => setIsAuthOpen(true)}
              style={{ padding: '0.4rem 1rem' }}>
              <LogIn size={15} style={{ marginRight: '6px' }} /> Login
            </button>
          )}

          <button className="btn" onClick={() => setIsSimOpen(true)}
            style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
            <Cpu size={16} style={{ marginRight: '6px' }} /> Virtual Simulator
          </button>

          <button className="btn btn-primary" onClick={() => setIsBookingOpen(true)}>
            <Car size={16} style={{ marginRight: '6px' }} /> Reserve a Slot
          </button>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '0 0 3rem 0', overflowY: 'auto' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

            {/* Page Title */}
            <div className="dashboard-header" style={{ marginBottom: '0' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem' }}>Global Parking Status</h1>
                <p className="text-secondary" style={{ fontSize: '1rem', marginTop: '0.25rem' }}>
                  Real-time overview via simulated AI Camera feed.
                </p>
              </div>
            </div>

            {/* Stats */}
            <Dashboard />

            {/* AI Trends */}
            <AITrends />

            {/* Live Vision Monitor */}
            <VisionMonitor />

            {/* Slot Grid with Filter Bar */}
            <div>
              {/* Section Header */}
              <div className="slot-section-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}>
                <h3 style={{ fontSize: '1.4rem' }}>Live Slot Grid</h3>

                {/* Filter Badges */}
                <div className="filter-bar" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {filters.map(badge => (
                    <button
                      key={badge.id}
                      onClick={() => setActiveFilter(badge.id)}
                      className={`badge badge-${badge.cls} ${activeFilter === badge.id ? 'active' : ''}`}
                      style={{
                        cursor: 'pointer',
                        opacity: activeFilter === badge.id ? 1 : 0.6,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: activeFilter === badge.id ? 'scale(1.05)' : 'scale(1)',
                        outline: 'none',
                        background: 'none',
                      }}
                    >
                      {badge.label}
                    </button>
                  ))}
                </div>
              </div>

              <SlotGrid />
            </div>

            {/* Logs */}
            <div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Recent AI Events</h3>
              <LogsTable limit={10} />
            </div>

          </div>
        </div>
      </main>

      {/* Modals */}
      {isBookingOpen  && <BookingModal     onClose={() => setIsBookingOpen(false)}  />}
      {isUploadOpen   && <ImageUploadModal onClose={() => setIsUploadOpen(false)}   />}
      {isAdminOpen    && <AdminDashboard   onClose={() => setIsAdminOpen(false)}    />}
      {isAuthOpen     && <AuthModal        onClose={() => setIsAuthOpen(false)}     />}
      {isSimOpen      && <SimulationPanel   onClose={() => setIsSimOpen(false)}      />}

      <style>{`
        @keyframes pulse {
          0%   { transform: scale(1);   opacity: 1;   }
          50%  { transform: scale(1.5); opacity: 0.4; }
          100% { transform: scale(1);   opacity: 1;   }
        }
      `}</style>

      {isSimOpen && <SimulationPanel onClose={() => setIsSimOpen(false)} />}
      <Notifications />
    </div>
  );
};

export default DashboardLayout;
