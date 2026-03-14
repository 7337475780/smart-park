import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingProvider';
import { Camera, AlertCircle, LogOut, Image as ImageIcon, Cpu } from 'lucide-react';
import { analyzeParkingImageReq } from '../services/gemini';

const SimulationPanel = () => {
  const { slots, simulateArrival, simulateDeparture, simulateBadParking, fetchNow } = useParking();
  
  // -- Gemini Integration State --
  const [geminiFile, setGeminiFile] = useState(null);
  const [geminiSlot, setGeminiSlot] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [geminiResult, setGeminiResult] = useState(null);

  const handleGeminiAnalysis = async (e) => {
    e.preventDefault();
    if (!geminiFile) return alert("Please select an image.");
    if (!geminiSlot) return alert("Please select a slot.");

    try {
      setIsAnalyzing(true);
      setGeminiResult(null);
      
      const result = await analyzeParkingImageReq(geminiFile);
      
      setGeminiResult(result);

      // Trigger respective actions based on AI findings
      if (result.carDetected) {
        if (result.parkingStatus === 'bad') {
          simulateBadParking(geminiSlot, result.licensePlate || 'UNKNOWN');
        } else {
          simulateArrival(geminiSlot, result.licensePlate || 'UNKNOWN');
        }
      } else {
          // If no car is detected, simulate departure (if it was occupied)
          simulateDeparture(geminiSlot);
      }
    } catch (err) {
      alert("Error analyzing image: " + err.message);
    } finally {
      setIsAnalyzing(false);
      fetchNow();
    }
  };

  // -- Manual Simulation State --
  const [arrivalPlate, setArrivalPlate] = useState('');
  const [arrivalSlot, setArrivalSlot] = useState('');
  
  const [badPlate, setBadPlate] = useState('');
  const [badSlot, setBadSlot] = useState('');
  
  const [departureSlot, setDepartureSlot] = useState('');

  // Once slots load from the API, default-select the first slot
  useEffect(() => {
    if (slots.length > 0) {
      const firstId = slots[0].slotId;
      setGeminiSlot(prev => prev || firstId);
      setArrivalSlot(prev => prev || firstId);
      setBadSlot(prev => prev || firstId);
    }
  }, [slots]);

  const handleArrival = (e) => {
      e.preventDefault();
      if(arrivalPlate && arrivalSlot) {
          simulateArrival(arrivalSlot, arrivalPlate);
          setArrivalPlate('');
      }
  };

  const handleBadParking = (e) => {
      e.preventDefault();
      if(badPlate && badSlot) {
          simulateBadParking(badSlot, badPlate);
          setBadPlate('');
      }
  }

  const handleDeparture = (e) => {
      e.preventDefault();
      if(departureSlot) simulateDeparture(departureSlot);
  }

  return (
    <>
      <style>{`
        .sim-slot-picker {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
          gap: 0.5rem;
          max-height: 180px;
          overflow-y: auto;
          padding: 0.5rem;
          background: rgba(0,0,0,0.3);
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        .sim-slot-picker::-webkit-scrollbar { width: 6px; }
        .sim-slot-picker::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

        .sim-card {
          padding: 2rem;
          border-radius: 1.25rem;
          background: linear-gradient(160deg, rgba(15,23,42,0.8), rgba(0,0,0,0.6));
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
        }
        
        @media (max-width: 480px) {
          .sim-card { padding: 1.25rem; }
        }
      `}</style>
      
      <div className="sim-card" style={{ marginBottom: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.4)', background: 'linear-gradient(160deg, rgba(30,27,75,0.6), rgba(15,23,42,0.9))', boxShadow: 'inset 0 0 30px rgba(99, 102, 241, 0.05)' }}>
        <h3 className="flex items-center gap-2" style={{ marginBottom: '1rem', color: 'var(--accent-primary)', fontSize: '1.25rem' }}>
            <Cpu size={24} /> Smart Parking AI Camera Simulation
        </h3>
        <p className="text-sm text-secondary" style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
          Upload a photo of a parking spot. The AI will analyze whether a car is present, read its license plate, and detect if it is parked badly.
        </p>

        <form onSubmit={handleGeminiAnalysis} className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
             <label className="form-label" style={{ color: 'var(--accent-primary)' }}>Camera Target Sector</label>
             <div className="sim-slot-picker">
                {slots.map(s => (
                  <div 
                    key={s.slotId}
                    onClick={() => setGeminiSlot(s.slotId)}
                    style={{
                      padding: '0.65rem 0.5rem', textAlign: 'center', borderRadius: '0.5rem',
                      border: `1px solid ${geminiSlot === s.slotId ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)'}`,
                      backgroundColor: geminiSlot === s.slotId ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
                      color: geminiSlot === s.slotId ? '#fff' : 'var(--text-secondary)',
                      boxShadow: geminiSlot === s.slotId ? '0 0 15px rgba(99, 102, 241, 0.3)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {s.slotId}
                  </div>
                ))}
             </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
             <label className="form-label">Surveillance Image</label>
             <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '0.75rem', border: '1px dashed var(--accent-primary)', padding: '0.5rem' }}>
               <input type="file" accept="image/*" className="form-input" style={{ border: 'none', background: 'transparent', padding: '0.5rem' }} onChange={e => setGeminiFile(e.target.files[0])} required />
             </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={isAnalyzing} style={{ height: '100%', minHeight: '52px' }}>
            {isAnalyzing ? 'Scanning Sector...' : <><ImageIcon size={18} style={{ marginRight: '8px' }} /> Initiate Scan</>}
          </button>
        </form>

        {geminiResult && (
          <div style={{ marginTop: '2rem', padding: '1.25rem', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: 'var(--status-available)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{width: 8, height: 8, background: 'var(--status-available)', borderRadius: '50%', boxShadow: '0 0 10px var(--status-available)'}}></div>
              Analysis Data Stream Complete
            </h4>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <div className="text-xs text-muted uppercase tracking-wider mb-1">Target Found</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: geminiResult.carDetected ? 'var(--status-occupied)' : 'var(--text-secondary)' }}>
                 {geminiResult.carDetected ? 'POSITIVE' : 'NEGATIVE'}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <div className="text-xs text-muted uppercase tracking-wider mb-1">Plate Intel</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                 {geminiResult.licensePlate || 'NO READ'}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <div className="text-xs text-muted uppercase tracking-wider mb-1">Alignment</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: geminiResult.parkingStatus === 'bad' ? 'var(--status-fined)' : 'var(--status-available)' }}>
                 {geminiResult.parkingStatus === 'bad' ? 'VIOLATION' : 'SECURED'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4" style={{ margin: '2.5rem 0' }}>
         <div style={{ height: '1px', background: 'radial-gradient(circle, var(--text-muted) 0%, transparent 100%)', flex: 1 }}></div>
         <span className="text-muted text-xs uppercase" style={{ letterSpacing: '0.2em' }}>Developer Override Tools</span>
         <div style={{ height: '1px', background: 'radial-gradient(circle, var(--text-muted) 0%, transparent 100%)', flex: 1 }}></div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        
        {/* Simulate Arrival */}
        <div className="sim-card" style={{ borderTop: '4px solid var(--status-available)' }}>
          <h3 className="flex items-center gap-2" style={{ marginBottom: '1.5rem', color: 'var(--status-available)' }}>
              <Camera size={20} /> Inject: Vehicle Entry
          </h3>
          <form onSubmit={handleArrival}>
              <div className="form-group">
                  <label className="form-label">License Plate Identifier</label>
                  <input type="text" className="form-input" value={arrivalPlate} onChange={e => setArrivalPlate(e.target.value)} placeholder="e.g. ABC 1234" required />
              </div>
              <div className="form-group">
                  <label className="form-label">Target Sector</label>
                  <div className="sim-slot-picker">
                      {slots.filter(s => s.status === 'available' || s.status === 'booked').map(s => (
                          <div 
                             key={s.slotId}
                             onClick={() => setArrivalSlot(s.slotId)}
                             style={{
                                padding: '0.65rem 0.5rem', textAlign: 'center', borderRadius: '0.5rem',
                                border: `1px solid ${arrivalSlot === s.slotId ? 'var(--status-available)' : 'rgba(255,255,255,0.05)'}`,
                                backgroundColor: arrivalSlot === s.slotId ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
                                color: arrivalSlot === s.slotId ? '#fff' : 'var(--text-secondary)'
                             }}
                          >
                             {s.slotId}
                          </div>
                      ))}
                  </div>
              </div>
              <button type="submit" className="btn" style={{ width: '100%', borderColor: 'var(--status-available)', color: 'var(--status-available)' }}>Trigger Entry Sequence</button>
          </form>
        </div>

        {/* Simulate Bad Parking */}
        <div className="sim-card" style={{ borderTop: '4px solid var(--status-fined)' }}>
          <h3 className="flex items-center gap-2" style={{ marginBottom: '0.5rem', color: 'var(--status-fined)' }}>
              <AlertCircle size={20} /> Inject: Violation
          </h3>
          <p className="text-xs" style={{ marginBottom: '1.5rem', color: 'rgba(249,115,22,0.6)' }}>Force a mis-alignment fine event.</p>
          <form onSubmit={handleBadParking}>
              <div className="form-group">
                  <label className="form-label">License Plate Identifier</label>
                  <input type="text" className="form-input" value={badPlate} onChange={e => setBadPlate(e.target.value)} placeholder="e.g. XYZ 9876" required />
              </div>
              <div className="form-group">
                  <label className="form-label">Target Sector</label>
                  <div className="sim-slot-picker">
                      {slots.map(s => (
                          <div 
                             key={s.slotId}
                             onClick={() => setBadSlot(s.slotId)}
                             style={{
                                padding: '0.65rem 0.5rem', textAlign: 'center', borderRadius: '0.5rem',
                                border: `1px solid ${badSlot === s.slotId ? 'var(--status-fined)' : 'rgba(255,255,255,0.05)'}`,
                                backgroundColor: badSlot === s.slotId ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255,255,255,0.02)',
                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
                                color: badSlot === s.slotId ? '#fff' : 'var(--text-secondary)'
                             }}
                          >
                             {s.slotId}
                          </div>
                      ))}
                  </div>
              </div>
              <button type="submit" className="btn" style={{ width: '100%', backgroundColor: 'rgba(249, 115, 22, 0.1)', color: 'var(--status-fined)', borderColor: 'var(--status-fined)' }}>Issue Fine Event</button>
          </form>
        </div>

        {/* Simulate Departure */}
        <div className="sim-card" style={{ borderTop: '4px solid var(--text-secondary)' }}>
          <h3 className="flex items-center gap-2" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              <LogOut size={20} /> Inject: Vehicle Exit
          </h3>
          
          <form onSubmit={handleDeparture}>
              <div className="form-group">
                  <label className="form-label">Target Occupied Sector</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {slots.filter(s => s.status === 'occupied' || s.status === 'fined').length === 0 ? (
                          <div className="text-xs text-muted italic p-4 text-center border dashed border-gray-700 rounded-lg">No occupied sectors detected in grid</div>
                      ) : (
                        slots.filter(s => s.status === 'occupied' || s.status === 'fined').map(s => (
                            <div 
                               key={s.slotId}
                               onClick={() => setDepartureSlot(s.slotId)}
                               style={{
                                  padding: '0.85rem 1rem', borderRadius: '0.5rem',
                                  border: `1px solid ${departureSlot === s.slotId ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)'}`,
                                  backgroundColor: departureSlot === s.slotId ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.3)',
                                  cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                  transition: 'background 0.2s'
                               }}
                            >
                               <span style={{ fontWeight: '800', color: departureSlot === s.slotId ? '#fff' : 'var(--text-secondary)' }}>Sector {s.slotId}</span>
                               <span className={`text-xs badge ${s.status === 'fined' ? 'badge-fined' : 'badge-occupied'}`} style={{ fontSize: '0.65rem' }}>{s.plateNumber}</span>
                            </div>
                        ))
                      )}
                  </div>
              </div>
              <button type="submit" className="btn" style={{ width: '100%', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Trigger Exit Sequence</button>
          </form>
        </div>

      </div>
    </>
  );
};

export default SimulationPanel;
