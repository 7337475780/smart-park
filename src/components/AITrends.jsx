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

      return {
         busySlot: peakSlot ? peakSlot[0] : 'N/A',
         revenueMix: totalRev > 0 ? ((parkingEarnings / totalRev) * 100).toFixed(0) : 100,
         peakHour: peakHour,
         occupancy: slots.length > 0 ? ((slots.filter(s => s.status !== 'available').length / slots.length) * 100).toFixed(0) : 0,
         status: slots.some(s => s.status === 'available') ? 'Balanced Load' : 'Critical Density'
      };
   }, [logs, slots]);

   if (!insights) return null;

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

         <div className="flex items-center gap-3" style={{ marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
            <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)' }}>
               <Brain className="text-accent" size={24} />
            </div>
            <div>
               <h3 style={{ fontSize: 'clamp(1rem, 4.5vw, 1.3rem)', fontWeight: '800', letterSpacing: '0.05em', color: '#fff', margin: 0, whiteSpace: 'normal', wordBreak: 'break-word' }}>AI Intelligence Node</h3>
               <p className="text-accent" style={{ fontSize: 'clamp(0.65rem, 3vw, 0.75rem)', opacity: 0.8, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Live Predictive Analytics</p>
            </div>
         </div>

         <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 'clamp(1rem, 3vw, 2rem)', position: 'relative', zIndex: 1 }}>

            {/* Metric 1 */}
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
               <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                  <TrendingUp size={18} style={{ color: 'var(--status-available)' }} />
                  <span className="text-xs text-secondary uppercase font-bold" style={{ letterSpacing: '0.1em' }}>Revenue Mix</span>
               </div>
               <div style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'monospace', color: '#fff' }}>
                  {insights.revenueMix}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>%</span>
               </div>
               <div className="text-xs" style={{ marginTop: '0.5rem', color: 'var(--status-available)', fontWeight: '600' }}>{100 - insights.revenueMix}% violations</div>
            </div>

            {/* Metric 2 */}
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
               <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                  <Clock size={18} style={{ color: 'var(--status-booked)' }} />
                  <span className="text-xs text-secondary uppercase font-bold" style={{ letterSpacing: '0.1em' }}>Peak Velocity</span>
               </div>
               <div style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'monospace', color: '#fff' }}>
                  {insights.peakHour}:00<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>-{insights.peakHour + 1}:00</span>
               </div>
               <div className="text-xs" style={{ marginTop: '0.5rem', color: 'var(--status-booked)', fontWeight: '600' }}>Max predicted slot turnover</div>
            </div>

            {/* Metric 3 */}
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '1rem', border: '1px solid rgba(99,102,241,0.2)', boxShadow: 'inset 0 0 20px rgba(99,102,241,0.05)', transition: 'transform 0.3s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
               <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                  <Zap size={18} className="text-accent" />
                  <span className="text-xs text-secondary uppercase font-bold" style={{ letterSpacing: '0.1em' }}>System Load</span>
               </div>
               <div style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                  {insights.occupancy}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>%</span>
               </div>
               <div className="text-xs" style={{ marginTop: '0.5rem', fontWeight: '600', color: insights.status.includes('Critical') ? 'var(--status-occupied)' : 'var(--accent-primary)' }}>
                  {insights.status} <Activity size={12} style={{ display: 'inline', marginLeft: '4px' }} />
               </div>
            </div>
         </div>
      </div>
   );
};

export default AITrends;
