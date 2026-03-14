import React, { useMemo } from 'react';
import { useParking } from '../context/ParkingProvider';
import { Car } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SlotGrid = () => {
   const { slots, activeFilter } = useParking();

   const filteredSlots = useMemo(() => {
      if (activeFilter === 'all') return slots;
      return slots.filter(s => s.status === activeFilter);
   }, [slots, activeFilter]);

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
            marginBottom: '0', // Margin handled by grid gap now
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '4px',
            boxShadow: slot.status !== 'available'
               ? `inset 0 0 20px ${getStatusColor(slot.status)}11`
               : 'none',
         }}
      >
         {/* Slot content */}
         <div style={{ textAlign: 'center' }}>
            {slot.status === 'available' ? (
               <h2 style={{
                  fontSize: 'clamp(1.5rem, 4vw, 3rem)',
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
                     fontSize: 'clamp(0.7rem, 2vw, 1rem)',
                     fontWeight: '700',
                     fontFamily: 'monospace',
                  }}>
                     {slot.plateNumber}
                  </div>
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
               row-gap: 1rem;
               max-width: 960px;
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
                  max-width: 420px;
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
