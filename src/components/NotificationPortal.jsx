import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X, HelpCircle } from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [dialog, setDialog] = useState(null);

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, duration);
    }, []);

    const showConfirm = useCallback((title, message) => {
        return new Promise((resolve) => {
            setDialog({ title, message, type: 'confirm', resolve });
        });
    }, []);

    const showAlert = useCallback((title, message) => {
        return new Promise((resolve) => {
            setDialog({ title, message, type: 'alert', resolve });
        });
    }, []);

    const closeDialog = (value) => {
        if (dialog?.resolve) dialog.resolve(value);
        setDialog(null);
    };

    return (
        <NotificationContext.Provider value={{ showToast, showConfirm, showAlert }}>
            {children}
            
            {/* Toasts */}
            <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <AnimatePresence>
                    {notifications.map(n => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="glass-panel"
                            style={{ 
                                padding: '1rem 1.25rem', minWidth: '280px', 
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                borderLeft: `4px solid ${n.type === 'success' ? 'var(--status-available)' : n.type === 'error' ? 'var(--status-occupied)' : 'var(--accent-primary)'}`
                            }}
                        >
                            {n.type === 'success' ? <CheckCircle2 className="text-available" size={20} /> :
                             n.type === 'error' ? <AlertCircle className="text-occupied" size={20} /> :
                             <Info className="text-accent" size={20} />}
                            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{n.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Dialog Modal */}
            <AnimatePresence>
                {dialog && (
                    <div style={{ 
                        position: 'fixed', inset: 0, zIndex: 10000, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-panel"
                            style={{ width: '400px', maxWidth: 'calc(100% - 2rem)', padding: '2rem' }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                {dialog.type === 'confirm' ? <HelpCircle className="text-accent" size={28} /> : <AlertCircle className="text-accent" size={28} />}
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{dialog.title}</h3>
                            </div>
                            <p className="text-secondary" style={{ marginBottom: '2rem' }}>{dialog.message}</p>
                            <div className="flex gap-3 justify-end">
                                {dialog.type === 'confirm' && (
                                    <button className="btn" style={{ minWidth: '100px' }} onClick={() => closeDialog(false)}>Cancel</button>
                                )}
                                <button className="btn btn-primary" style={{ minWidth: '100px' }} onClick={() => closeDialog(true)}>
                                    {dialog.type === 'confirm' ? 'Confirm' : 'OK'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </NotificationContext.Provider>
    );
};
