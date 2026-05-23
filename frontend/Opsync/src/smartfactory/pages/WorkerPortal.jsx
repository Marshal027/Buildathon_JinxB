import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  CheckCircle, 
  AlertOctagon, 
  Compass, 
  ArrowRight
} from 'lucide-react';

export default function WorkerPortal({ 
  onClockIn, 
  onClockOut, 
  onTriggerSOS,
  activeRecord,
  wsConnected
}) {
  // Mobile UI spatial coordinates simulator choices
  const [isInFactory, setIsInFactory] = useState(true);
  const [simLat, setSimLat] = useState(37.7750);
  const [simLng, setSimLng] = useState(-122.4195);
  const [sosStatus, setSosStatus] = useState(null);

  // Auto adjustment coordinates based on toggled toggle
  useEffect(() => {
    if (isInFactory) {
      setSimLat(37.7750 + (Math.random() - 0.5) * 0.0005);
      setSimLng(-122.4195 + (Math.random() - 0.5) * 0.0005);
    } else {
      setSimLat(37.8120 + (Math.random() - 0.5) * 0.001);
      setSimLng(-122.5620 + (Math.random() - 0.5) * 0.001);
    }
  }, [isInFactory]);

  const handleSimClockIn = async () => {
    await onClockIn(simLat, simLng);
  };

  const handleSimSOS = () => {
    onTriggerSOS(simLat, simLng);
    setSosStatus('SOS distress signal dispatched. Dispatch security team alert on operational desks.');
    setTimeout(() => setSosStatus(null), 5000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full p-4 lg:p-6 overflow-y-auto max-w-[1200px] mx-auto w-full select-none">
      
      {/* Simulation GPS config panel */}
      <div className="w-full lg:w-96 flex flex-col gap-5 pr-1 font-sans shrink-0">
        
        {/* GPS Control Panel */}
        <div className="p-5 bg-[#141314]/50 border border-[#ffffff]/10 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#cbc3d9]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Simulated GPS Coordinates</h3>
          </div>
          <p className="text-[11px] text-[#ffffff]/60 leading-relaxed">
            Configure the simulated operator phone GPS coordinates to test the geofence authorization rules constraints.
          </p>

          <div className="flex flex-col gap-3 mt-1.5">
            <div className="p-1 px-1.5 rounded-xl bg-white/5 border border-white/5 flex gap-1 text-xs">
              <button
                onClick={() => setIsInFactory(true)}
                className={`flex-1 py-1.5 rounded-lg cursor-pointer font-semibold transition-all ${
                  isInFactory ? 'bg-[#9cd2b8] text-black font-bold' : 'text-[#ffffff]'
                }`}
              >
                Inside geofence
              </button>
              <button
                onClick={() => setIsInFactory(false)}
                className={`flex-1 py-1.5 rounded-lg cursor-pointer font-semibold transition-all ${
                  !isInFactory ? 'bg-red-950/40 border border-[#ffb4ab]/30 text-[#ffb4ab]' : 'text-[#ffffff]'
                }`}
              >
                Outside factory
              </button>
            </div>

            <div className="p-3 bg-black/40 border border-white/5 rounded-xl font-mono text-[11px] flex flex-col gap-1.5 text-[#ffffff]/70">
              <div className="flex justify-between">
                <span>Latitude:</span>
                <span className="text-white font-semibold">{simLat.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Longitude:</span>
                <span className="text-white font-semibold">{simLng.toFixed(6)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/5">
                <span>Validation check:</span>
                <span className={`font-bold ${isInFactory ? 'text-[#9cd2b8]' : 'text-[#ffb4ab]'}`}>
                  {isInFactory ? 'GEOFENCE_VALID (200m)' : 'OOB_GEOFENCE_ALERT'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SOS Alarm Trigger Card */}
        <div className="p-5 bg-gradient-to-br from-[#3c1414]/20 to-black/20 border border-[#ffb4ab]/20 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#ffb4ab] animate-bounce" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffb4ab]">Operator Emergency SOS</h3>
          </div>
          <p className="text-[11px] text-[#ffffff]/60 leading-relaxed">
            Distress broadcasts bypass generic protocols, immediately triggering persistent visual alerts with GPS details direct to manager panels.
          </p>

          <button
            onClick={handleSimSOS}
            className="w-full py-3 bg-[#93000a] hover:bg-[#93000a]/80 text-[#ffb4ab] text-xs font-bold font-mono rounded-xl cursor-pointer active:scale-95 transition-all shadow-xl uppercase border border-[#ffb4ab]/40 flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            Trigger Immediate SOS
          </button>
          
          {sosStatus && (
            <div className="p-2.5 rounded-lg bg-red-950/20 border border-[#ffb4ab]/30 text-xs text-[#ffb4ab] leading-relaxed text-center font-semibold">
              {sosStatus}
            </div>
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: Mobile Device Screen Mockup Wrapper */}
      <div className="flex-1 flex justify-center items-center py-4">
        
        {/* Stylized physical smartphone frame */}
        <div className="w-[340px] h-[640px] rounded-[40px] bg-neutral-950 border-4 border-neutral-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-3 relative flex flex-col overflow-hidden ring-12 ring-neutral-900">
          
          {/* Speaker, camera camera notch */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-neutral-950 rounded-full flex items-center justify-center gap-1 z-50">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-800"></div>
            <div className="w-12 h-1 bg-neutral-900 rounded"></div>
          </div>

          {/* Internal Mobile Screen Surface */}
          <div className="flex-1 bg-[#141314] rounded-[28px] overflow-hidden flex flex-col p-4 pt-10 gap-5 relative">
            
            {/* Top Bar Indicators */}
            <div className="flex justify-between text-[11px] font-mono text-[#ffffff]/60 select-none pb-2 border-b border-white/5">
              <span>opp sync Mobile</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span>LTE / TX</span>
              </div>
            </div>

            {/* Avatar header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#cbc3d9] border border-white/10 flex items-center justify-center text-slate-900 font-bold text-xs uppercase">
                JK
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white tracking-tight uppercase">J. Kowalski</span>
                <span className="text-[10px] text-[#ffffff]/60">Assembly Section A Operator</span>
              </div>
            </div>

            {/* Main Interactive Check-in Dashboard inside phone device */}
            <div className="flex-grow flex flex-col justify-center items-center gap-6 mt-4 select-none">
              
              {/* Massive Toggle Button */}
              {activeRecord ? (
                <div className="flex flex-col items-center gap-4">
                  
                  {/* Status animation */}
                  <div className="w-28 h-28 rounded-full bg-[#9cd2b8]/10 border-2 border-[#9cd2b8] flex items-center justify-center animate-fadeIn relative">
                    <div className="w-24 h-24 rounded-full bg-[#9cd2b8]/20 flex items-center justify-center animate-pulse">
                      <Clock className="w-12 h-12 text-[#9cd2b8]" />
                    </div>
                  </div>

                  <div className="text-center font-sans">
                    <span className="text-xs font-bold text-[#9cd2b8] uppercase block tracking-wider">Active Session Logging</span>
                    <span className="text-[10px] text-[#ffffff]/60 font-mono">Clock In: {new Date(activeRecord.clockIn).toLocaleTimeString()}</span>
                    
                    {/* Radius verified icon */}
                    <div className="mt-2.5 p-1 px-2 text-[9px] bg-emerald-900/20 text-[#9cd2b8] rounded border border-[#9cd2b8]/30 flex items-center gap-1.5 justify-center">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>GEOLOGICAL CERTIFIED</span>
                    </div>
                  </div>

                  <button
                    onClick={onClockOut}
                    className="mt-2 py-2 px-6 rounded-xl bg-gradient-to-r from-red-600 to-[#93000a] text-white text-xs font-bold cursor-pointer hover:scale-105 active:scale-95 shadow-lg flex items-center gap-1.5 transition-all"
                  >
                    <span>Check Out Session</span>
                  </button>

                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  
                  {/* Status animation standby */}
                  <div className="w-28 h-28 rounded-full bg-white/5 border border-[#ffffff]/15 flex items-center justify-center relative">
                    <Clock className="w-10 h-10 text-[#ffffff]/40" />
                  </div>

                  <div className="text-center font-sans">
                    <span className="text-xs font-bold text-white uppercase block tracking-wider">Session Suspended</span>
                    <p className="text-[10px] text-[#ffffff]/50 max-w-[200px] mt-0.5">Please clock in to stream device coordinates safely within geofenced boundaries.</p>
                  </div>

                  <button
                    onClick={handleSimClockIn}
                    className="py-2.5 px-8 rounded-xl bg-[#9cd2b8] text-black text-xs font-black cursor-pointer hover:scale-105 active:scale-95 shadow-xl transition-all flex items-center gap-2 font-mono"
                  >
                    <span>CLOCK IN WORKER</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                </div>
              )}

            </div>

            {/* Mini prompt reminder */}
            <div className="p-3 bg-[#1c1b1d]/85 rounded-xl border border-white/5 text-[10px] text-[#ffffff]/60 leading-relaxed text-center font-mono">
              GPS Lock coords: {simLat.toFixed(4)}, {simLng.toFixed(4)}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
