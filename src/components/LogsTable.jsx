import React from 'react';
import { useParking } from '../context/ParkingProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Shield, LogIn, LogOut, Bookmark, Info, Activity } from 'lucide-react';

const LogsTable = ({ limit }) => {
  const { logs } = useParking();

  const displayLogs = limit ? logs.slice(0, limit) : logs;

  const getEventInsight = (event) => {
    if (event.includes('ENTRY'))   return { color: 'var(--status-available)', icon: <LogIn  size={16} />, label: 'Vehicle Entry',    description: 'AI verified parking access'         };
    if (event.includes('EXIT'))    return { color: 'var(--text-secondary)',   icon: <LogOut size={16} />, label: 'Vehicle Departure', description: 'Sensor confirmed slot clearing'     };
    if (event.includes('BOOKING')) return { color: 'var(--status-booked)',    icon: <Bookmark size={16} />, label: 'Reservation',    description: 'Slot secured via user request'     };
    if (event.includes('FINE'))    return { color: 'var(--status-fined)',     icon: <Shield size={16} />, label: 'Policy Violation',  description: 'Improper parking state detected'   };
    return                                 { color: 'var(--accent-primary)',  icon: <Info   size={16} />, label: 'System Update',    description: 'Internal automated process'        };
  };

  if (logs.length === 0) {
    return (
      <div className="cyber-card" style={{ padding: '2.5rem', textAlign: 'center', background: 'rgba(15,23,42,0.4)' }}>
        <Activity size={40} style={{ margin: '0 auto 1rem', opacity: 0.2, display: 'block' }} />
        <div className="text-muted" style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>
          WAITING FOR LIVE INTELLIGENCE FEED...
        </div>
      </div>
    );
  }

  return (
    /* Outer wrapper: overflow-x:auto makes the table scroll horizontally on small screens */
    <div style={{ overflowX: 'auto', borderRadius: '1.25rem' }}>
      <div className="cyber-card" style={{
        background: 'rgba(15,23,42,0.4)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        minWidth: '560px', /* prevents columns collapsing to nothing */
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(99,102,241,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Time', 'Event', 'Plate', 'Location'].map((h, i) => (
                <th key={h} style={{
                  padding: '1rem 1.25rem',
                  fontSize: '0.7rem', fontWeight: '800',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.1em',
                  textAlign: i === 3 ? 'right' : 'left',
                  whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {displayLogs.map((log, index) => {
                const insight = getEventInsight(log.event);
                return (
                  <motion.tr
                    key={log._id || log.id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25, delay: index * 0.02 }}
                    className="table-row-hover"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}
                  >
                    {/* Time */}
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', fontWeight: '500', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    {/* Event */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          color: insight.color,
                          background: `${insight.color}15`,
                          padding: '5px', borderRadius: '7px', display: 'flex', flexShrink: 0,
                        }}>
                          {insight.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white', whiteSpace: 'nowrap' }}>{insight.label}</div>
                          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)' }}>{insight.description}</div>
                        </div>
                      </div>
                    </td>

                    {/* Plate */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {log.plateNumber ? (
                        <span style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          padding: '3px 8px', borderRadius: '6px',
                          fontSize: '0.75rem', fontWeight: '800',
                          letterSpacing: '0.05em',
                          fontFamily: 'monospace',
                          whiteSpace: 'nowrap',
                        }}>
                          {log.plateNumber}
                        </span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>N/A</span>
                      )}
                    </td>

                    {/* Location */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      {log.slotId ? (
                        <span style={{ fontWeight: '800', color: 'var(--accent-primary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          Slot {log.slotId}
                        </span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>SYSTEM</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        <style>{`
          .table-row-hover { transition: background 0.15s ease; }
          .table-row-hover:hover { background: rgba(255,255,255,0.03) !important; }
        `}</style>
      </div>
    </div>
  );
};

export default LogsTable;
