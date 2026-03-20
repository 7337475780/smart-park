import React, { useState, useEffect } from 'react';
import { useParking } from '../context/ParkingProvider';
import { Camera, AlertCircle, LogOut, Image as ImageIcon, Cpu, X, Play, Zap } from 'lucide-react';
import { analyzeParkingImageReq } from '../services/gemini';

const SimulationPanel = ({ onClose }) => {
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

      if (result.carDetected) {
        if (result.parkingStatus === 'bad') {
          simulateBadParking(geminiSlot, result.licensePlate || 'UNKNOWN');
        } else {
          simulateArrival(geminiSlot, result.licensePlate || 'UNKNOWN');
        }
      } else {
          simulateDeparture(geminiSlot);
      }
    } catch (err) {
      alert("Error analyzing image: " + err.message);
    } finally {
      setIsAnalyzing(false);
      fetchNow();
    }
  };

  const [arrivalPlate, setArrivalPlate] = useState('');
  const [arrivalSlot, setArrivalSlot] = useState('');
  const [badPlate, setBadPlate] = useState('');
  const [badSlot, setBadSlot] = useState('');
  const [departureSlot, setDepartureSlot] = useState('');

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

  // Quick Demo Scenarios
  const runQuickDemo = (type) => {
    const randomSlot = slots[Math.floor(Math.random() * slots.length)]?.slotId || 'A1';
    const randomPlate = `MH ${Math.floor(10 + Math.random() * 89)} AB ${Math.floor(1000 + Math.random() * 8999)}`;
    
    if (type === 'entry') simulateArrival(randomSlot, randomPlate);
    if (type === 'violation') simulateBadParking(randomSlot, randomPlate);
    if (type === 'exit') {
        const occupied = slots.filter(s => s.status !== 'available');
        if (occupied.length > 0) simulateDeparture(occupied[0].slotId);
    }
    fetchNow();
  };

  return (
    <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110,
        padding: '2rem'
    }}>
      <style>{`
        .sim-slot-picker {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
          gap: 0.5rem; max-height: 120px; overflow-y: auto; padding: 0.5rem;
          background: rgba(0,0,0,0.3); border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.05);
        }
        .sim-card {
          padding: 1.5rem; border-radius: 1rem;
          background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border);
        }
        .demo-btn {
            background: rgba(99, 102, 241, 0.1); border: 1px solid var(--accent-primary);
            color: var(--accent-primary); padding: 0.5rem 1rem; border-radius: 8px;
            font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: all 0.2s;
            display: flex; alignItems: center; gap: 6px;
        }
        .demo-btn:hover { background: var(--accent-primary); color: white; transform: translateY(-2px); }
      `}</style>
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem' }}>
        
        {/* Header */}
        <div className="flex justify-between items-start" style={{ marginBottom: '2rem' }}>
            <div>
                <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                    <Cpu className="text-accent" size={28} /> Virtual AI Simulator
                </h2>
                <p className="text-secondary text-sm">Test the AI logic and dashboard updates manually.</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={28} />
            </button>
        </div>

        {/* Quick Simulation Presets */}
        <div style={{ marginBottom: '2.5rem' }}>
            <h4 className="text-xs uppercase text-muted font-bold tracking-widest mb-3">One-Click Demo Scenarios</h4>
            <div className="flex gap-3 flex-wrap">
                <button className="demo-btn" onClick={() => runQuickDemo('entry')}><Play size={14}/> Simulate Vehicle Entry</button>
                <button className="demo-btn" onClick={() => runQuickDemo('violation')} style={{ borderColor: 'var(--status-fined)', color: 'var(--status-fined)' }}><Zap size={14}/> Simulate Parking Violation</button>
                <button className="demo-btn" onClick={() => runQuickDemo('exit')} style={{ borderColor: 'var(--text-secondary)', color: 'var(--text-secondary)' }}><LogOut size={14}/> Simulate Vehicle Exit</button>
            </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            
            {/* AI SCANNER SECTION */}
            <div className="sim-card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(145deg, rgba(30,27,75,0.4), rgba(15,23,42,0.8))', border: '1px solid rgba(99,102,241,0.3)' }}>
                <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ImageIcon size={18} /> AI Vision Analysis Scan
                </h4>
                <form onSubmit={handleGeminiAnalysis} className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Target Parking Sector</label>
                        <div className="sim-slot-picker">
                            {slots.map(s => (
                                <div key={s.slotId} onClick={() => setGeminiSlot(s.slotId)}
                                    style={{
                                        padding: '0.5rem', textAlign: 'center', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem',
                                        border: `1px solid ${geminiSlot === s.slotId ? 'var(--accent-primary)' : 'transparent'}`,
                                        background: geminiSlot === s.slotId ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)'
                                    }}>
                                    {s.slotId}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Upload Surveillance Capture</label>
                            <input type="file" onChange={e => setGeminiFile(e.target.files[0])} className="form-input" style={{ fontSize: '0.8rem' }} />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={isAnalyzing} style={{ width: '100%', height: '48px' }}>
                            {isAnalyzing ? 'Analyzing Proximity...' : 'Execute Vision Scan'}
                        </button>
                    </div>
                </form>
            </div>

            {/* MANUAL OVERRIDE SECTION */}
            <div className="sim-card">
                <h4 style={{ color: 'var(--status-available)', marginBottom: '1.25rem' }}>Manual Entry Injection</h4>
                <form onSubmit={handleArrival}>
                    <div className="form-group">
                        <label className="form-label text-xs">Plate Number</label>
                        <input type="text" className="form-input" value={arrivalPlate} onChange={e => setArrivalPlate(e.target.value)} placeholder="MH 12 AB 1234" />
                    </div>
                    <div className="form-group">
                        <label className="form-label text-xs">Sector</label>
                        <select className="form-input" value={arrivalSlot} onChange={e => setArrivalSlot(e.target.value)}>
                            {slots.map(s => <option key={s.slotId} value={s.slotId}>{s.slotId} ({s.status})</option>)}
                        </select>
                    </div>
                    <button type="submit" className="btn" style={{ width: '100%', color: 'var(--status-available)', borderColor: 'var(--status-available)' }}>Trigger Entry</button>
                </form>
            </div>

            <div className="sim-card">
                <h4 style={{ color: 'var(--status-fined)', marginBottom: '1.25rem' }}>Violation Injection</h4>
                <form onSubmit={handleBadParking}>
                    <div className="form-group">
                        <label className="form-label text-xs">Plate Number</label>
                        <input type="text" className="form-input" value={badPlate} onChange={e => setBadPlate(e.target.value)} placeholder="Violation Plate" />
                    </div>
                    <div className="form-group">
                        <label className="form-label text-xs">Sector</label>
                        <select className="form-input" value={badSlot} onChange={e => setBadSlot(e.target.value)}>
                            {slots.map(s => <option key={s.slotId} value={s.slotId}>{s.slotId}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="btn" style={{ width: '100%', color: 'var(--status-fined)', borderColor: 'var(--status-fined)' }}>Trigger Fine</button>
                </form>
            </div>

        </div>
      </div>
    </div>
  );
};

export default SimulationPanel;
