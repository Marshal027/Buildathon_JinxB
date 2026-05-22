import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  CheckCircle, 
  AlertOctagon, 
  Compass, 
  ArrowRight,
  Wifi,
  WifiOff,
  Settings
} from 'lucide-react';

// Use environment variable or default to current host's IP if possible
// For mobile, you'll likely need to replace this with your PC's IP address
const DEFAULT_API_BASE = `http://${window.location.hostname}:3000`;

export default function App() {
  const [apiBase, setApiBase] = useState(localStorage.getItem('sf_api_base') || DEFAULT_API_BASE);
  const [showSettings, setShowSettings] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [currentUser] = useState({ id: 'T-492', name: 'J. Kowalski', role: 'worker' });
  const [activeRecord, setActiveRecord] = useState(null);
  const wsRef = useRef(null);

  // Simulation states
  const [isInFactory, setIsInFactory] = useState(true);
  const [simLat, setSimLat] = useState(37.7750);
  const [simLng, setSimLng] = useState(-122.4195);
  const [sosStatus, setSosStatus] = useState(null);

  useEffect(() => {
    localStorage.setItem('sf_api_base', apiBase);
  }, [apiBase]);

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`${apiBase}/api/attendance`);
      const data = await res.json();
      const active = data.find(a => a.workerId === currentUser.id && !a.clockOut);
      setActiveRecord(active || null);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [apiBase]);

  useEffect(() => {
    let recTimeout;
    const connectWS = () => {
      const wsUrl = apiBase.replace('http', 'ws') + '/ws/factory/';
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => {
        setWsConnected(false);
        recTimeout = setTimeout(connectWS, 4000);
      };
      ws.onmessage = (event) => {
        const signal = JSON.parse(event.data);
        if (signal.type === 'attendance.update' && signal.payload.workerId === currentUser.id) {
          fetchAttendance();
        }
      };
    };

    connectWS();
    return () => {
      clearTimeout(recTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, [apiBase]);

  useEffect(() => {
    if (isInFactory) {
      setSimLat(37.7750 + (Math.random() - 0.5) * 0.0005);
      setSimLng(-122.4195 + (Math.random() - 0.5) * 0.0005);
    } else {
      setSimLat(37.8120 + (Math.random() - 0.5) * 0.001);
      setSimLng(-122.5620 + (Math.random() - 0.5) * 0.001);
    }
  }, [isInFactory]);

  const handleClockIn = async () => {
    try {
      const res = await fetch(`${apiBase}/api/attendance/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: simLat, lng: simLng, workerId: currentUser.id, workerName: currentUser.name })
      });
      const data = await res.json();
      if (data.isValid) {
        setActiveRecord(data);
      }
      fetchAttendance();
    } catch (err) {
      alert('Connection failed. Check API URL in settings.');
    }
  };

  const handleClockOut = async () => {
    try {
      await fetch(`${apiBase}/api/attendance/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: currentUser.id })
      });
      setActiveRecord(null);
      fetchAttendance();
    } catch (err) {
      alert('Connection failed.');
    }
  };

  const handleSOS = async () => {
    try {
      await fetch(`${apiBase}/api/alerts/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: currentUser.id, name: currentUser.name, lat: simLat, lng: simLng })
      });
      setSosStatus('SOS distress signal dispatched!');
      setTimeout(() => setSosStatus(null), 5000);
    } catch (err) {
      alert('SOS failed to send.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#cac5cc] font-sans flex flex-col p-4 gap-6 select-none max-w-md mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-[#9cd2b8]" />
          <h1 className="text-lg font-bold text-[#9cd2b8]">SmartWorker</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px]">
            {wsConnected ? <Wifi className="w-3 h-3 text-[#9cd2b8]" /> : <WifiOff className="w-3 h-3 text-[#ffb4ab]" />}
            <span className={wsConnected ? 'text-[#9cd2b8]' : 'text-[#ffb4ab]'}>
              {wsConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="p-1 hover:bg-white/5 rounded">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="p-4 bg-[#1c1b1d] border border-white/10 rounded-xl flex flex-col gap-3">
          <label className="text-xs font-bold uppercase text-[#cac5cc]/60">Backend API URL</label>
          <input 
            type="text" 
            value={apiBase} 
            onChange={(e) => setApiBase(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white font-mono"
            placeholder="http://192.168.1.XX:3000"
          />
          <p className="text-[10px] text-[#cac5cc]/40 italic">Restart app after changing URL for WebSocket to update.</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col gap-6 flex-1">
        
        {/* User Card */}
        <div className="flex items-center gap-4 p-4 bg-[#141314] rounded-2xl border border-white/5 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-[#cbc3d9] flex items-center justify-center text-slate-900 font-bold text-lg">
            JK
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white uppercase tracking-tight">J. Kowalski</span>
            <span className="text-xs text-[#cac5cc]/60">Assembly Section A Operator</span>
          </div>
        </div>

        {/* GPS Simulation */}
        <div className="p-5 bg-[#141314]/50 border border-[#cac5cc]/10 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#cbc3d9]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Simulated GPS</h3>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setIsInFactory(true)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                isInFactory ? 'bg-[#9cd2b8] text-black' : 'bg-white/5 text-[#cac5cc]/60'
              }`}
            >
              In Factory
            </button>
            <button
              onClick={() => setIsInFactory(false)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                !isInFactory ? 'bg-[#93000a] text-[#ffb4ab]' : 'bg-white/5 text-[#cac5cc]/60'
              }`}
            >
              Outside
            </button>
          </div>

          <div className="font-mono text-[10px] flex justify-between text-[#cac5cc]/60 bg-black/40 p-2 rounded-lg">
            <span>{simLat.toFixed(6)}, {simLng.toFixed(6)}</span>
            <span className={isInFactory ? 'text-[#9cd2b8]' : 'text-[#ffb4ab]'}>
              {isInFactory ? 'AUTHORIZED' : 'OUT_OF_BOUNDS'}
            </span>
          </div>
        </div>

        {/* Clock In/Out */}
        <div className="flex-1 flex flex-col justify-center items-center gap-8">
          {activeRecord ? (
            <div className="flex flex-col items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-[#9cd2b8]/10 border-2 border-[#9cd2b8] flex items-center justify-center animate-pulse">
                <Clock className="w-16 h-16 text-[#9cd2b8]" />
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-[#9cd2b8] uppercase tracking-widest">Active Shift</span>
                <p className="text-xs text-[#cac5cc]/60 mt-1">Started: {new Date(activeRecord.clockIn).toLocaleTimeString()}</p>
              </div>
              <button
                onClick={handleClockOut}
                className="py-3 px-10 rounded-2xl bg-[#93000a] text-[#ffb4ab] font-bold text-sm shadow-xl active:scale-95 transition-all"
              >
                CLOCK OUT
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Clock className="w-12 h-12 text-[#cac5cc]/20" />
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-white uppercase tracking-widest">Off Duty</span>
                <p className="text-xs text-[#cac5cc]/40 mt-1">Please clock in to begin logging</p>
              </div>
              <button
                onClick={handleClockIn}
                className="py-3 px-10 rounded-2xl bg-[#9cd2b8] text-black font-black text-sm shadow-xl active:scale-95 transition-all flex items-center gap-2"
              >
                CLOCK IN WORKER
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* SOS Button */}
        <div className="mt-auto pb-4">
          <button
            onClick={handleSOS}
            className="w-full py-4 bg-[#93000a] text-[#ffb4ab] rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-[#ffb4ab]/30 shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            Trigger Emergency SOS
          </button>
          {sosStatus && (
            <p className="text-center text-[10px] text-[#ffb4ab] mt-2 font-bold animate-pulse uppercase tracking-wider">
              {sosStatus}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
