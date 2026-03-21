import React, { useMemo, useState } from 'react';
import { useParking } from '../context/ParkingProvider';
import { Car, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SlotGrid = () => {
   const { slots, activeFilter } = useParking();
   const [searchQuery, setSearchQuery] = React.useState('');

   const filteredSlots = useMemo(() => {
      let temp = slots;
      if (activeFilter !== 'all') {
         temp = temp.filter(s => s.status === activeFilter);
      }
      if (searchQuery.trim()) {
         const q = searchQuery.toLowerCase();
         temp = temp.filter(s => 
            (s.plateNumber || '').toLowerCase().includes(q) ||
            (s.slotId || '').toLowerCase().includes(q)
         );
      }
      return temp;
   }, [slots, activeFilter, searchQuery]);

   const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
   };

   const cardVariants = {
      hidden: { opacity: 0, scale: 0.9, y: 20 },
      visible: {
         opacity: 1, scale: 1, y: 0,
         transition: { type: 'spring', stiffness: 300, damping: 24 }
      },
      exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
   };

   const sortedSlots = useMemo(() => {
      return [...filteredSlots].sort((a, b) => {
         const aM = (a.slotId || '').match(/([A-Z]+)(\d+)/);
         const bM = (b.slotId || '').match(/([A-Z]+)(\d+)/);
         if (aM && bM) {
            if (aM[1] !== bM[1]) return aM[1].localeCompare(bM[1]);
            return parseInt(aM[2]) - parseInt(bM[2]);
         }
         return (a.slotId || '').localeCompare(b.slotId || '');
      });
   }, [filteredSlots]);

   const getStatusColor = (status) => {
      switch (status) {
         case 'available': return 'var(--status-available)';
         case 'occupied': return 'var(--status-occupied)';
         case 'booked': return 'var(--status-booked)';
         case 'fined': return 'var(--status-fined)';
         default: return 'var(--text-muted)';
      }
   };

   const ResidencyTimer = ({ startTime, status, duration }) => {
      const [elapsed, setElapsed] = React.useState('');

      React.useEffect(() => {
         if (!startTime) return;
         const update = () => {
            const start = new Date(startTime);
            const now = new Date();
            const diffMs = now - start;

            if (status === 'booked') {
               const totalMinutes = (duration || 1) * 60;
               const elapsedMinutes = Math.floor(diffMs / 60000);
               const remaining = Math.max(0, totalMinutes - elapsedMinutes);
               if (remaining <= 0) {
                  setElapsed('Expired');
                  return;
               }
               const h = Math.floor(remaining / 60);
               const m = remaining % 60;
               setElapsed(`${h}h ${m}m left`);
               return;
            }

            const diffMins = Math.floor(diffMs / 60000);
            const h = Math.floor(diffMins / 60);
            const m = diffMins % 60;
            setElapsed(h > 0 ? `${h}h ${m}m` : `${m}m`);
         };
         update();
         const interval = setInterval(update, 60000);
         return () => clearInterval(interval);
      }, [startTime, status, duration]);

      return (
         <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
               fontSize: '0.75rem',
               color: 'var(--text-muted)',
               marginTop: '4px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               gap: '4px',
               width: '100%',
               fontFamily: 'sans-serif'
            }}>
               <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: status === 'available' ? 'var(--status-available)' :
                     status === 'occupied' ? 'var(--status-occupied)' :
                        status === 'booked' ? 'var(--status-booked)' : 'var(--status-fined)',
                  opacity: 0.8
               }}></span>
               {status === 'booked' ? 'Reserved: ' : 'Parked: '} {elapsed}
            </div>
            {status !== 'available' && status !== 'booked' && (
               <div style={{
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  color: 'var(--accent-primary)',
                  marginTop: '0.35rem',
                  fontFamily: 'monospace',
                  padding: '2px 8px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: '4px',
                  border: '1px solid rgba(99, 102, 241, 0.2)'
               }}>
                  CURR. FEE: ₹{Math.max(1, Math.ceil((new Date() - new Date(startTime)) / (1000 * 60 * 60))) * 20}
               </div>
            )}
         </div>
      );
   };

   const SlotCard = React.memo(({ slot, index }) => {
      const isLeft = index % 2 === 0;
      return (
         <motion.div
            key={slot.slotId}
            layout
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ layout: { type: 'spring', stiffness: 200, damping: 22 } }}
            className="slot-card"
            style={{
               position: 'relative',
               height: '260px',
               background: slot.status !== 'available' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
               borderLeft: !isLeft ? '3px solid rgba(255,255,255,0.8)' : 'none',
               borderRight: isLeft ? '3px solid rgba(255,255,255,0.8)' : 'none',
               marginBottom: '0',
               display: 'flex',
               flexDirection: 'column',
               justifyContent: 'center',
               alignItems: 'center',
               borderRadius: '4px',
            }}
         >
            {/* Slot content */}
            <div style={{ textAlign: 'center' }}>
               {slot.status === 'available' ? (
                   <h2 style={{
                      fontSize: 'clamp(1rem, 3.5vw, 2.22rem)',
                      fontWeight: '900',
                      margin: 0,
                      color: 'rgba(255,255,255,0.12)',
                      letterSpacing: '0.2em',
                   }}>EMPTY</h2>
               ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                     <Car
                        size={48}
                        color={getStatusColor(slot.status)}
                        style={{ filter: `drop-shadow(0 0 12px ${getStatusColor(slot.status)}44)` }}
                     />
                      <div style={{
                         background: 'rgba(0,0,0,0.5)',
                         padding: '0.3rem 0.75rem',
                         borderRadius: '4px',
                         border: `1px solid ${getStatusColor(slot.status)}44`,
                         color: '#fff',
                         fontSize: 'clamp(0.65rem, 2.5vw, 0.9rem)',
                         fontWeight: '700',
                         fontFamily: 'monospace',
                      }}>
                         {slot.plateNumber}
                      </div>
                     {(slot.status === 'occupied' || slot.status === 'fined') && (
                        <ResidencyTimer startTime={slot.entryTime} status={slot.status} />
                     )}
                     {slot.status === 'booked' && (
                        <ResidencyTimer startTime={slot.bookingTime} status="booked" duration={slot.bookingDuration} />
                     )}
                  </div>
               )}
            </div>

            {/* Slot ID badge */}
            <div style={{
               position: 'absolute',
               top: '10px',
               [isLeft ? 'left' : 'right']: '10px',
               display: 'flex',
               alignItems: 'center',
               gap: '6px',
               opacity: 0.85,
            }}>
               <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#fff' }}>{slot.slotId}</span>
               <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: getStatusColor(slot.status),
                  boxShadow: `0 0 8px ${getStatusColor(slot.status)}`,
               }} />
            </div>
         </motion.div>
      );
   });

   return (
      <>
         {/* Responsive slot grid layout */}
         <style>{`
            .slot-parking-wrapper {
               background: #070b14;
               background-image: url("https://www.transparenttextures.com/patterns/pavement.png");
               border-radius: 1.5rem;
               padding: 3rem 1.5rem;
               border: 2px solid #1a202c;
               min-height: 600px;
               position: relative;
               display: flex;
               flex-direction: column;
            }
            .slot-two-col-grid {
               display: grid;
               grid-template-columns: 1fr 1fr;
               column-gap: clamp(40px, 8vw, 80px);
               row-gap: 2.5rem;
               max-width: 1100px;
               margin: 0 auto;
               width: 100%;
               position: relative;
               z-index: 1;
            }
            /* The Aisle Divider */
            .slot-two-col-grid::before {
               content: '';
               position: absolute;
               left: 50%;
               top: 0;
               bottom: 0;
               width: 2px;
               border-left: 2px dashed rgba(255,255,255,0.08);
               transform: translateX(-50%);
               z-index: -1;
            }
            @media (max-width: 850px) {
               .slot-parking-wrapper {
                  padding: 2rem 1rem;
                  min-height: 500px;
               }
            }
            @media (max-width: 768px) {
               .slot-two-col-grid {
                  grid-template-columns: 1fr;
                  column-gap: 0;
                  max-width: 100%;
               }
               .slot-two-col-grid::before { display: none; }
               .slot-parking-wrapper {
                  padding: 1.5rem 0.5rem;
                  min-height: 400px;
               }
            }
            @media (max-width: 480px) {
               .slot-parking-wrapper {
                  padding: 1.25rem 0.75rem;
                  border-radius: 1rem;
               }
            }
         `}</style>

         <div className="slot-parking-wrapper">
            {/* Search Bar [NEW] */}
            <div style={{
               maxWidth: '500px',
               width: '100%',
               margin: '0 auto 2.5rem auto',
               position: 'relative',
               zIndex: 10
            }}>
               <div style={{ position: 'relative' }}>
                  <Search size={18} style={{
                     position: 'absolute',
                     left: '16px',
                     top: '50%',
                     transform: 'translateY(-50%)',
                     color: 'rgba(99, 102, 241, 0.6)'
                  }} />
                  <input
                     type="text"
                     placeholder="Search plate or slot (e.g. MH 12... or A1)"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     style={{
                        width: '100%',
                        padding: '12px 45px 12px 45px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                     }}
                     onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                     onBlur={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.3)'}
                  />
                  {searchQuery && (
                     <button
                        onClick={() => setSearchQuery('')}
                        style={{
                           position: 'absolute',
                           right: '12px',
                           top: '50%',
                           transform: 'translateY(-50%)',
                           background: 'rgba(255,255,255,0.05)',
                           border: 'none',
                           borderRadius: '50%',
                           width: '24px',
                           height: '24px',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           cursor: 'pointer',
                           color: 'var(--text-secondary)'
                        }}
                     >
                        <X size={14} />
                     </button>
                  )}
               </div>
            </div>

            {sortedSlots.length === 0 ? (
               <div style={{
                  flex: 1,
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', alignItems: 'center',
                  gap: '1.25rem', opacity: 0.3,
               }}>
                  <Car size={64} strokeWidth={1} />
                  <h3 style={{
                     fontSize: 'clamp(1.2rem, 3vw, 2rem)',
                     fontWeight: '700',
                     letterSpacing: '0.1em',
                     margin: 0,
                     textTransform: 'uppercase',
                  }}>No Slots Found</h3>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>Try adjusting your filter</p>
               </div>
            ) : (
               <motion.div
                  className="slot-two-col-grid"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
               >
                  <AnimatePresence mode="popLayout">
                     {sortedSlots.map((slot, index) => (
                        <SlotCard key={slot.slotId} slot={slot} index={index} />
                     ))}
                  </AnimatePresence>
               </motion.div>
            )}
         </div>
      </>
   );
};

export default SlotGrid;
