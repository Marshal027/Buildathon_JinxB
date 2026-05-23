import React, { useState } from 'react';
import { 
  Ticket, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckSquare, 
  Square,
  Wrench,
  UserCheck,
  CheckCircle,
  TrendingDown,
  Info,
  Sliders
} from 'lucide-react';
import TelemetrySnapshot from '../components/TelemetrySnapshot.jsx';

export default function TicketsPage({ 
  tickets, 
  onUpdateTicket,
  onAddTicket 
}) {
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id || null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState('complex');
  const [newMachineId, setNewMachineId] = useState('M-402');

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0] || null;

  const handleToggleChecklist = (ticketId, itemIdx) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || !ticket.checklist) return;

    const nextChecklist = [...ticket.checklist];
    nextChecklist[itemIdx].done = !nextChecklist[itemIdx].done;

    onUpdateTicket(ticketId, { checklist: nextChecklist });
  };

  const handleResolveTicket = (ticketId) => {
    onUpdateTicket(ticketId, { status: 'resolved', resolvedAt: new Date().toISOString() });
  };

  const handleAssignTicket = (ticketId) => {
    onUpdateTicket(ticketId, { assignedTo: 'Supervisor Miller', status: 'in_progress' });
  };

  const handleIncreaseSeverity = (ticketId) => {
    onUpdateTicket(ticketId, { severity: 'critical' });
  };

  const handleCreateTicketSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    onAddTicket({
      id: `TKT-${Math.floor(8800 + Math.random() * 1100)}`,
      machineId: newMachineId,
      machineName: newMachineId === 'M-402' ? 'CNC Axis 4' : 'Conveyor Beta Main Motor',
      reportedBy: 'Control Desk Supervisor',
      issueDescription: `${newTitle}: ${newDesc}`,
      severity: newSeverity,
      status: 'open',
      createdAt: new Date().toISOString(),
      checklist: [
        { text: 'Diagnostics review inspection', done: false },
        { text: 'Mechanical alignment verify', done: false }
      ]
    });

    setNewTitle('');
    setNewDesc('');
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'critical': return 'bg-[#93000a]/15 text-[#ffb4ab] border-[#ffb4ab]/30';
      case 'complex': return 'bg-[#f4bc59]/10 text-[#f4bc59] border-[#f4bc59]/30';
      case 'low': return 'bg-[#9cd2b8]/10 text-[#9cd2b8] border-[#9cd2b8]/30';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full p-4 lg:p-6 overflow-hidden max-w-[1600px] mx-auto w-full">
      
      {/* LEFT COLUMN: Active Tickets list */}
      <div className="flex-1 flex flex-col bg-[#141314]/50 border border-[#ffffff]/10 rounded-2xl overflow-hidden">
        
        {/* Ticket Header lists */}
        <div className="p-4 bg-gradient-to-r from-[#201f21] to-[#242325] border-b border-[#ffffff]/10 flex items-center justify-between select-none">
          <div>
            <h3 className="text-sm font-semibold text-white uppercase flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#9cd2b8]" />
              Active System Tickets Registry
            </h3>
            <p className="text-[11px] text-[#ffffff]/60">Fault logs triggered by diagnostic watchdogs and staff</p>
          </div>
          <span className="text-[11px] font-mono text-white/50 bg-[#141314]/50 px-2 py-1 rounded border border-[#ffffff]/10">
            {tickets.length} Active Records
          </span>
        </div>

        {/* Tickets Scroll list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {tickets.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 text-xs">No tickets currently filed. Everything normal.</div>
          ) : (
            tickets.map((t) => {
              const worksCount = t.checklist?.length || 0;
              const worksDone = t.checklist?.filter(item => item.done).length || 0;

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    selectedTicketId === t.id 
                      ? 'bg-[#1c1b1d] border-cyan-400/40 drop-shadow-[0_0_15px_rgba(34,211,238,0.05)]' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 max-w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-[#9cd2b8] font-bold">{t.id}</span>
                      <span className={`text-[9px] uppercase font-mono tracking-widest px-2 py-0.5 rounded border ${getSeverityBadge(t.severity)}`}>
                        {t.severity}
                      </span>
                    </div>
                    <span className={`text-[10px] uppercase font-mono font-semibold ${
                      t.status === 'resolved' ? 'text-[#9cd2b8]' : 'text-cyan-400'
                    }`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-2 leading-snug truncate uppercase">{t.machineName} Directive</h4>
                  <p className="text-[11px] text-[#ffffff]/75 line-clamp-2 mt-1 leading-relaxed font-sans">{t.issueDescription}</p>

                  <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-white/5 text-[10px] font-mono text-[#ffffff]/50">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#ffffff]/40" />
                      <span>{t.assignedTo || 'Unassigned'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-[#ffffff]/40" />
                      <span>Checklist: {worksDone}/{worksCount}</span>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Ticket inspect details panel drawers */}
      <div className="w-full lg:w-110 flex flex-col gap-5 select-none overflow-y-auto shrink-0 pb-4 pr-1">
        
        {/* Ticket Details summary inspector card */}
        {selectedTicket ? (
          <div className="p-5 bg-[#141314]/50 border border-[#ffffff]/10 rounded-2xl flex flex-col gap-4">
            <div className="flex justify-between items-start border-b border-[#ffffff]/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#9cd2b8] block tracking-wider font-semibold">TICKET LOGS DETAILS</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{selectedTicket.id}: {selectedTicket.machineName}</h3>
              </div>
              <span className={`text-[9px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded border ${getSeverityBadge(selectedTicket.severity)}`}>
                {selectedTicket.severity}
              </span>
            </div>

            {/* AI Diagnostics Assessment Box */}
            {selectedTicket.aiAssessment && (
              <div className="p-3.5 rounded-xl bg-cyan-950/25 border border-cyan-800/35 flex flex-col gap-1 text-[11px] leading-relaxed">
                <span className="font-mono text-[9px] font-bold text-cyan-400 tracking-wider uppercase">Auto-Analysis Assessment</span>
                <p className="text-white/80">{selectedTicket.aiAssessment}</p>
              </div>
            )}

            {/* Checklist inspector checkbox */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-mono text-[#ffffff]/60 uppercase tracking-wider block">Assurance Checklist</span>
              <div className="flex flex-col gap-2 mt-1">
                {selectedTicket.checklist?.length === 0 ? (
                  <span className="text-xs text-neutral-500 font-mono">No checklist needed.</span>
                ) : (
                  selectedTicket.checklist?.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleToggleChecklist(selectedTicket.id, idx)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all flex items-center gap-3 w-full text-left cursor-pointer text-xs"
                    >
                      {item.done ? (
                        <CheckCircle className="w-4 h-4 text-[#9cd2b8] shrink-0 fill-[#9cd2b8]/10" />
                      ) : (
                        <div className="w-4 h-4 rounded border border-[#ffffff]/40 shrink-0" />
                      )}
                      <span className={`transition-all ${item.done ? 'line-through text-white/40' : 'text-white'}`}>
                        {item.text}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-[#ffffff]/10 my-1"></div>

            {/* Interactive Actions button drawers */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] font-mono text-[#ffffff]/60 uppercase tracking-wider block">Telemetric Control Action</span>
              
              <div className="grid grid-cols-2 gap-2 mt-1">
                {selectedTicket.status !== 'resolved' && (
                  <>
                    <button
                      onClick={() => handleAssignTicket(selectedTicket.id)}
                      className="py-2 px-3 text-xs rounded-xl flex items-center justify-center gap-2 font-bold bg-white/5 border border-white/5 hover:bg-white/10 text-white cursor-pointer active:scale-95 transition-all"
                    >
                      <UserCheck className="w-4 h-4" />
                      Assign to Self
                    </button>

                    <button
                      onClick={() => handleIncreaseSeverity(selectedTicket.id)}
                      className="py-2 px-3 text-xs rounded-xl flex items-center justify-center gap-2 font-bold bg-white/5 border border-white/5 hover:bg-white/10 text-[#ffb4ab] cursor-pointer active:scale-95 transition-all"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Escalate Critical
                    </button>

                    <button
                      onClick={() => handleResolveTicket(selectedTicket.id)}
                      className="py-2 px-4 rounded-xl font-bold bg-[#9cd2b8] text-black text-xs cursor-pointer hover:scale-105 active:scale-95 col-span-2 flex items-center justify-center gap-2 transition-all mt-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Resolve Ticket Completed
                    </button>
                  </>
                )}
                {selectedTicket.status === 'resolved' && (
                  <div className="p-3 bg-[#265a46]/10 border border-[#9cd2b8]/20 text-[#9cd2b8] rounded-xl text-center text-xs font-semibold col-span-2 flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Resolved on {selectedTicket.resolvedAt ? new Date(selectedTicket.resolvedAt).toLocaleTimeString() : 'Just now'}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-[#141314]/50 border border-[#ffffff]/10 rounded-2xl flex flex-col items-center justify-center text-center text-[#ffffff]/50">
            <Ticket className="w-10 h-10 text-neutral-600 mb-2 animate-spin" style={{ animationDuration: '4s' }} />
            <h4 className="text-sm font-semibold text-white">No Tickets Active</h4>
          </div>
        )}

        {/* Create Manual Ticket form drawer */}
        <div className="p-5 bg-[#141314]/50 border border-[#ffffff]/10 rounded-2xl flex flex-col gap-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">File Manual Telemetric Defect</span>
          
          <form onSubmit={handleCreateTicketSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] uppercase font-mono tracking-wider text-[#ffffff]/60 mb-1 block">Defect Name Title</label>
              <input 
                type="text"
                placeholder="e.g. Unusual belt vibration"
                className="w-full text-xs p-2.5 rounded-lg bg-black/45 border border-[#ffffff]/10 focus:outline-none focus:border-[#9cd2b8] text-white placeholder-neutral-500"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider text-[#ffffff]/60 mb-1 block">Target Machine</label>
                <select 
                  className="w-full text-xs p-2.5 rounded-lg bg-[#242325] border border-[#ffffff]/10 focus:outline-none text-[#ffffff]"
                  value={newMachineId}
                  onChange={(e) => setNewMachineId(e.target.value)}
                >
                  <option value="M-402">M-402 CNC Axis 4</option>
                  <option value="T-42">T-42 Conveyor Beta</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider text-[#ffffff]/60 mb-1 block">Defect Priority</label>
                <select 
                  className="w-full text-xs p-2.5 rounded-lg bg-[#242325] border border-[#ffffff]/10 focus:outline-none text-[#ffffff]"
                  value={newSeverity || 'complex'}
                  onChange={(e) => setNewSeverity(e.target.value)}
                >
                  <option value="low">Minor Routine</option>
                  <option value="complex">Supervisor Warning</option>
                  <option value="critical">Critical STOP Action</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono tracking-wider text-[#ffffff]/60 mb-1 block">Detailed Symptoms Description</label>
              <textarea 
                placeholder="Describe diagnostic parameters noticed..."
                className="w-full text-xs p-2.5 rounded-lg bg-black/45 border border-[#ffffff]/10 focus:outline-none focus:border-[#9cd2b8] text-white placeholder-neutral-500 resize-none h-16"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs cursor-pointer text-center select-none active:scale-95 border border-white/5 transition-all flex items-center justify-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Raise Ticket</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
