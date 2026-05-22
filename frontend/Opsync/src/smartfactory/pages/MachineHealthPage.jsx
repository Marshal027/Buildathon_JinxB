import React, { useState } from 'react';
import { Cpu, Search, Info } from 'lucide-react';
import MachineMap from '../components/MachineMap.jsx';

export default function MachineHealthPage({ 
  machines, 
  selectedMachine, 
  onSelectMachine,
  onUpdateMachineStatus 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredMachines = machines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col gap-5 h-full p-4 lg:p-6 overflow-hidden max-w-[1600px] mx-auto w-full">
      
      {/* Top action header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#9cd2b8]" />
            Machine Telemetry Controller
          </h2>
          <p className="text-xs text-[#cac5cc]/60 mt-0.5">Physical telemetry map mapped with live coordinate status trackers</p>
        </div>

        {/* Filters and search blocks */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#cac5cc]/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search assets by ID / Name..."
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#9cd2b8] w-48 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Quick status selector */}
          <div className="flex items-center gap-1.5 bg-[#141314]/80 border border-white/5 p-1 rounded-lg">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-[#cac5cc] px-1 cursor-pointer focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="online">Nominal</option>
              <option value="warning">Warning Thresholds</option>
              <option value="offline">Offline / Alarm</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

        </div>
      </div>

      {/* Info indicator */}
      <div className="p-3 bg-cyan-950/20 border border-cyan-800/30 rounded-xl text-[11px] text-[#b0cbd8] flex items-start gap-2.5 leading-relaxed">
        <Info className="w-4 h-4 text-[#b0cbd8] shrink-0 mt-0.5" />
        <p>
          <strong>Haptic Feedback Loop Active:</strong> You can adjust sensors and change status on the selected machine in the side details panel and see standard changes propagated dynamically across the active factory board registry.
        </p>
      </div>

      {/* Embedded Floor Map Layout */}
      <div className="flex-1 min-h-0">
        <MachineMap 
          machines={filteredMachines}
          selectedMachine={selectedMachine}
          onSelectMachine={onSelectMachine}
          onUpdateMachineStatus={onUpdateMachineStatus}
        />
      </div>

    </div>
  );
}
