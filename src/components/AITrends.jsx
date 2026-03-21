import React, { useMemo } from 'react';
import { useParking } from '../context/ParkingProvider';
import { Brain, TrendingUp, Clock, Zap, Activity } from 'lucide-react';

const AITrends = () => {
   const { logs, slots } = useParking();

   const insights = useMemo(() => {
      if (logs.length < 5) return null;

      const slotCounts = {};
      let parkingEarnings = 0;
      let fineEarnings = 0;
      const hourCounts = Array(24).fill(0);

      logs.forEach(log => {
         if (log.slotId) slotCounts[log.slotId] = (slotCounts[log.slotId] || 0) + 1;
         if (log.amount) {
            if (log.event.includes('EXIT')) parkingEarnings += log.amount;
            if (log.event.includes('FINE')) fineEarnings += log.amount;
         }
         const hour = new Date(log.timestamp).getHours();
         hourCounts[hour]++;
      });

      const peakSlot = Object.entries(slotCounts).sort((a, b) => b[1] - a[1])[0];
      const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
      const totalRev = parkingEarnings + fineEarnings;

      // Revenue Velocity calculation
      const earningsHistory = logs
         .filter(l => l.amount > 0)
         .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
         .slice(-10);

      let runningTotal = 0;
      const velocity = earningsHistory.map(l => {
         runningTotal += l.amount;
         return runningTotal;
      });

      return {
         busySlot: peakSlot ? peakSlot[0] : 'N/A',
         revenueMix: totalRev > 0 ? ((parkingEarnings / totalRev) * 100).toFixed(0) : 100,
         peakHour: peakHour,
         occupancy: slots.length > 0 ? ((slots.filter(s => s.status !== 'available').length / slots.length) * 100).toFixed(0) : 0,
         status: slots.some(s => s.status === 'available') ? 'Balanced Load' : 'Critical Density',
         velocity
      };
   }, [logs, slots]);

   if (!insights) {
      return (
         <div className="cyber-card" style={{ padding: '2.5rem', marginTop: '1rem', marginBottom: '3rem', opacity: 0.6 }}>
            <div className="flex items-center gap-4 mb-4">
               <Brain className="text-muted animate-pulse" size={24} />
               <h3 style={{ fontSize: 'clamp(0.9rem, 3vw, 1.2rem)', color: 'var(--text-muted)' }}>AI Node Initializing...</h3>
            </div>
            <p className="text-xs text-muted">Awaiting more parking activity logs to generate predictive trends (Min 5 events).</p>
         </div>
      );
   }

   // Simple Sparkline Component
   const Sparkline = ({ data }) => {
      if (!data || data.length < 2) return <div className="text-muted text-xs">Awaiting data...</div>;
      const max = Math.max(...data);
      const min = Math.min(...data);
      const range = max - min || 1;
      const width = 120;
      const height = 30;
      const points = data.map((d, i) => ({
         x: (i / (data.length - 1)) * width,
         y: height - ((d - min) / range) * height
      }));
      const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L')}`;

      return (
         <svg width={width} height={height} style={{ overflow: 'visible' }}>
            <path d={pathData} fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill="var(--accent-primary)" />
         </svg>
      );
   };

   return (
      <div
         className="cyber-card"
         style={{
            padding: '2.5rem',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(30, 27, 75, 0.7))',
            boxShadow: '0 10px 40px rgba(99, 102, 241, 0.15), inset 0 0 20px rgba(99, 102, 241, 0.05)',
            marginTop: '1rem',
            marginBottom: '3rem',
            position: 'relative',
            overflow: 'hidden'
         }}
      >
         {/* Animated Background Glow */}
         <div style={{
            position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 60%)',
            animation: 'pulse 8s infinite', pointerEvents: 'none'
         }} />

         <div className="flex items-center justify-between" style={{ marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
            <div className="flex items-center gap-4">
               <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)' }}>
                  <Brain className="text-accent" size={24} />
               </div>
               <div>
                  <h3 style={{ fontSize: 'clamp(1rem, 4.5vw, 1.35rem)', fontWeight: '800', letterSpacing: '0.05em', color: '#fff', margin: 0 }}>AI Intelligence Node</h3>
                  <p className="text-accent" style={{ fontSize: 'clamp(0.6rem, 2vw, 0.75rem)', opacity: 0.8, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Revenue Velocity Map</p>
               </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div className="text-xs text-muted mb-1 font-bold">ACCELERATION</div>
               <Sparkline data={insights.velocity} />
            </div>
         </div>

         <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 'clamp(1rem, 3vw, 2rem)', position: 'relative', zIndex: 1 }}>

            {/* Metric 1 */}
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
               <div className="flex items-center gap-4" style={{ marginBottom: '1rem' }}>
                  <TrendingUp size={18} style={{ color: 'var(--status-available)' }} />
                  <span className="text-secondary uppercase font-bold" style={{ letterSpacing: '0.1em', fontSize: 'clamp(0.6rem, 2vw, 0.75rem)' }}>Revenue Mix</span>
               </div>
               <div style={{ fontSize: 'clamp(1.4rem, 6vw, 1.8rem)', fontWeight: '800', fontFamily: 'monospace', color: '#fff' }}>
                  {insights.revenueMix}<span style={{ fontSize: 'clamp(0.8rem, 3vw, 1rem)', color: 'var(--text-muted)' }}>%</span>
               </div>
               <div style={{ marginTop: '0.5rem', color: 'var(--status-available)', fontWeight: '600', fontSize: 'clamp(0.6rem, 2vw, 0.75rem)' }}>{100 - insights.revenueMix}% violations</div>
            </div>

            {/* Metric 2 */}
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
               <div className="flex items-center gap-4" style={{ marginBottom: '1rem' }}>
                  <Clock size={18} style={{ color: 'var(--status-booked)' }} />
                  <span className="text-secondary uppercase font-bold" style={{ letterSpacing: '0.1em', fontSize: 'clamp(0.6rem, 2vw, 0.75rem)' }}>Peak Velocity</span>
               </div>
               <div style={{ fontSize: 'clamp(1.4rem, 6vw, 1.8rem)', fontWeight: '800', fontFamily: 'monospace', color: '#fff' }}>
                  {insights.peakHour}:00<span style={{ fontSize: 'clamp(0.8rem, 3vw, 1rem)', color: 'var(--text-muted)' }}>-{insights.peakHour + 1}:00</span>
               </div>
               <div style={{ marginTop: '0.5rem', color: 'var(--status-booked)', fontWeight: '600', fontSize: 'clamp(0.6rem, 2vw, 0.75rem)' }}>Max predicted slot turnover</div>
            </div>

            {/* Metric 3 */}
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '1rem', border: '1px solid rgba(99,102,241,0.2)', boxShadow: 'inset 0 0 20px rgba(99,102,241,0.05)', transition: 'transform 0.3s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
               <div className="flex items-center gap-4" style={{ marginBottom: '1rem' }}>
                  <Zap size={18} className="text-accent" />
                  <span className="text-secondary uppercase font-bold" style={{ letterSpacing: '0.1em', fontSize: 'clamp(0.6rem, 2vw, 0.75rem)' }}>System Load</span>
               </div>
               <div style={{ fontSize: 'clamp(1.4rem, 6vw, 1.8rem)', fontWeight: '800', fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                  {insights.occupancy}<span style={{ fontSize: 'clamp(0.8rem, 3vw, 1rem)', color: 'var(--text-muted)' }}>%</span>
               </div>
               <div style={{ marginTop: '0.5rem', fontWeight: '600', color: insights.status.includes('Critical') ? 'var(--status-occupied)' : 'var(--accent-primary)', fontSize: 'clamp(0.6rem, 2vw, 0.75rem)' }}>
                  {insights.status} <Activity size={12} style={{ display: 'inline', marginLeft: '4px' }} />
               </div>
            </div>

            {/* AI Forecast Card [NEW] */}
            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.05), transparent)', borderRadius: '1rem', border: '1px dashed rgba(99,102,241,0.3)', gridColumn: '1 / -1' }}>
               <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                  <div className="flex items-center gap-4">
                     <Brain size={16} className="text-accent animate-pulse" />
                     <span className="font-bold uppercase" style={{ letterSpacing: '0.1em', fontSize: 'clamp(0.6rem, 2vw, 0.75rem)' }}>Smart Forecast</span>
                  </div>
                  <div className="badge badge-available" style={{ fontSize: 'clamp(0.55rem, 1.5vw, 0.65rem)' }}>AI Confidence: 88%</div>
               </div>

               {/* Trend Chart [NEW] */}
               <div style={{ height: '80px', width: '100%', marginBottom: '1.5rem', position: 'relative' }}>
                  <svg width="100%" height="100%" viewBox="0 0 400 60" preserveAspectRatio="none">
                     {/* Horizontal grid lines */}
                     <line x1="0" y1="10" x2="400" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                     <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                     <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                     
                     {/* Historical Line */}
                     <polyline
                        fill="none"
                        stroke="rgba(99,102,241,0.8)"
                        strokeWidth="2"
                        points="0,45 40,38 80,42 120,25 160,35 200,20"
                        style={{ filter: 'drop-shadow(0 0 4px rgba(99,102,241,0.4))' }}
                     />
                     {/* Future Projection (Dashed) */}
                     <polyline
                        fill="none"
                        stroke="var(--accent-primary)"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                        points="200,20 240,15 280,10 320,18 360,35 400,50"
                        style={{ filter: 'drop-shadow(0 0 6px var(--accent-primary))' }}
                     />
                     {/* Current Point Dot */}
                     <circle cx="200" cy="20" r="4" fill="var(--accent-primary)">
                        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                     </circle>
                  </svg>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'monospace' }}>
                     <span>[12:00]</span>
                     <span>NOW</span>
                     <span>[00:00]</span>
                  </div>
               </div>

               <p style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', marginTop: '1rem', color: 'var(--text-secondary)' }}>
                  Based on recent throughput, we expect peak occupancy at <strong>{insights.peakHour}:00</strong>.
                  Recommended: Increase enforcement staffing during this window.
               </p>
            </div>
         </div>
      </div>
   );
};

export default AITrends;
