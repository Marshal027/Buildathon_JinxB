import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Map, 
  Search,
  Check,
  X
} from 'lucide-react';

export default function PersonnelPage({ attendance, workerLocations }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Static mockup state swap requests
  const [swaps, setSwaps] = useState([
    { id: '1', requester: 'J. Kowalski', role: 'Operator A1', swapShift: 'Night shift (10 PM)', targetWorker: 'S. Miller', status: 'pending' },
    { id: '2', requester: 'A. Chen', role: 'Machinist B1', swapShift: 'Afternoon rotation (2 PM)', targetWorker: 'J. Smith', status: 'pending' }
  ]);

  const handleApproveSwap = (id) => {
    setSwaps(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' } : s));
  };

  const handleDenySwap = (id) => {
    setSwaps(prev => prev.map(s => s.id === id ? { ...s, status: 'denied' } : s));
  };

  // Coordinates offsets for spatial workforce locator canvas
  const workerCoords = {
    'T-492': { x: 30, y: 35 },
    'E-118': { x: 74, y: 62 },
    'S-882': { x: 50, y: 45 }
  };

  const filteredAttendance = attendance.filter(record => 
    record.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.workerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full p-4 lg:p-6 overflow-hidden max-w-[1600px] mx-auto w-full">
      
      {/* LEFT COLUMN: Spatial locator workforce canvas */}
      <div className="flex-1 flex flex-col bg-[#141314]/50 border border-[#cac5cc]/10 rounded-2xl overflow-hidden min-h-[420px]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#201f21] to-[#242325] border-b border-[#cac5cc]/10 flex items-center justify-between select-none">
          <div>
            <h3 className="text-sm font-semibold text-white uppercase flex items-center gap-2">
              <Map className="w-4 h-4 text-[#9cd2b8]" />
              Workforce Spatial Density Tracker
            </h3>
            <p className="text-[11px] text-[#cac5cc]/60">Geofenced radar map of active floor personnel</p>
          </div>
          <span className="text-[11px] font-mono text-[#9cd2b8] animate-pulse">Live Tracking Enabled</span>
        </div>

        {/* Spatial density map radar canvas */}
        <div className="flex-1 relative bg-black/40 p-6 flex items-center justify-center overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dotpattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotpattern)" />
          </svg>

          {/* Glowing radar scan concentric circles */}
          <div className="absolute w-80 h-80 rounded-full border border-cyan-400/10 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-56 rounded-full border border-cyan-400/5 pointer-events-none"></div>
          </div>

          <div className="absolute inset-4 border border-[#cac5cc]/10 rounded-xl relative w-full h-full p-10">
            <span className="absolute left-4 top-4 text-[9px] font-mono uppercase text-[#cac5cc]/40">[ GEOFENCED ZONE RECTANGLE: 200m CENTER ]</span>

            {/* Workers pins overlay */}
            {workerLocations.map((worker) => {
              // Retrieve coordinates
              const coord = workerCoords[worker.id] || { x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 };
              
              return (
                <div
                  key={worker.id}
                  style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group"
                >
                  <div className="relative flex flex-col items-center">
                    {/* Glowing beacon ping animated effect */}
                    <span className="w-4 h-4 absolute bg-emerald-400 rounded-full animate-ping opacity-75 pointer-events-none"></span>
                    
                    {/* Pin button */}
                    <div className="w-7 h-7 rounded-full bg-slate-900 border border-emerald-400 flex items-center justify-center text-[10px] font-bold text-emerald-400 font-mono shadow-2xl relative">
                      {worker.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="bg-black/90 text-white font-mono text-[9px] px-1.5 py-0.5 rounded border border-white/5 whitespace-nowrap mt-1 uppercase">
                      {worker.name} (LAT: {worker.lat.toFixed(4)})
                    </div>
                  </div>
                </div>
              );
            })}

            {workerLocations.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-neutral-500 text-xs">
                <MapPin className="w-8 h-8 text-neutral-600 mb-2 animate-bounce" />
                <span>No live operator coordinates streaming. Clock in from Worker portal.</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Attendance Table listing */}
        <div className="p-4 bg-[#111]/90 border-t border-[#cac5cc]/10 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-white">Attendance Verification Logs</span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#cac5cc]/50 absolute left-2 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search roster..."
                className="text-[10px] pl-7 pr-2 py-1 rounded bg-white/5 border border-white/5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#9cd2b8] w-36 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[160px]">
            <table className="w-full text-left font-mono text-[10px] text-[#cac5cc]/75 border-collapse">
              <thead>
                <tr className="border-b border-[#cac5cc]/10 text-[#cac5cc]/40">
                  <th className="pb-1 text-left font-medium">Worker ID</th>
                  <th className="pb-1 text-left font-medium">Staff Name</th>
                  <th className="pb-1 text-left font-medium">Clock In Time</th>
                  <th className="pb-1 text-left font-medium">Geofence Verified</th>
                  <th className="pb-1 text-right font-medium">Outbound Clock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5 transition-all">
                    <td className="py-2 text-white/50">{record.workerId}</td>
                    <td className="py-2 text-white font-semibold uppercase">{record.workerName}</td>
                    <td className="py-2 text-white/70">{new Date(record.clockIn).toLocaleTimeString()}</td>
                    <td className="py-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border inline-block ${
                        record.isValid 
                          ? 'bg-[#265a46]/20 text-[#9cd2b8] border-[#9cd2b8]/20' 
                          : 'bg-[#93000a]/10 text-[#ffb4ab] border-[#ffb4ab]/20'
                      }`}>
                        {record.isValid ? 'YES / VALID' : 'OUT_OF_BOUNDS'}
                      </span>
                    </td>
                    <td className="py-2 text-right text-white/50">{record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : 'Current Session'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Shift Swapping and request managers */}
      <div className="w-full lg:w-96 flex flex-col gap-5 select-none shrink-0 pb-4 pr-1">
        
        {/* shift swap panel request drawer */}
        <div className="p-5 bg-[#141314]/50 border border-[#cac5cc]/10 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#cbc3d9]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Shift Switching Queue</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            {swaps.map((swap) => (
              <div 
                key={swap.id}
                className="p-3 bg-[#1c1b1d] border border-white/5 rounded-xl flex flex-col gap-2 relative overflow-hidden transition-all duration-200"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white uppercase">{swap.requester}</span>
                  <span className="text-[10px] font-mono text-[#cac5cc]/40">{swap.role}</span>
                </div>

                <div className="text-[11px] text-[#cac5cc]/75 flex flex-col gap-0.5 leading-relaxed">
                  <div>Wants to trade: <strong className="text-white font-mono">{swap.swapShift}</strong></div>
                  <div>Assigned Cover: <span className="text-white font-mono">{swap.targetWorker}</span></div>
                </div>

                {swap.status === 'pending' ? (
                  <div className="flex items-center justify-end gap-2 mt-2 border-t border-white/5 pt-2">
                    <button
                      onClick={() => handleDenySwap(swap.id)}
                      className="p-1 px-2.5 rounded-lg border border-[#ffb4ab]/20 hover:bg-[#93000a]/10 text-[#ffb4ab] text-[10px] font-semibold cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Decline
                    </button>
                    
                    <button
                      onClick={() => handleApproveSwap(swap.id)}
                      className="p-1 px-2.5 rounded-lg bg-[#9cd2b8] hover:bg-[#9cd2b8]/80 text-[#141314] text-[10px] font-bold cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  </div>
                ) : (
                  <div className={`mt-2 border-t border-white/5 pt-2 text-center text-[10px] font-bold select-none capitalize ${
                    swap.status === 'approved' ? 'text-[#9cd2b8]' : 'text-[#ffb4ab]'
                  }`}>
                    Request is {swap.status} completed
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Module 2: Workforce instructions desk */}
        <div className="p-5 bg-[#141314]/50 border border-[#cac5cc]/10 rounded-2xl flex flex-col gap-2 leading-relaxed">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">Location Policy Status</span>
          <p className="text-[11px] text-[#cac5cc]/60 leading-relaxed">
            All active personnel are geofenced against the coordinates: <strong>37.7749 Lat, -122.4194 Lng</strong>. Clock-ins from outside the factory threshold line are marked as OOB (Out-of-bounds) safety violations.
          </p>
        </div>

      </div>

    </div>
  );
}
