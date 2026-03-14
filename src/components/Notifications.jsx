import React, { useState, useEffect, useCallback } from 'react';
import { useParking } from '../context/ParkingProvider';
import { Bell, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TOAST_DURATION = 5000;

const Toast = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const getLogIcon = (event) => {
    if (event.includes('ENTRY')) return <CheckCircle size={16} style={{ color: 'var(--status-available)' }} />;
    if (event.includes('FINE'))  return <AlertTriangle size={16} style={{ color: 'var(--status-fined)' }} />;
    if (event.includes('EXIT'))  return <Info size={16} style={{ color: 'var(--text-secondary)' }} />;
    return <Bell size={16} style={{ color: 'var(--accent-primary)' }} />;
  };

  const borderColor = toast.event.includes('ENTRY')
    ? 'var(--status-available)'
    : toast.event.includes('FINE')
      ? 'var(--status-fined)'
      : 'var(--accent-primary)';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
      className="glass-panel toast-card"
      style={{
        padding: '1rem',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
        pointerEvents: 'auto',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        borderLeft: `4px solid ${borderColor}`,
        marginBottom: '0.25rem',
        minWidth: '260px',
        maxWidth: '320px',
        width: '100%',
      }}
    >
      <div style={{ flexShrink: 0 }}>{getLogIcon(toast.event)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.02em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {toast.event}
        </div>
        <div className="text-xs text-secondary" style={{ marginTop: '2px' }}>
          Slot {toast.slotId} &bull; {toast.plateNumber || 'Unknown'}
        </div>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'none', border: 'none',
          color: 'var(--text-muted)', cursor: 'pointer',
          display: 'flex', padding: '3px', flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>

      {/* Countdown bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: TOAST_DURATION / 1000, ease: 'linear' }}
        style={{
          position: 'absolute', bottom: 0, left: 0,
          height: '3px', background: borderColor, width: '100%',
          transformOrigin: 'left', opacity: 0.6,
        }}
      />
    </motion.div>
  );
};

const Notifications = () => {
  const { logs } = useParking();
  const [toasts, setToasts] = useState([]);
  const [lastProcessedLogId, setLastProcessedLogId] = useState(null);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    if (logs.length > 0) {
      const latestLog = logs[0];
      if (latestLog.id !== lastProcessedLogId) {
        setLastProcessedLogId(latestLog.id);
        const logTime = new Date(latestLog.timestamp);
        const isRecent = (new Date() - logTime) < 5000;
        if (isRecent) {
          const id = `toast-${latestLog.id || Date.now()}`;
          setToasts(prev => [{ ...latestLog, id }, ...prev].slice(0, 3));
        }
      }
    }
  }, [logs, lastProcessedLogId]);

  return (
    <>
      <style>{`
        .toast-container {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          z-index: 1000;
          pointer-events: none;
          max-width: calc(100vw - 2rem);
        }
        @media (max-width: 480px) {
          .toast-container {
            left: 1rem;
            right: 1rem;
            bottom: 1rem;
          }
          .toast-card {
            min-width: unset !important;
            max-width: 100% !important;
          }
        }
      `}</style>
      <div className="toast-container">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Notifications;
