import React, { useState, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Settings, 
  AlertTriangle, 
  Activity, 
  CheckCircle, 
  PowerOff,
  Thermometer,
  Gauge,
  Layers,
  Compass,
  Info,
  Flame,
  Wrench,
  Cpu,
  ArrowRight
} from 'lucide-react';

export default function MachineMap({ 
  machines, 
  selectedMachine, 
  onSelectMachine,
  onUpdateMachineStatus
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('status');
  const [layoutMode, setLayoutMode] = useState('blueprint');
  const [currentPreset, setCurrentPreset] = useState('all');

  // Relative visual coordinates for machines on spatial factory matrix (matched to actual data)
  const machineCoords = {
    'ASM-001': { x: 20, y: 24, zone: 'Zone A-1', desc: 'Assembly Line Alpha Motor' },
    'M-402': { x: 30, y: 35, zone: 'Zone A-1', desc: 'CNC Axis 4 Spindle' },
    'I-03': { x: 50, y: 26, zone: 'Zone B-1', desc: 'Precision Optical Scanner' },
    'P-114': { x: 72, y: 28, zone: 'Zone C-1', desc: 'High Tension Hydraulic Circuit' },
    'T-42': { x: 84, y: 36, zone: 'Zone C-1', desc: 'Main Output Conveyor Drive' },
    'CLS-042': { x: 24, y: 72, zone: 'Zone A-2', desc: 'Aux Secondary Cooling Unit' },
    'ROB-112': { x: 54, y: 68, zone: 'Zone B-2', desc: 'Primary Heavy Welding Arm' },
    'EX-02': { x: 82, y: 74, zone: 'Zone D-1', desc: 'Thermo Extrusion Line' },
  };

  // Compute status aggregation per zone
  const getZoneStatus = (zoneCode) => {
    const zoneMachines = machines.filter(m => m.locationZone === zoneCode);
    if (!zoneMachines.length) return 'online';
    
    if (zoneMachines.some(m => m.status === 'offline')) return 'offline';
    if (zoneMachines.some(m => m.status === 'warning')) return 'warning';
    if (zoneMachines.some(m => m.status === 'maintenance')) return 'maintenance';
    return 'online';
  };

  // Quick focal preset switcher (scale & translate %)
  const focusPreset = (preset) => {
    setCurrentPreset(preset);
    switch (preset) {
      case 'all':
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
        break;
      case 'machining':
        // Zoom on top-left / bottom-left (Zones A-1, A-2)
        setZoomLevel(1.5);
        setPanOffset({ x: 22, y: 12 });
        break;
      case 'assembly':
        // Zoom on center-line (Zones B-1, B-2)
        setZoomLevel(1.6);
        setPanOffset({ x: -2, y: 4 });
        break;
      case 'shipping':
        // Zoom on right-line (Zones C-1, D-1)
        setZoomLevel(1.5);
        setPanOffset({ x: -24, y: 10 });
        break;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-[#9cd2b8] text-black border-[#9cd2b8]';
      case 'warning': return 'bg-[#f4bc59] text-black border-[#f4bc59]';
      case 'offline': return 'bg-[#ffb4ab] text-[#141314] border-[#ffb4ab]';
      case 'maintenance': return 'bg-[#cbc3d9] text-[#1e1929] border-[#cbc3d9]';
    }
  };

  const getZoneColorClass = (status) => {
    switch (status) {
      case 'offline': return 'fill-[#ffb4ab]/10 stroke-[#ffb4ab]/30 animate-pulse';
      case 'warning': return 'fill-[#f4bc59]/8 stroke-[#f4bc59]/30';
      case 'maintenance': return 'fill-[#cbc3d9]/8 stroke-[#cbc3d9]/20';
      default: return 'fill-emerald-950/2 stroke-emerald-800/20';
    }
  };

  const getPulseAnimation = (status) => {
    if (status === 'offline') return 'animate-ping opacity-75 bg-[#ffb4ab]';
    if (status === 'warning') return 'animate-ping opacity-60 bg-[#f4bc59]';
    if (status === 'maintenance') return 'animate-ping opacity-45 bg-[#cbc3d9]';
    return 'animate-ping opacity-25 bg-[#9cd2b8]';
  };

  // Helper labels for specific coordinates on pins hover
  const getSelectedMachineZoneDesc = () => {
    if (!selectedMachine) return '';
    const coord = machineCoords[selectedMachine.id];
    return coord ? `${coord.zone} • ${coord.desc}` : 'Standard Node';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
      
      {/* Dynamic Factory Map Board Canvas */}
      <div className="flex-1 flex flex-col bg-[#0c0c0e]/95 border border-[#cac5cc]/10 rounded-2xl relative overflow-hidden min-h-[550px] shadow-[0_12px_32px_rgba(0,0,0,0.4)]">
        
        {/* Floor Map Title and Control Headers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-[#cac5cc]/10 z-10 backdrop-blur-[12px] bg-black/40 gap-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#9cd2b8] animate-spin" style={{ animationDuration: '10s' }} />
              Live Interactive Floor Plan Blueprint
            </h3>
            <p className="text-xs text-[#cac5cc]/60">Physical asset spatial registry, geofenced zones and real-time conveyor vectors</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Focal jump selectors */}
            <div className="flex items-center bg-[#1c1b1d] border border-white/5 rounded-lg p-0.5 text-[11px] font-semibold text-neutral-400">
              <button 
                type="button"
                onClick={() => focusPreset('all')} 
                className={`px-2 py-1 rounded-md transition-all ${currentPreset === 'all' ? 'bg-[#9cd2b8] text-black font-bold' : 'hover:text-white'}`}
              >
                Full Floor
              </button>
              <button 
                type="button"
                onClick={() => focusPreset('machining')} 
                className={`px-2 py-1 rounded-md transition-all ${currentPreset === 'machining' ? 'bg-[#9cd2b8] text-black font-bold' : 'hover:text-white'}`}
              >
                Machining
              </button>
              <button 
                type="button"
                onClick={() => focusPreset('assembly')} 
                className={`px-2 py-1 rounded-md transition-all ${currentPreset === 'assembly' ? 'bg-[#9cd2b8] text-black font-bold' : 'hover:text-white'}`}
              >
                Assembly Line
              </button>
              <button 
                type="button"
                onClick={() => focusPreset('shipping')} 
                className={`px-2 py-1 rounded-md transition-all ${currentPreset === 'shipping' ? 'bg-[#9cd2b8] text-black font-bold' : 'hover:text-white'}`}
              >
                Extrusion/Cargo
              </button>
            </div>

            {/* Layout view-modes togglers */}
            <div className="flex items-center gap-1 bg-[#1c1b1d] border border-white/5 p-1 rounded-lg">
              <button
                type="button"
                title="Standard Floor plan Blueprint wireframe"
                onClick={() => setLayoutMode('blueprint')}
                className={`px-2 py-1 text-[10px] rounded font-bold uppercase transition ${layoutMode === 'blueprint' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                Blueprint
              </button>
              <button
                type="button"
                title="Zone-alert thermal overlay"
                onClick={() => setLayoutMode('thermal')}
                className={`px-2 py-1 text-[10px] rounded font-bold uppercase transition ${layoutMode === 'thermal' ? 'bg-orange-500/20 text-[#f4bc59]' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                Zone Glow
              </button>
              <button
                type="button"
                title="Material production vectors and conveyor flows"
                onClick={() => setLayoutMode('flow')}
                className={`px-2 py-1 text-[10px] rounded font-bold uppercase transition ${layoutMode === 'flow' ? 'bg-cyan-500/20 text-cyan-300' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                Flow Vector
              </button>
            </div>

            {/* Manual scaling controls */}
            <div className="flex items-center gap-1 border-l border-white/10 pl-2">
              <button 
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 2.0))} 
                title="Zoom In"
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-[#cac5cc] hover:text-[#9cd2b8]"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.75))} 
                title="Zoom Out"
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-[#cac5cc] hover:text-[#9cd2b8]"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button"
                onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); setCurrentPreset('all'); }} 
                title="Reset Camera focus"
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-[#cac5cc] hover:text-[#9cd2b8]"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Outer Scaled Map viewport area container */}
        <div className="flex-1 relative overflow-auto select-none p-4" style={{ cursor: 'grab' }}>
          <div 
            style={{ 
              transform: `scale(${zoomLevel}) translate(${panOffset.x}%, ${panOffset.y}%)`, 
              transformOrigin: 'center center',
              transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
            className="absolute inset-0 w-full h-full min-w-[850px] min-h-[500px] flex items-center justify-center p-8 transition-transform"
          >
            {/* SVG Interactive Blueprint Vector Canvas */}
            <svg 
              className="absolute inset-0 w-full h-full" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Visual architectural grids pattern */}
                <pattern id="archGrid" width="4" height="4" patternUnits="userSpaceOnUse">
                   <path d="M 4 0 L 0 0 0 4" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.1" />
                </pattern>

                {/* Yellow diagnostic hatched security lanes pattern */}
                <pattern id="hazardStripes" width="3" height="3" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                  <rect width="1.2" height="3" fill="#f4bc59" fillOpacity="0.15" />
                  <rect x="1.2" width="1.8" height="3" fill="transparent" />
                </pattern>

                {/* Ambient glow backgrounds */}
                <radialGradient id="centerRadarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#9cd2b8" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#0c0c0e" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Grid blueprint background line layer */}
              <rect width="100" height="100" fill="url(#archGrid)" />
              <circle cx="50" cy="50" r="45" fill="url(#centerRadarGlow)" />

              {/* WALKWAYS AND SECURITY CORRIDORS OVERLAYS (yellow caution striped lanes) */}
              {layoutMode !== 'thermal' && (
                <>
                  {/* Central Main Walkway corridor line */}
                  <rect x="6" y="47" width="88" height="5" fill="url(#hazardStripes)" rx="1" />
                  {/* Vertical secondary walkway */}
                  <rect x="41" y="6" width="4" height="88" fill="url(#hazardStripes)" rx="1" />
                  {/* Guide arrows on corridors */}
                  <path d="M12 49.5 L14 49.5 L13 48.5 M20 49.5 L22 49.5" stroke="#f4bc59" strokeWidth="0.15" opacity="0.6" strokeLinecap="round" />
                  <path d="M82 49.5 L84 49.5 L83 48.5" stroke="#f4bc59" strokeWidth="0.15" opacity="0.6" strokeLinecap="round" />
                  <text x="43" y="10" fill="#f4bc59" fillOpacity="0.5" fontSize="1" fontFamily="monospace" textAnchor="middle" fontWeight="bold">SAFETY LANE</text>
                  <text x="43" y="90" fill="#f4bc59" fillOpacity="0.5" fontSize="1" fontFamily="monospace" textAnchor="middle" fontWeight="bold">EMERGENCY EXIT</text>
                </>
              )}

              {/* CONVEYOR TRANSMISSION FLOW LAYER */}
              {layoutMode === 'flow' && (
                <>
                  {/* Animated production line routing vector */}
                  <path 
                    d="M 12 24 L 38 24 L 38 41 L 62 41 L 62 26 L 88 26" 
                    fill="none" 
                    stroke="cyan" 
                    strokeWidth="0.6" 
                    strokeDasharray="2 1.5" 
                    className="animate-[dash_12s_linear_infinite]"
                  />
                  {/* Conveyor track border layout */}
                  <path d="M 12 24 L 38 24 L 38 41 L 62 41 L 62 26 L 88 26" fill="none" stroke="rgba(0, 255, 255, 0.25)" strokeWidth="0.9" strokeLinecap="round" />
                  <text x="36" y="22" fill="#22d3ee" fillOpacity="0.8" fontSize="1.1" fontFamily="monospace" fontWeight="bold">MAIN CONVEYOR BELT α</text>
                </>
              )}

              {/* FACTORY ARCHITECTURAL BLUEPRINT ZONES */}
              
              {/* ZONE A-1: CNC Machining Bay (Top Left) */}
              <g>
                <rect 
                  x="6" y="6" width="34" height="40" 
                  className={`transition-colors duration-500 rounded-lg ${layoutMode === 'thermal' ? getZoneColorClass(getZoneStatus('A-1')) : 'fill-[#1c1b1d]/20'} stroke-[#cac5cc]/15 stroke-width-[0.25]`} 
                />
                <text x="8" y="10" fill="#9cd2b8" fontSize="1.5" fontWeight="bold" fontFamily="monospace">ZONE A-1: CNC PRECISION MACHINING</text>
                {/* Structural benches inside Zone A-1 */}
                <rect x="8" y="14" width="8" height="6" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.15" />
                <rect x="25" y="14" width="10" height="6" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.15" />
                <text x="12" y="18" fill="white" fillOpacity="0.2" fontSize="0.9" fontFamily="monospace">ROUTER BENCH</text>
                <text x="30" y="18" fill="white" fillOpacity="0.2" fontSize="0.9" fontFamily="monospace">SPINDLE CORE</text>
                {/* Area partition doors */}
                <path d="M 40 18 L 40 22" stroke="coral" strokeWidth="0.5" strokeLinecap="round" />
              </g>

              {/* ZONE B-1: Precision Inspection Lab (Top Center) */}
              <g>
                <rect 
                  x="45" y="6" width="20" height="40" 
                  className={`transition-colors duration-500 ${layoutMode === 'thermal' ? getZoneColorClass(getZoneStatus('B-1')) : 'fill-[#1c1b1d]/20'} stroke-[#cac5cc]/15 stroke-width-[0.25]`} 
                />
                <text x="47" y="10" fill="#b0cbd8" fontSize="1.5" fontWeight="bold" fontFamily="monospace">ZONE B-1: QUALITY SENSORS</text>
                {/* Circular scanner workspace display */}
                <circle cx="55" cy="22" r="5" fill="none" stroke="cyan" strokeWidth="0.1" strokeDasharray="0.5 0.5" />
                <line x1="50" y1="22" x2="60" y2="22" stroke="cyan" strokeWidth="0.08" opacity="0.3" />
                <line x1="55" y1="17" x2="55" y2="27" stroke="cyan" strokeWidth="0.08" opacity="0.3" />
                <text x="55" y="30" fill="cyan" fillOpacity="0.25" fontSize="0.9" fontFamily="monospace" textAnchor="middle">OPTICAL MATRIX ARRAY</text>
              </g>

              {/* ZONE C-1: Hydraulic Packing Hub & Conveyance (Top Right) */}
              <g>
                <rect 
                  x="68" y="6" width="26" height="40" 
                  className={`transition-colors duration-500 ${layoutMode === 'thermal' ? getZoneColorClass(getZoneStatus('C-1')) : 'fill-[#1c1b1d]/20'} stroke-[#cac5cc]/15 stroke-width-[0.25]`} 
                />
                <text x="70" y="10" fill="#f4bc59" fontSize="1.5" fontWeight="bold" fontFamily="monospace">ZONE C-1: PACKING & OUTFLOW</text>
                {/* Cargo shelf racks */}
                <g fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.1">
                  <rect x="70" y="15" width="4" height="9" />
                  <rect x="76" y="15" width="4" height="9" />
                  <rect x="82" y="15" width="4" height="9" />
                  <rect x="88" y="15" width="4" height="9" />
                </g>
                <text x="81" y="21" fill="white" fillOpacity="0.15" fontSize="0.9" fontFamily="monospace" textAnchor="middle">CONTAINER RACKS</text>
              </g>

              {/* ZONE A-2: Plant Cooling Substation (Bottom Left) */}
              <g>
                <rect 
                  x="6" y="53" width="34" height="41" 
                  className={`transition-colors duration-500 rounded-lg ${layoutMode === 'thermal' ? getZoneColorClass(getZoneStatus('A-2')) : 'fill-[#1c1b1d]/20'} stroke-[#cac5cc]/15 stroke-width-[0.25]`} 
                />
                <text x="8" y="57" fill="#cbc3d9" fontSize="1.5" fontWeight="bold" fontFamily="monospace">ZONE A-2: SYSTEM INFRASTRUCTURE</text>
                {/* Secondary coolants tubes representation */}
                <circle cx="15" cy="74" r="4" fill="none" stroke="#6366f1" strokeWidth="0.2" />
                <circle cx="28" cy="74" r="4" fill="none" stroke="#6366f1" strokeWidth="0.2" />
                <line x1="19" y1="74" x2="24" y2="74" stroke="#6366f1" strokeWidth="0.15" />
                <text x="21" y="81" fill="#818cf8" fillOpacity="0.3" fontSize="0.9" fontFamily="monospace" textAnchor="middle">COOLING SUBSTATION BETA</text>
              </g>

              {/* ZONE B-2: Heavy Robotic Welding Lab (Bottom Center) */}
              <g>
                <rect 
                  x="43" y="53" width="22" height="41" 
                  className={`transition-colors duration-500 ${layoutMode === 'thermal' ? getZoneColorClass(getZoneStatus('B-2')) : 'fill-[#1c1b1d]/20'} stroke-[#cac5cc]/15 stroke-width-[0.25]`} 
                />
                <text x="45" y="57" fill="#b0cbd8" fontSize="1.5" fontWeight="bold" fontFamily="monospace">ZONE B-2: ROBOT WELDING</text>
                {/* Safety fences inside robot cell */}
                <line x1="45" y1="62" x2="62" y2="62" stroke="#ef4444" strokeWidth="0.15" strokeDasharray="0.5 0.5" opacity="0.4" />
                <line x1="45" y1="62" x2="45" y2="88" stroke="#ef4444" strokeWidth="0.15" strokeDasharray="0.5 0.5" opacity="0.4" />
                <line x1="62" y1="62" x2="62" y2="88" stroke="#ef4444" strokeWidth="0.15" strokeDasharray="0.5 0.5" opacity="0.4" />
                <text x="54" y="64" fill="#ef4444" fillOpacity="0.3" fontSize="0.8" fontFamily="monospace" textAnchor="middle">BARRIER PROTECTION ACTUATE</text>
              </g>

              {/* ZONE D-1: Extruder Thermo Lab (Bottom Right) */}
              <g>
                <rect 
                  x="68" y="53" width="26" height="41" 
                  className={`transition-colors duration-500 ${layoutMode === 'thermal' ? getZoneColorClass(getZoneStatus('D-1')) : 'fill-[#1c1b1d]/20'} stroke-[#cac5cc]/15 stroke-width-[0.25]`} 
                />
                <text x="70" y="57" fill="#cbc3d9" fontSize="1.5" fontWeight="bold" fontFamily="monospace">ZONE D-1: EXTRUSION LINE</text>
                {/* Cylindrical extrusion coil coils */}
                <rect x="71" y="65" width="20" height="3" fill="none" stroke="coral" strokeWidth="0.15" />
                <circle cx="73" cy="66.5" r="1.2" fill="coral" />
                <circle cx="81" cy="66.5" r="1.2" fill="coral" />
                <circle cx="89" cy="66.5" r="1.2" fill="coral" />
                <text x="81" y="71" fill="coral" fillOpacity="0.25" fontSize="0.9" fontFamily="monospace" textAnchor="middle">HEATING COIL MATRICES</text>
              </g>

              {/* Outer concrete facility boundary wall lines */}
              <rect x="3" y="3" width="94" height="94" fill="none" stroke="#69738a" strokeWidth="0.5" strokeLinecap="round" />
              {/* Facility Entrance Door */}
              <line x1="48" y1="97" x2="52" y2="97" stroke="cyan" strokeWidth="0.7" />
              <text x="50" y="99" fill="cyan" fillOpacity="0.7" fontSize="1.1" fontFamily="monospace" textAnchor="middle" fontWeight="bold">MAIN ENTRY GATE</text>

            </svg>

            {/* INTERACTIVE PINS PLACEMENT LAYER (HTML ABSOLUTE OVERLAY MATCHES SVG %) */}
            {machines.map((machine) => {
              const coord = machineCoords[machine.id] || { x: 50, y: 50, zone: 'Zone B-1', desc: '' };
              const isSelected = selectedMachine?.id === machine.id;

              return (
                <div
                  key={machine.id}
                  style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group"
                >
                  {/* Outer Pulsing Aura */}
                  <span className={`absolute -inset-4 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${getPulseAnimation(machine.status)}`}></span>

                  {/* Machine Pin Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectMachine(machine);
                      // Trigger subtle zoom focus helper dynamically on select
                      setPanOffset({ x: 50 - coord.x, y: 50 - coord.y });
                      setZoomLevel(1.4);
                    }}
                    className={`relative w-10 h-10 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer ${
                      isSelected 
                        ? 'bg-black border-cyan-400 scale-125 ring-4 ring-[#9cd2b8]/30 drop-shadow-[0_0_15px_rgba(156,210,184,0.73)]' 
                        : 'bg-[#141314]/95 hover:scale-110 hover:border-white'
                    } ${
                      machine.status === 'online' ? 'border-[#9cd2b8]' :
                      machine.status === 'warning' ? 'border-[#f4bc59]' : 'border-[#ffb4ab]'
                    }`}
                  >
                    {/* Ring Pulse for alerts */}
                    {(machine.status === 'offline' || machine.status === 'warning') && (
                      <span className={`absolute -inset-1 rounded-xl pointer-events-none ${machine.status === 'offline' ? 'animate-pulse bg-red-500/20' : 'animate-pulse bg-yellow-500/10'}`}></span>
                    )}

                    {/* Small visual avatar of status */}
                    <span className="text-[9px] font-bold tracking-tight text-white/50">{machine.id}</span>
                    <span className={`w-3.5 h-3.5 rounded mt-0.5 flex items-center justify-center text-[7px] font-bold ${
                      machine.status === 'online' ? 'bg-[#9cd2b8] text-[#141314]' :
                      machine.status === 'warning' ? 'bg-[#f4bc59] text-black' : 
                      machine.status === 'maintenance' ? 'bg-[#cbc3d9] text-black' : 'bg-[#ffb4ab] text-white'
                    }`}>
                      {machine.status === 'online' ? '●' : machine.status === 'warning' ? '▲' : '✖'}
                    </span>
                  </button>

                  {/* Custom blueprint-styled tooltip card */}
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-black/95 text-white p-2.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-[0_10px_25px_rgba(0,0,0,0.6)] font-mono text-[11px] leading-relaxed">
                    <div className="flex items-center gap-1.5 border-b border-white/5 pb-1 mb-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        machine.status === 'online' ? 'bg-[#9cd2b8]' :
                        machine.status === 'warning' ? 'bg-[#f4bc59]' : 'bg-[#ffb4ab]'
                      }`}></span>
                      <strong className="text-white text-xs">{machine.id}: {machine.name}</strong>
                    </div>
                    <div>Location: <span className="text-[#9cd2b8] font-bold">{coord.zone}</span></div>
                    <div>Health Coefficient: <span className="text-cyan-400 font-bold">{machine.healthScore}%</span></div>
                    <div>Current Temp: <span className="text-amber-400">{machine.temp || 45}°C</span></div>
                    <div className="text-[9px] text-[#cac5cc]/50 mt-1 uppercase italic">{coord.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Status Legend with Blueprint metrics */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 py-3 bg-[#0a0a0b]/90 border-t border-[#cac5cc]/10 text-xs gap-3 font-mono">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-[#cac5cc]/60 uppercase tracking-wider text-[10px] font-bold">STATUS LEGEND:</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#9cd2b8]"></span> Nominal (Online)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#f4bc59]"></span> Outrange Alerts (Warning)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#ffb4ab]"></span> System Halt (Offline)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#cbc3d9]"></span> Calibration (Servicing)</span>
          </div>

          <div className="text-right text-[10px] uppercase text-[#cbc3d9]/80 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Click any machine pin to view telemetry calibration metrics</span>
          </div>
        </div>
      </div>

      {/* Side Details Collapsible Calibration Panel */}
      <div className="w-full lg:w-96 flex flex-col bg-[#141314]/45 border border-[#cac5cc]/10 rounded-2xl overflow-hidden shadow-xl transition-all duration-300">
        {selectedMachine ? (
          <div className="flex-1 flex flex-col h-full">
            
            {/* Panel Title */}
            <div className="p-4 bg-gradient-to-r from-[#1c1b1d] to-[#141314] border-b border-[#cac5cc]/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#9cd2b8] tracking-widest block uppercase">Telemetry Registry Node</span>
                <h4 className="text-sm font-bold text-white uppercase">{selectedMachine.name}</h4>
                <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{getSelectedMachineZoneDesc()}</p>
              </div>
              <span className={`text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded border ${getStatusColor(selectedMachine.status)}`}>
                {selectedMachine.status}
              </span>
            </div>

            {/* Quick telemetry tab control header */}
            <div className="grid grid-cols-2 text-center text-xs border-b border-[#cac5cc]/10">
              <button 
                type="button"
                onClick={() => setActiveTab('status')}
                className={`py-2 px-4 cursor-pointer font-semibold ${activeTab === 'status' ? 'text-[#9cd2b8] border-b-2 border-[#9cd2b8] bg-[#9cd2b8]/5' : 'text-[#cac5cc]/60 hover:text-white'}`}
              >
                Status Indicators
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-4 cursor-pointer font-semibold ${activeTab === 'analytics' ? 'text-[#9cd2b8] border-b-2 border-[#9cd2b8] bg-[#9cd2b8]/5' : 'text-[#cac5cc]/60 hover:text-white'}`}
              >
                Calibration Override
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
              {activeTab === 'status' ? (
                <>
                  {/* Gauge bars */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[11px] font-mono text-[#cac5cc]/60 uppercase tracking-wider block">Live Spatial Sensors</span>
                    
                    {/* Gauge 1: Temperature */}
                    <div className="p-3 bg-[#1c1b1d] border border-white/5 rounded-xl flex items-center gap-3">
                      <Thermometer className="w-5 h-5 text-[#ffb4ab]" />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/80 font-mono text-[11px]">THERMAL THRESHOLD</span>
                          <span className={`${(selectedMachine.temp || 0) > 100 ? 'text-[#ffb4ab] font-bold' : 'text-[#cac5cc]/80 font-mono'}`}>{selectedMachine.temp || 45}°C</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#2b292b] rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(((selectedMachine.temp || 45) / 220) * 100, 100)}%` }}
                            className={`h-full rounded-full transition-all duration-300 ${
                              (selectedMachine.temp || 0) > 120 ? 'bg-[#ffb4ab]' :
                              (selectedMachine.temp || 0) > 80 ? 'bg-[#f4bc59]' : 'bg-[#9cd2b8]'
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Gauge 2: Vibration */}
                    <div className="p-3 bg-[#1c1b1d] border border-white/5 rounded-xl flex items-center gap-3">
                      <Activity className="w-5 h-5 text-[#b0cbd8]" />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/80 font-mono text-[11px]">VIBRATION FREQUENCY</span>
                          <span className="text-[#cac5cc]/80 font-mono">{selectedMachine.vibration || 12} mm/s</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#2b292b] rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(((selectedMachine.vibration || 12) / 60) * 100, 100)}%` }}
                            className={`h-full rounded-full transition-all duration-300 ${
                              (selectedMachine.vibration || 0) > 30 ? 'bg-[#ffb4ab]' : 'bg-[#9cd2b8]'
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Gauge 3: Pressure */}
                    <div className="p-3 bg-[#1c1b1d] border border-white/5 rounded-xl flex items-center gap-3">
                      <Gauge className="w-5 h-5 text-[#cbc3d9]" />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/80 font-mono text-[11px]">HYDRAULIC CRIMP PRESSURE</span>
                          <span className="text-[#cac5cc]/80 font-mono">{selectedMachine.pressure || 0} psi</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#2b292b] rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(((selectedMachine.pressure || 0) / 300) * 100, 100)}%` }}
                            className="h-full rounded-full bg-[#cb92fc] transition-all duration-300"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* General Stats summary */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col">
                      <span className="text-[10px] text-[#cac5cc]/60 uppercase font-mono font-semibold">Uptime Record</span>
                      <span className="text-lg font-bold text-white font-mono mt-0.5">{selectedMachine.uptimeHours} hrs</span>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col">
                      <span className="text-[10px] text-[#cac5cc]/60 uppercase font-mono font-semibold">Health Coefficient</span>
                      <span className={`text-lg font-bold font-mono mt-0.5 ${
                        selectedMachine.healthScore > 90 ? 'text-[#9cd2b8]' :
                        selectedMachine.healthScore > 75 ? 'text-[#f4bc59]' : 'text-[#ffb4ab]'
                      }`}>{selectedMachine.healthScore}%</span>
                    </div>
                  </div>

                  <div className="border-t border-[#cac5cc]/10 my-1"></div>

                  {/* Operational Diagnostics */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-mono text-[#cac5cc]/60 uppercase tracking-wider block">Operational Diagnostics</span>
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono flex flex-col gap-1.5 text-white/70">
                      <div className="flex justify-between">
                        <span>Calibration protocol:</span>
                        <span className="text-white font-bold">MIL-STD-182C Compliance</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last maintenance sweep:</span>
                        <span className="text-white font-bold">{selectedMachine.lastServiceDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime continuity rating:</span>
                        <span className="text-[#9cd2b8] font-bold">99.8% Stable</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Status interactive controllers */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[11px] font-mono text-[#cac5cc]/60 uppercase tracking-wider block">Change Node Registry</span>

                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-white/80">Command Status Mode</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => onUpdateMachineStatus(selectedMachine.id, { status: 'online' })}
                          className={`py-2 px-3 text-xs rounded-xl flex items-center justify-center gap-2 font-semibold border cursor-pointer transition ${
                            selectedMachine.status === 'online' 
                              ? 'bg-[#9cd2b8]/10 text-[#9cd2b8] border-[#9cd2b8]' 
                              : 'bg-[#1c1b1d] text-[#cac5cc]/70 border-white/5 hover:text-white'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Set Nominal
                        </button>

                        <button
                          type="button"
                          onClick={() => onUpdateMachineStatus(selectedMachine.id, { status: 'warning' })}
                          className={`py-2 px-3 text-xs rounded-xl flex items-center justify-center gap-2 font-semibold border cursor-pointer transition ${
                            selectedMachine.status === 'warning' 
                              ? 'bg-[#f4bc59]/10 text-[#f4bc59] border-[#f4bc59]' 
                              : 'bg-[#1c1b1d] text-[#cac5cc]/70 border-white/5 hover:text-white'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Set Warning
                        </button>

                        <button
                          type="button"
                          onClick={() => onUpdateMachineStatus(selectedMachine.id, { status: 'offline' })}
                          className={`py-2 px-3 text-xs rounded-xl flex items-center justify-center gap-2 font-semibold border cursor-pointer transition ${
                            selectedMachine.status === 'offline' 
                              ? 'bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]' 
                              : 'bg-[#1c1b1d] text-[#cac5cc]/70 border-white/5 hover:text-white'
                          }`}
                        >
                          <PowerOff className="w-3.5 h-3.5" />
                          Emergency stop
                        </button>

                        <button
                          type="button"
                          onClick={() => onUpdateMachineStatus(selectedMachine.id, { status: 'maintenance' })}
                          className={`py-2 px-3 text-xs rounded-xl flex items-center justify-center gap-2 font-semibold border cursor-pointer transition ${
                            selectedMachine.status === 'maintenance' 
                              ? 'bg-[#cbc3d9]/20 text-[#cbc3d9] border-[#cbc3d9]' 
                              : 'bg-[#1c1b1d] text-[#cac5cc]/70 border-white/5 hover:text-white'
                          }`}
                        >
                          <Settings className="w-3.5 h-3.5" />
                          Toggle Servicing
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-[#cac5cc]/10 my-1"></div>

                    {/* Sensor parameters simulators */}
                    <div className="flex flex-col gap-3">
                      <span className="text-xs text-white/80">Telemetric Diagnostics Override</span>

                      <div>
                        <div className="flex justify-between text-[11px] text-[#cac5cc]/70 mb-1">
                          <span>Temperature Controller (°C)</span>
                          <span className="font-mono text-white">{selectedMachine.temp || 45}°C</span>
                        </div>
                        <input 
                          type="range" 
                          min="30" 
                          max="220" 
                          value={selectedMachine.temp || 45}
                          onChange={(e) => onUpdateMachineStatus(selectedMachine.id, { temp: Number(e.target.value) })}
                          className="w-full h-1 bg-[#2b292b] rounded-lg cursor-pointer accent-[#9cd2b8]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-[#cac5cc]/70 mb-1">
                          <span>Vibration Spectrum (mm/s)</span>
                          <span className="font-mono text-white">{selectedMachine.vibration || 12} mm/s</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="60" 
                          value={selectedMachine.vibration || 12}
                          onChange={(e) => onUpdateMachineStatus(selectedMachine.id, { vibration: Number(e.target.value) })}
                          className="w-full h-1 bg-[#2b292b] rounded-lg cursor-pointer accent-[#b0cbd8]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-[#cac5cc]/70 mb-1">
                          <span>Sensor Health Index (%)</span>
                          <span className="font-mono text-white">{selectedMachine.healthScore}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={selectedMachine.healthScore}
                          onChange={(e) => onUpdateMachineStatus(selectedMachine.id, { healthScore: Number(e.target.value) })}
                          className="w-full h-1 bg-[#2b292b] rounded-lg cursor-pointer accent-[#cbc3d9]"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#cac5cc]/50">
            <Cpu className="w-10 h-10 mb-3 text-[#cac5cc]/30 animate-pulse" />
            <h4 className="text-sm font-semibold text-white/80">No Node Selected</h4>
            <p className="text-xs max-w-[200px] mt-1 text-white/50">Click any machine marker point on the floor map to analyze telemetry metrics.</p>
          </div>
        )}
      </div>
    </div>
  );
}
