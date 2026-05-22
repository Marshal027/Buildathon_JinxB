import React from 'react';
import { 
  BarChart2, 
  Cpu, 
  HelpCircle, 
  MessageSquare, 
  Ticket, 
  Users, 
  Settings as SettingsIcon, 
  Radio, 
  LogOut, 
  ShieldAlert,
  Smartphone,
  Mail,
  FileEdit
} from 'lucide-react';

export default function SideNavBar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onChangeUserRole, 
  onTriggerSOS,
  wsConnected 
}) {
  return (
    <nav className="hidden md:flex flex-col py-3 px-2.5 gap-2 h-screen w-52 fixed left-0 top-0 bg-[#141314]/90 backdrop-blur-[20px] border-r border-[#9cd2b8]/20 shadow-[0_0_30px_rgba(0,0,0,0.2)] z-50">
      
      {/* Brand Header */}
      <div className="flex items-center gap-1.5 px-1 select-none">
        <Radio className="w-3.5 h-3.5 text-[#9cd2b8] shrink-0" />
        <span className="text-xs font-bold text-[#9cd2b8] tracking-tight">OppSync</span>
      </div>

      {/* Main Nav */}
      <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 active:scale-95 text-left ${
            activeTab === 'dashboard'
              ? 'text-[#9cd2b8] bg-[#9cd2b8]/15 border-r-2 border-[#9cd2b8] font-bold shadow-[0_0_15px_rgba(156,210,184,0.1)]'
              : 'text-[#ffffff]/70 hover:text-white hover:bg-[#9cd2b8]/5'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-inherit" />
          Manager Dashboard
        </button>

        <button
          onClick={() => setActiveTab('machine-health')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 active:scale-95 text-left ${
            activeTab === 'machine-health'
              ? 'text-[#9cd2b8] bg-[#9cd2b8]/15 border-r-2 border-[#9cd2b8] font-bold shadow-[0_0_15px_rgba(156,210,184,0.1)]'
              : 'text-[#ffffff]/70 hover:text-white hover:bg-[#9cd2b8]/5'
          }`}
        >
          <Cpu className="w-4 h-4 text-inherit" />
          Machine Health Layout
        </button>

        {currentUser.role === 'engineer' && (
          <button
            onClick={() => setActiveTab('maintenance-ai')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 active:scale-95 text-left ${
              activeTab === 'maintenance-ai'
                ? 'text-[#9cd2b8] bg-[#9cd2b8]/15 border-r-2 border-[#9cd2b8] font-bold shadow-[0_0_15px_rgba(156,210,184,0.1)]'
                : 'text-[#ffffff]/70 hover:text-white hover:bg-[#9cd2b8]/5'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-inherit" />
            Maintenance AI Chat
          </button>
        )}

        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 active:scale-95 text-left ${
            activeTab === 'tickets'
              ? 'text-[#9cd2b8] bg-[#9cd2b8]/15 border-r-2 border-[#9cd2b8] font-bold shadow-[0_0_15px_rgba(156,210,184,0.1)]'
              : 'text-[#ffffff]/70 hover:text-white hover:bg-[#9cd2b8]/5'
          }`}
        >
          <Ticket className="w-4 h-4 text-inherit" />
          Tickets Explorer
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 text-[#ffb4ab]">
            Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab('personnel')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 active:scale-95 text-left ${
            activeTab === 'personnel'
              ? 'text-[#9cd2b8] bg-[#9cd2b8]/15 border-r-2 border-[#9cd2b8] font-bold shadow-[0_0_15px_rgba(156,210,184,0.1)]'
              : 'text-[#ffffff]/70 hover:text-white hover:bg-[#9cd2b8]/5'
          }`}
        >
          <Users className="w-4 h-4 text-inherit" />
          Personnel Roster
        </button>

        <button
          onClick={() => setActiveTab('mail-system')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 active:scale-95 text-left ${
            activeTab === 'mail-system'
              ? 'text-[#9cd2b8] bg-[#9cd2b8]/15 border-r-2 border-[#9cd2b8] font-bold shadow-[0_0_15px_rgba(156,210,184,0.1)]'
              : 'text-[#ffffff]/70 hover:text-white hover:bg-[#9cd2b8]/5'
          }`}
        >
          <Mail className="w-4 h-4 text-inherit" />
          Mail System
        </button>

        {currentUser.role === 'manager' && (
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 active:scale-95 text-left ${
              activeTab === 'editor'
                ? 'text-[#9cd2b8] bg-[#9cd2b8]/15 border-r-2 border-[#9cd2b8] font-bold shadow-[0_0_15px_rgba(156,210,184,0.1)]'
                : 'text-[#ffffff]/70 hover:text-white hover:bg-[#9cd2b8]/5'
            }`}
          >
            <FileEdit className="w-4 h-4 text-inherit" />
            Document Editor
          </button>
        )}

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 active:scale-95 text-left ${
            activeTab === 'settings'
              ? 'text-[#9cd2b8] bg-[#9cd2b8]/15 border-r-2 border-[#9cd2b8] font-bold shadow-[0_0_15px_rgba(156,210,184,0.1)]'
              : 'text-[#ffffff]/70 hover:text-white hover:bg-[#9cd2b8]/5'
          }`}
        >
          <SettingsIcon className="w-4 h-4 text-inherit" />
          System Settings
        </button>
      </div>

      {/* Role Picker Drawer */}
      <div className="p-2.5 rounded-xl bg-[#1c1b1d] border border-[#ffffff]/10 flex flex-col gap-1.5">
        <span className="text-[9px] uppercase tracking-wider text-[#ffffff]/50">Simulation Role</span>
        <div className="grid grid-cols-2 gap-1 text-[11px] text-center">
          <button 
            onClick={() => onChangeUserRole('manager')}
            className={`py-1 rounded cursor-pointer ${currentUser.role === 'manager' ? 'bg-[#9cd2b8] text-black font-semibold' : 'bg-[#2b292b]/50 text-white'}`}
          >
            Manager
          </button>
          <button 
            onClick={() => onChangeUserRole('engineer')}
            className={`py-1 rounded cursor-pointer ${currentUser.role === 'engineer' ? 'bg-[#b0cbd8] text-black font-semibold' : 'bg-[#2b292b]/50 text-white'}`}
          >
            Engineer
          </button>
        </div>
      </div>

      {/* Trigger SOS button */}
      <button 
        onClick={onTriggerSOS}
        className="w-full py-2.5 px-3 rounded-lg bg-[#93000a]/20 hover:bg-[#93000a]/40 border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs font-semibold hover:border-[#ffb4ab]/50 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <ShieldAlert className="w-4 h-4 animate-bounce" />
        System SOS Alarm
      </button>

      {/* Footer Nav */}
      <div className="mt-auto pt-3 border-t border-[#9cd2b8]/15 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[10px] text-[#ffffff]/60 pl-2 select-none">
          <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-[#9cd2b8]' : 'bg-[#ffb4ab]'}`}></span>
          <span>{wsConnected ? 'Telemetry Feed Active' : 'Offline Stream'}</span>
        </div>

        <div className="flex items-center gap-2 p-2 bg-[#201f21] rounded-xl border border-white/5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#265a46] to-[#544e61] flex items-center justify-center text-[#9acfb6] text-[10px] font-bold uppercase select-none shrink-0">
            {currentUser.name.slice(0, 2)}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[11px] font-semibold text-white truncate">{currentUser.name}</span>
            <span className="text-[9px] text-[#9cd2b8] capitalize">{currentUser.role} Account</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
