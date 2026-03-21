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
                      filter: `drop-shadow(0 0 10px ${m.color})`
                    }}
                  />
                </svg>
                <div
                  className="dashboard-stat-value"
                  style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    fontSize: 'clamp(1.2rem, 5vw, 1.6rem)', fontWeight: '800', fontFamily: 'monospace'
                  }}
                >
                  {m.value}
                </div>
              </div>

              <div
                className="dashboard-stat-label flex items-center justify-center gap-2"
                style={{
                  color: m.color,
                  fontWeight: '700',
                  fontSize: 'clamp(0.65rem, 2vw, 0.85rem)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
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

        {/* Occupancy Distribution Chart */}
        <div
          className="cyber-card"
          style={{
            padding: '2rem',
            gridColumn: '1 / -1',
            background: 'rgba(15,23,42,0.4)',
            display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap'
          }}
        >
          <div style={{ position: 'relative', width: '160px', height: '160px', flexShrink: 0 }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
              {metrics.map((m, i) => {
                const total = settings.totalSlots || 1;
                const prevSum = metrics.slice(0, i).reduce((acc, curr) => acc + curr.value, 0);
                const startAngle = (prevSum / total) * 360;
                const sliceAngle = (m.value / total) * 360;

                // SVG Circle arc approximation
                const x1 = 50 + 40 * Math.cos(Math.PI * (startAngle - 90) / 180);
                const y1 = 50 + 40 * Math.sin(Math.PI * (startAngle - 90) / 180);
                const x2 = 50 + 40 * Math.cos(Math.PI * (startAngle + sliceAngle - 90) / 180);
                const y2 = 50 + 40 * Math.sin(Math.PI * (startAngle + sliceAngle - 90) / 180);
                const largeArc = sliceAngle > 180 ? 1 : 0;

                return m.value > 0 ? (
                  <path
                    key={i}
                    d={`M ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2}`}
                    fill="none"
                    stroke={m.color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    style={{ transition: 'all 0.5s ease', filter: `drop-shadow(0 0 10px ${m.color})` }}
                  />
                ) : null;
              })}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: '900' }}>{settings.totalSlots}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Slots</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h4 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Live Occupancy Split</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {metrics.map(m => (
                <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: m.color,
                    boxShadow: `0 0 8px ${m.color}`
                  }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {m.label}: <strong style={{ color: '#fff' }}>{m.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

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

          <div style={{ height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: '68%', height: '100%', background: 'linear-gradient(90deg, var(--accent-hover), var(--accent-primary))', boxShadow: '0 0 15px var(--accent-primary)' }}></div>
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
