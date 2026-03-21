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
import logo from '../assets/logo.png';

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
    { id: 'all', label: 'All', cls: 'all' },
    { id: 'available', label: 'Available', cls: 'available' },
    { id: 'occupied', label: 'Occupied', cls: 'occupied' },
    { id: 'booked', label: 'Reserved', cls: 'booked' },
    { id: 'fined', label: 'Fined', cls: 'fined' },
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
          padding: '1.25rem 2.5rem',
          borderRadius: '0',
          borderTop: '0', borderLeft: '0', borderRight: '0',
          borderBottom: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(99, 102, 241, 0.1)',
          backdropFilter: 'blur(20px) saturate(180%)',
          background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.8))',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Brand */}
        <div className="nav-brand-container" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'clamp(14px, 5vw, 24px)' 
        }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            padding: '4px', borderRadius: '14px',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
            flexShrink: 0,
            overflow: 'hidden',
            width: '42px', height: '42px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <img src={logo} alt="SmartPark AI Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h2 className="nav-brand-title" style={{ 
              fontSize: 'clamp(1rem, 4vw, 1.3rem)', 
              lineHeight: 1, 
              fontWeight: 800,
              color: 'var(--text-primary)',
              textShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
              letterSpacing: '-0.01em'
            }}>SmartPark AI</h2>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'clamp(6px, 1.5vw, 8px)', 
              marginTop: 'clamp(2px, 1vw, 4px)' 
            }}>
              <span className="status-dot" style={{
                width: 'clamp(5px, 1.25vw, 6px)', 
                height: 'clamp(5px, 1.25vw, 6px)', 
                borderRadius: '50%', 
                background: '#34d399',
                boxShadow: '0 0 8px #34d399',
                animation: 'pulse 2s infinite ease-in-out'
              }}></span>
              <span className="hero-subtitle text-xs text-secondary" style={{ 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                fontWeight: '600',
                fontSize: 'clamp(0.6rem, 1.5vw, 0.75rem)'
              }}>
                Live Automated View
              </span>
            </div>
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
              <button className="btn" onClick={() => setIsSimOpen(true)}
                style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
                <Cpu size={16} style={{ marginRight: '6px' }} /> Virtual Simulator
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
                 flexWrap: 'wrap',
                 gap: '1rem',
                 justifyContent: 'space-between',
              }}>
                <h3 style={{ fontSize: '1.4rem' }}>Live Slot Grid</h3>

                {/* Filter Badges */}
                 <div className="filter-bar" style={{ 
                   display: 'flex', 
                   gap: '12px', 
                   flexWrap: 'wrap', 
                   justifyContent: 'center',
                   width: '100%',
                   padding: '4px 0',
                 }}>
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
      {isBookingOpen && <BookingModal onClose={() => setIsBookingOpen(false)} />}
      {isUploadOpen && <ImageUploadModal onClose={() => setIsUploadOpen(false)} />}
      {isAdminOpen && <AdminDashboard onClose={() => setIsAdminOpen(false)} />}
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
      {isSimOpen && <SimulationPanel onClose={() => setIsSimOpen(false)} />}

      <style>{`
        @keyframes pulse {
          0%   { transform: scale(1);   opacity: 1;   }
          50%  { transform: scale(1.5); opacity: 0.4; }
          100% { transform: scale(1);   opacity: 1;   }
        }
      `}</style>

      <Notifications />
    </div>
  );
};

export default DashboardLayout;
