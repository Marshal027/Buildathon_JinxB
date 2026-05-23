import React, { useState } from 'react';
import { 
  Zap, 
  Cpu, 
  Users, 
  Ticket, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle,
  Radio, 
  ExternalLink,
  Smartphone,
  Flame,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage({ 
  summary, 
  machines, 
  liveAlerts, 
  currentUser, 
  onBroadcast,
  onSelectMachine,
  setActiveTab 
}) {
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState('critical');

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    onBroadcast(broadcastMessage, broadcastPriority);
    setBroadcastMessage('');
  };

  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'critical': return 'text-[#ffb4ab] border-[#ffb4ab]/30 bg-[#ffb4ab]/10';
      case 'warning': return 'text-[#f4bc59] border-[#f4bc59]/30 bg-[#f4bc59]/10';
      default: return 'text-[#9cd2b8] border-[#9cd2b8]/30 bg-[#9cd2b8]/10';
    }
  };

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6 max-w-[1600px] mx-auto w-full select-none">
      
      {/* Banner / Header Bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-gradient-to-r from-[#141314] to-[#201f21] border border-[#ffffff]/10 rounded-2xl gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight uppercase">Plant Safety & KPI Executive Console</h2>
          <p className="text-xs text-[#ffffff]/60">Physical Operations geofenced metrics, AI sensor failure models, operator distress flags</p>
        </div>
        
        <div className="flex items-center gap-3.5">
          <div className="flex flex-col text-right font-mono text-[10px] text-neutral-400">
            <span>System Host Gateway</span>
            <span className="text-[#9cd2b8] font-bold">NODE_STREAM_LIVE // CLOUD CONGESTION OK</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-[#9cd2b8]/10 border border-[#9cd2b8]/20 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9cd2b8] animate-ping"></span>
            <span className="text-[10px] font-mono font-bold text-[#9cd2b8] uppercase">Telemetry Link Active</span>
          </div>
        </div>
      </header>

      {/* Primary KPI Grid dashboard blocks */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI Card 1: Production efficiency */}
        <div className="p-5 bg-[#141314]/50 border border-[#ffffff]/10 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-[#9cd2b8]/20 transition-all">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#ffffff]/60 uppercase tracking-widest font-mono">Production Yield</span>
            <span className="text-2xl font-bold font-mono text-white mt-1.5">{summary.productivity}%</span>
            <span className="text-[9px] text-[#9cd2b8] font-semibold mt-1 flex items-center gap-0.5">▲ {summary.productivity > 93 ? '+' : ''}{(summary.productivity - 92.6).toFixed(1)}% from benchmark</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#2b292b] flex items-center justify-center text-[#9cd2b8] shrink-0 border border-white/5">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        {/* KPI Card 2: Personnel Online */}
        <div className="p-5 bg-[#141314]/50 border border-[#ffffff]/10 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-[#b0cbd8]/30 transition-all">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#ffffff]/60 uppercase tracking-widest font-mono">Fenced Operator Crew</span>
            <span className="text-2xl font-bold font-mono text-white mt-1.5">{summary.personnelActive} active</span>
            <span className="text-[9px] text-[#b0cbd8] font-semibold mt-1 flex items-center gap-0.5">● {Math.round(summary.personnelActive / 1.3)}% attendance sweep</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#2b292b] flex items-center justify-center text-[#b0cbd8] shrink-0 border border-white/5">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI Card 3: Machine Status summary */}
        <div className="p-5 bg-[#141314]/50 border border-[#ffffff]/10 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-[#cbc3d9]/20 transition-all">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#ffffff]/60 uppercase tracking-widest font-mono">Machine Telemetry Rate</span>
            <span className="text-2xl font-bold font-mono text-white mt-1.5">{summary.machinesOnline}/{summary.machinesTotal}</span>
            <span className="text-[9px] text-[#cbc3d9] font-semibold mt-1">{summary.machinesTotal - summary.machinesOnline} node{summary.machinesTotal - summary.machinesOnline !== 1 ? 's' : ''} flagged warning</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#2b292b] flex items-center justify-center text-[#cbc3d9] shrink-0 border border-white/5">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        {/* KPI Card 4: Open Defects tickets */}
        <div className="p-5 bg-[#141314]/50 border border-[#ffffff]/10 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-[#ffb4ab]/20 transition-all">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#ffffff]/60 uppercase tracking-widest font-mono">Fault Tickets Open</span>
            <span className="text-2xl font-bold font-mono text-white mt-1.5">{summary.openTickets} registered</span>
            <span className="text-[9px] text-[#ffb4ab] font-bold mt-1 flex items-center gap-1">
              ⚠️ {summary.criticalTickets} critical alert pending
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#2e1919] flex items-center justify-center text-[#ffb4ab] shrink-0 border border-[#ffb4ab]/10">
            <Ticket className="w-5 h-5" />
          </div>
        </div>

      </section>

      {/* Main double column grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COMPONENT: Real-time sensor layout and machine triggers */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center bg-[#141314]/50 p-4 border border-white/5 rounded-xl">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#9cd2b8]" />
              <h3 className="text-xs font-mono font-bold uppercase text-white">Telemetric Node Real-Time Spectrometer</h3>
            </div>
            <button 
              type="button"
              onClick={() => setActiveTab('machine-health')}
              className="text-[11px] font-semibold text-[#9cd2b8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Open Interactive Floor Map
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {machines.slice(0, 6).map((m) => {
              const borderTheme = m.status === 'offline' ? 'border-[#ffb4ab]' : m.status === 'warning' ? 'border-[#f4bc59]' : 'border-white/5';
              const bgTheme = m.status === 'offline' ? 'bg-[#ffb4ab]/5' : m.status === 'warning' ? 'bg-[#f4bc59]/5' : 'bg-[#141314]/40';
              return (
                <div 
                  key={m.id} 
                  onClick={() => onSelectMachine(m)}
                  className={`p-4 rounded-xl border ${borderTheme} ${bgTheme} hover:scale-[1.02] hover:border-white/20 transition-all flex justify-between items-start cursor-pointer`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-mono text-xs font-bold">{m.id}</span>
                      <span className="text-[10px] text-neutral-400">• {m.locationZone}</span>
                    </div>
                    <span className="text-white text-xs font-semibold mt-1 truncate max-w-[130px]">{m.name}</span>
                    <span className="text-[9px] text-neutral-400 mt-2 font-mono">Temp: <strong className="text-white font-mono">{m.temp || 45}°C</strong>, Vib: <strong className="text-white font-mono">{m.vibration || 12} mm/s</strong></span>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${
                      m.status === 'online' ? 'text-[#9cd2b8] border-[#9cd2b8]/30 bg-[#9cd2b8]/5' :
                      m.status === 'offline' ? 'text-[#ffb4ab] border-[#ffb4ab]/30 bg-[#ffb4ab]/5' : 'text-[#f4bc59] border-[#f4bc59]/30 bg-[#f4bc59]/5'
                    }`}>
                      {m.status}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold">{m.healthScore}% Hlth</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Active alerts block and supervisor broadcast transmitter */}
        <div className="flex flex-col gap-6">
          
          {/* Section: Live System Log Stream list */}
          <div className="p-5 bg-[#141314]/50 border border-[#ffffff]/10 rounded-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold uppercase text-white tracking-widest flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Live System Log Stream
              </span>
              <span className="text-[9px] font-mono text-neutral-400">Total Fenced: {liveAlerts.length}</span>
            </div>

            <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1">
              {liveAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-3.5 border rounded-xl flex flex-col gap-1 transition-all hover:bg-neutral-900 ${getSeverityStyle(alert.severity)}`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase font-bold">
                    <span>{alert.title}</span>
                    <span>{alert.timestamp}</span>
                  </div>
                  <p className="text-[11px] font-sans leading-relaxed text-white/80">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Broadcast dispatcher console */}
          <div className="p-5 bg-[#141314]/50 border border-[#ffffff]/10 rounded-2xl flex flex-col gap-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Safety Warning Broadcasting</h3>
            <p className="text-xs text-neutral-400">Transmits direct high-priority visual broadcast flashes across operator mobile terminals instantly</p>
            
            <form onSubmit={handleSendBroadcast} className="flex flex-col gap-3 mt-1.5">
              <textarea
                placeholder="Declare safety broadcast warnings... (e.g., 'Emergency HVAC servicing scheduled in Section A-1 in 10 minutes')"
                className="w-full h-20 text-xs p-3 rounded-xl bg-[#1e1d1e] border border-white/5 focus:border-[#9cd2b8] text-white focus:outline-none placeholder-neutral-500 transition-all font-sans"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
              />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center bg-[#252325] border border-white/5 px-2 py-1 rounded-lg text-xs gap-1 cursor-pointer">
                  <span className="text-[10px] uppercase font-mono mr-1.5 text-neutral-400">Target Range</span>
                  <select 
                    value={broadcastPriority}
                    onChange={(e) => setBroadcastPriority(e.target.value)}
                    className="bg-transparent border-none text-white focus:outline-none cursor-pointer pr-1 text-[11px]"
                  >
                    <option value="critical" className="bg-black text-[#ffb4ab]">🚨 High Hazard Priority</option>
                    <option value="warning" className="bg-black text-[#f4bc59]">⚠️ Informational Sweep</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-black bg-[#9cd2b8] rounded-xl hover:bg-[#8ac1a7] shadow-lg shadow-[#9cd2b8]/10 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  Dispatch Flash
                </button>
              </div>
            </form>
          </div>

        </div>

      </section>

    </div>
  );
}
