import React from 'react';
import { useParking } from '../context/ParkingProvider';
import { CheckCircle, AlertTriangle, AlertCircle, IndianRupee, Car } from 'lucide-react';

const Dashboard = () => {
  const { stats, settings } = useParking();

  const metrics = [
    {
      label: 'Available',
      value: stats.available,
      max: settings.totalSlots,
      color: 'var(--status-available)',
      icon: <CheckCircle size={16} />
    },
    {
      label: 'Occupied',
      value: stats.occupied,
      max: settings.totalSlots,
      color: 'var(--status-occupied)',
      icon: <Car size={16} />
    },
    {
      label: 'Reserved',
      value: stats.booked,
      max: settings.totalSlots,
      color: 'var(--status-booked)',
      icon: <AlertCircle size={16} />
    },
    {
      label: 'Fined',
      value: stats.fined,
      max: settings.totalSlots,
      color: 'var(--status-fined)',
      icon: <AlertTriangle size={16} />
    }
  ];

  return (
    <>
      <style>{`
        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
        }
        
        @media (max-width: 480px) {
          .dashboard-stats-grid {
             grid-template-columns: 1fr 1fr;
             gap: 1rem;
          }
          .dashboard-stat-card {
             padding: 1.25rem 0.5rem !important;
          }
          .dashboard-stat-svg {
             width: 80px !important;
             height: 80px !important;
             margin-bottom: 1rem !important;
          }
          .dashboard-stat-value {
             font-size: 1.4rem !important;
          }
          .dashboard-stat-label {
             font-size: 0.7rem !important;
          }
        }
      `}</style>
      
      <div className="dashboard-stats-grid">
        {metrics.map((m, i) => {
          const percentage = m.max > 0 ? (m.value / m.max) * 100 : 0;
          const validPercentage = isNaN(percentage) ? 0 : percentage;
          const circumference = 2 * Math.PI * 45;
          const offset = circumference - (validPercentage / 100) * circumference;

          return (
            <div 
              key={i} 
              className="cyber-card dashboard-stat-card" 
              style={{ 
                padding: '2rem', 
                textAlign: 'center',
                background: `linear-gradient(160deg, rgba(15,23,42,0.8), rgba(0,0,0,0.6))`,
                border: `1px solid ${m.color}22`,
                boxShadow: `inset 0 0 15px ${m.color}08`,
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'default'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 10px 30px ${m.color}15, inset 0 0 20px ${m.color}15`;
                e.currentTarget.style.borderColor = `${m.color}44`;
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = `inset 0 0 15px ${m.color}08`;
                e.currentTarget.style.borderColor = `${m.color}22`;
              }}
            >
              {/* Circular Gauge */}
              <div className="dashboard-stat-svg" style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 1.5rem auto' }}>
                <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                  <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="45" fill="none"
                    stroke={m.color} strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
                      filter: `drop-shadow(0 0 8px ${m.color}88)`
                    }}
                  />
                </svg>
                <div 
                  className="dashboard-stat-value"
                  style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    fontSize: '1.6rem', fontWeight: '800', fontFamily: 'monospace'
                  }}
                >
                  {m.value}
                </div>
              </div>

              <div className="dashboard-stat-label flex items-center justify-center gap-2" style={{ color: m.color, fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {m.icon} {m.label}
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '3px', justifyContent: 'center' }}>
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} style={{
                    width: '4px', height: '4px', borderRadius: '50%',
                    background: idx < (percentage / 16) ? m.color : 'rgba(255,255,255,0.1)'
                  }} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Special Revenue Command Card */}
        <div 
          className="cyber-card dashboard-stat-card" 
          style={{ 
            padding: '2rem', 
            display: 'flex', flexDirection: 'column', justifyContent: 'center', 
            background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.1), rgba(15,23,42,0.8))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.1), inset 0 0 15px rgba(99, 102, 241, 0.05)',
            gridColumn: '1 / -1' // Span full width of grid
          }}
        >
          <div className="flex justify-between items-start" style={{ marginBottom: '1rem' }}>
            <IndianRupee className="text-accent" size={26} />
            <div className="badge badge-available">Live Feed</div>
          </div>
          <div className="text-xs text-secondary uppercase" style={{ letterSpacing: '0.1em', fontWeight: '600' }}>Target Revenue Status</div>
          
          <div style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: '800', margin: '0.5rem 0', fontFamily: 'monospace' }}>
            <span style={{ color: 'var(--text-muted)' }}>₹</span>{stats.totalRevenue}
          </div>
          
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '45%', height: '100%', background: 'linear-gradient(90deg, var(--accent-hover), var(--accent-primary))', boxShadow: '0 0 10px var(--accent-primary)' }}></div>
          </div>
          <p className="text-xs text-muted" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-available)', display: 'inline-block' }}></span>
            Automated settlement active
          </p>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
