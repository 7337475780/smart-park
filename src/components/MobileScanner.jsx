import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { analyzeParkingImageReq } from '../services/gemini';

const MobileScanner = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [status, setStatus] = useState('OFFLINE'); // OFFLINE, READY, ANALYZING, ERROR
    const [lastResult, setLastResult] = useState(null);
    const [autoScan, setAutoScan] = useState(false);
    const [error, setError] = useState('');

    const startCamera = async () => {
        try {
            const constraints = {
                video: { facingMode: 'environment' }
            };
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            if (videoRef.current) videoRef.current.srcObject = newStream;
            setStatus('READY');
        } catch (err) {
            setError('Camera access denied or unavailable.');
            setStatus('ERROR');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setStatus('OFFLINE');
        }
    };

    const captureAndAnalyze = async () => {
        if (!videoRef.current || status === 'ANALYZING') return;

        setStatus('ANALYZING');
        try {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert canvas to blob
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
            const result = await analyzeParkingImageReq(blob);
            setLastResult(result);
            setStatus('READY');
        } catch (err) {
            console.error(err);
            setError('Analysis failed. Retrying...');
            setStatus('READY');
        }
    };

    useEffect(() => {
        let interval;
        if (autoScan && status === 'READY') {
            interval = setInterval(() => {
                captureAndAnalyze();
            }, 5000); // Scan every 5 seconds
        }
        return () => clearInterval(interval);
    }, [autoScan, status]);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    return (
        <div style={{ 
            position: 'fixed', inset: 0, background: '#000', color: '#fff', 
            display: 'flex', flexDirection: 'column', fontFamily: 'system-ui' 
        }}>
            {/* Header */}
            <div style={{ padding: '1rem', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #222' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status === 'READY' ? '#10b981' : '#f59e0b', boxShadow: '0 0 10px currentColor' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>MOBILE_SCAN_NODE</span>
                </div>
                <button onClick={() => window.location.href = '/'} style={{ background: 'none', border: 'none', color: '#666' }}>
                    <ArrowLeft size={20} />
                </button>
            </div>

            {/* Viewport */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                {/* HUD Overlay */}
                <div style={{ position: 'absolute', inset: 0, padding: '1rem', pointerEvents: 'none' }}>
                    <div style={{ border: '1px solid rgba(255,255,255,0.2)', height: '100%', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '20px', height: '20px', borderTop: '2px solid #fff', borderLeft: '2px solid #fff' }} />
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '20px', height: '20px', borderTop: '2px solid #fff', borderRight: '2px solid #fff' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '20px', height: '20px', borderBottom: '2px solid #fff', borderLeft: '2px solid #fff' }} />
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px', borderBottom: '2px solid #fff', borderRight: '2px solid #fff' }} />
                    </div>
                </div>

                {status === 'ANALYZING' && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RefreshCw className="animate-spin" size={32} color="#10b981" />
                    </div>
                )}
            </div>

            {/* Results & Controls */}
            <div style={{ padding: '1.5rem', background: '#111', borderTop: '1px solid #222' }}>
                {error && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</div>}
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button 
                        onClick={() => setAutoScan(!autoScan)}
                        style={{ 
                            flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none',
                            background: autoScan ? '#ef4444' : '#10b981', color: '#fff', fontWeight: 'bold'
                        }}
                    >
                        {autoScan ? 'STOP AUTO-SCAN' : 'START AUTO-SCAN'}
                    </button>
                    <button 
                        onClick={captureAndAnalyze}
                        disabled={status === 'ANALYZING'}
                        style={{ 
                            flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid #333',
                            background: '#222', color: '#fff', fontWeight: 'bold'
                        }}
                    >
                        SINGLE CAPTURE
                    </button>
                </div>

                {lastResult && (
                    <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', border: '1px solid #222' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#666', fontSize: '0.7rem' }}>DETECTION_RESULTS</span>
                            <CheckCircle size={14} color="#10b981" />
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>
                            <p>Slot: <strong style={{ color: '#10b981' }}>{lastResult.suggestedSlotId || 'CALIBRATING...'}</strong></p>
                            <p>Plate: <strong>{lastResult.licensePlate || 'NONE'}</strong></p>
                            <p>State: <strong style={{ color: lastResult.parkingStatus === 'good' ? '#10b981' : '#f59e0b' }}>{lastResult.parkingStatus?.toUpperCase() || 'UNKNOWN'}</strong></p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileScanner;
