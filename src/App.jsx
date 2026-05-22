import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart2, 
  Cpu, 
  MessageSquare, 
  Ticket, 
  Users, 
  Settings as SettingsIcon, 
  Smartphone,
  ShieldAlert,
  Bell,
  Menu,
  X
} from 'lucide-react';
import SideNavBar from './components/SideNavBar.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MachineHealthPage from './pages/MachineHealthPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import TicketsPage from './pages/TicketsPage.jsx';
import PersonnelPage from './pages/PersonnelPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState({ id: 'Admin-1', name: 'Admin Supervisor', role: 'manager' });
  const [wsConnected, setWsConnected] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data State
  const [machines, setMachines] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [workerLocations, setWorkerLocations] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  
  // Dashboard Metrics
  const [summary, setSummary] = useState({
    productivity: 94,
    personnelActive: 128,
    machinesOnline: 6,
    machinesTotal: 8,
    openTickets: 3,
    criticalTickets: 1
  });

  // Active Critical SOS Alerts State
  const [activeSOS, setActiveSOS] = useState(null);

  // WebSocket Ref
  const wsRef = useRef(null);

  // Fetch initial seed parameters from Express
  const fetchAllData = async () => {
    try {
      const [machinesRes, ticketsRes, attendanceRes, summaryRes, locationsRes] = await Promise.all([
        fetch('/api/machines').then(r => r.json()),
        fetch('/api/tickets').then(r => r.json()),
        fetch('/api/attendance').then(r => r.json()),
        fetch('/api/dashboard/summary').then(r => r.json()),
        fetch('/api/workers/locations').then(r => r.json())
      ]);

      setMachines(machinesRes);
      setTickets(ticketsRes);
      setAttendance(attendanceRes);
      setLiveAlerts(summaryRes.liveAlerts);
      setSummary(summaryRes.summary);
      setWorkerLocations(locationsRes);
    } catch (err) {
      console.error('Failure reloading database state:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Periodically fetch dashboard summary updates
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Connect WebSocket with exponential fail reconnect
  useEffect(() => {
    let recTimeout;
    
    const connectWS = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/factory/`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        console.log('Real-time WS Telemetry engine established.');
      };

      ws.onclose = () => {
        setWsConnected(false);
        console.log('Telemetry link closed, attempting reconnect sequence...');
        recTimeout = setTimeout(connectWS, 4000);
      };

      ws.onmessage = (event) => {
        try {
          const signal = JSON.parse(event.data);
          
          switch (signal.type) {
            case 'brand.status.update':
            case 'machine.status.update':
              setMachines(prev => prev.map(m => m.id === signal.payload.id ? signal.payload : m));
              break;
            case 'worker.location.update':
              setWorkerLocations(prev => {
                const filtered = prev.filter(w => w.id !== signal.payload.workerId);
                return [...filtered, { id: signal.payload.workerId, ...signal.payload }];
              });
              break;
            case 'ticket.created':
              setTickets(prev => {
                if (prev.some(t => t.id === signal.payload.id)) return prev;
                return [signal.payload, ...prev];
              });
              // Append to logs
              setLiveAlerts(prev => [
                {
                  id: Math.random().toString(),
                  severity: signal.payload.severity === 'critical' ? 'critical' : 'warning',
                  title: 'Defect Ticket Registered',
                  message: `${signal.payload.id} raised on ${signal.payload.machineName}. Severity: ${signal.payload.severity}`,
                  timestamp: 'Just now'
                },
                ...prev
              ]);
              break;
            case 'alert.sos':
              setActiveSOS({
                name: signal.payload.name,
                id: signal.payload.workerId,
                lat: signal.payload.lat,
                lng: signal.payload.lng
              });
              break;
            case 'alert.broadcast':
              setLiveAlerts(prev => [
                {
                  id: Math.random().toString(),
                  severity: 'critical',
                  title: 'Supervisory broadcast',
                  message: signal.payload.message,
                  timestamp: 'Just now'
                },
                ...prev
              ]);
              break;
            case 'attendance.update':
              fetchAllData();
              break;
          }
        } catch (e) {
          console.error('Error handling WebSocket event packet:', e);
        }
      };
    };

    connectWS();
    return () => {
      clearTimeout(recTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Handlers for Child Pages
  const handleChangeUserRole = (role) => {
    if (role === 'engineer') {
      setCurrentUser({ id: 'Eng-03', name: 'Sarah Miller', role: 'engineer' });
      setActiveTab('machine-health');
    } else {
      setCurrentUser({ id: 'Admin-1', name: 'Admin Supervisor', role: 'manager' });
      setActiveTab('dashboard');
    }
  };

  const handleUpdateMachineStatus = async (id, update) => {
    try {
      const res = await fetch(`/api/machines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      const data = await res.json();
      setMachines(prev => prev.map(m => m.id === id ? data : m));
    } catch (err) {
      console.error('Failed to update machine telemetry metrics:', err);
    }
  };

  const handleUpdateTicket = async (id, update) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      const data = await res.json();
      setTickets(prev => prev.map(t => t.id === id ? data : t));
    } catch (err) {
      console.error('Failed to update ticket state:', err);
    }
  };

  const handleAddTicket = async (newTkt) => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTkt)
      });
      const data = await res.json();
      setTickets(prev => [data, ...prev]);
    } catch (err) {
      console.error('Failed to register manual ticket defect:', err);
    }
  };

  const handleBroadcast = async (msg, priority) => {
    try {
      await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, priority, sentBy: currentUser.name })
      });
      fetchAllData();
    } catch (err) {
      console.error('Failed to broadcast visual supervisor alert:', err);
    }
  };

  const handleWorkerSOS = async (lat, lng) => {
    try {
      await fetch('/api/alerts/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: currentUser.id, name: currentUser.name, lat, lng })
      });
    } catch (err) {
      console.error('SOS dispatch api fault:', err);
    }
  };

  const handleTriggerGeneralSOS = () => {
    handleWorkerSOS(37.7750, -122.4195);
  };

  // Chat agent submission using Gemini
  const handleBotSubmitMessage = async (message, image) => {
    // Optimistic addition
    const userMsg = {
      id: Math.random().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString(),
      image
    };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, image, sessionId: 'session-core' })
      });
      const data = await res.json();
      
      const aiMsg = {
        id: Math.random().toString(),
        role: 'assistant',
        content: data.response_text,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, aiMsg]);

      // If a ticket was automatically spawned, fetch database update
      if (data.ticket_id) {
        fetchAllData();
      }
    } catch (e) {
      console.error('Chat error:', e);
    }
  };

  const handleClearSession = async () => {
    setChatMessages([]);
  };

  // Selected Machine state pointer shared globally
  const [selectedMachine, setSelectedMachine] = useState(null);

  // Layout routing switcher
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage 
            summary={summary}
            machines={machines}
            liveAlerts={liveAlerts}
            currentUser={currentUser}
            onBroadcast={handleBroadcast}
            onSelectMachine={(m) => {
              setSelectedMachine(m);
              setActiveTab('machine-health');
            }}
            setActiveTab={setActiveTab}
          />
        );
      case 'machine-health':
        return (
          <MachineHealthPage 
            machines={machines}
            selectedMachine={selectedMachine}
            onSelectMachine={setSelectedMachine}
            onUpdateMachineStatus={handleUpdateMachineStatus}
          />
        );
      case 'maintenance-ai':
        return (
          <ChatPage 
            messages={chatMessages}
            onSubmitMessage={handleBotSubmitMessage}
            onClearSession={handleClearSession}
            machines={machines}
          />
        );
      case 'tickets':
        return (
          <TicketsPage 
            tickets={tickets}
            onUpdateTicket={handleUpdateTicket}
            onAddTicket={handleAddTicket}
          />
        );
      case 'personnel':
        return (
          <PersonnelPage 
            attendance={attendance}
            workerLocations={workerLocations}
          />
        );
      case 'settings':
        return <SettingsPage />;
      default:
        return <div className="text-white text-center p-10 font-bold">Workspace View Error</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#cac5cc] font-sans flex relative select-none">
      
      {/* Real-time top screen alarm distress banner */}
      {activeSOS && (
        <div className="fixed top-0 inset-x-0 bg-[#ba1a1a] text-white py-3.5 px-6 flex items-center justify-between z-[999] shadow-2xl border-b border-[#ffb4ab]/30 animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-white" />
            <span className="text-xs md:text-sm font-bold tracking-tight uppercase">
              ⚠️ GEOFENCED CRITICAL SOS DETECTED FROM OPERATOR (Name: <strong className="underline text-yellow-300 font-bold">{activeSOS.name}</strong>, ID: {activeSOS.id}). Coords: {activeSOS.lat.toFixed(6)}, {activeSOS.lng.toFixed(6)}. DISPATCH MEDICAL SECURITY IMMEDIATELY.
            </span>
          </div>
          <button 
            onClick={() => setActiveSOS(null)}
            className="text-xs font-mono font-bold bg-white/20 hover:bg-white/30 text-white rounded cursor-pointer px-2.5 py-1"
          >
            Acknowledge Alarm
          </button>
        </div>
      )}

      {/* Main Navigation Sidebar desktop */}
      <div className={`${activeSOS ? 'pt-14' : ''} hidden md:block`}>
        <SideNavBar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onChangeUserRole={handleChangeUserRole}
          onTriggerSOS={handleTriggerGeneralSOS}
          wsConnected={wsConnected}
        />
      </div>

      {/* Responsive mobile header bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#141314] border-b border-white/5 flex items-center justify-between px-4 z-[100]">
        <h1 className="text-[#9cd2b8] font-bold text-sm tracking-tight">SmartFactory 360°</h1>
        <button 
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="p-1.5 text-[#cac5cc] hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer routing overlay navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-[#0a0a0b]/95 z-[90] pt-16 px-4 flex flex-col gap-2">
          <button 
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className={`py-2.5 text-left text-sm ${activeTab === 'dashboard' ? 'text-[#9cd2b8] font-bold' : ''}`}
          >
            Manager Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('machine-health'); setMobileMenuOpen(false); }}
            className={`py-2.5 text-left text-sm ${activeTab === 'machine-health' ? 'text-[#9cd2b8] font-bold' : ''}`}
          >
            Machine Health Layout
          </button>
          <button 
            onClick={() => { setActiveTab('maintenance-ai'); setMobileMenuOpen(false); }}
            className={`py-2.5 text-left text-sm ${activeTab === 'maintenance-ai' ? 'text-[#9cd2b8] font-bold' : ''}`}
          >
            Maintenance AI Chat
          </button>
          <button 
            onClick={() => { setActiveTab('tickets'); setMobileMenuOpen(false); }}
            className={`py-2.5 text-left text-sm ${activeTab === 'tickets' ? 'text-[#9cd2b8] font-bold' : ''}`}
          >
            Tickets Explorer
          </button>
          <button 
            onClick={() => { setActiveTab('personnel'); setMobileMenuOpen(false); }}
            className={`py-2.5 text-left text-sm ${activeTab === 'personnel' ? 'text-[#9cd2b8] font-bold' : ''}`}
          >
            Personnel Roster
          </button>
          <button 
            onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
            className={`py-2.5 text-left text-sm ${activeTab === 'settings' ? 'text-[#9cd2b8] font-bold' : ''}`}
          >
            System Settings
          </button>

          <div className="border-t border-[#9cd2b8]/10 my-2 pt-2"></div>

          <div className="p-3 bg-neutral-900 rounded-xl flex items-center justify-between text-xs">
            <span>Simulation Role</span>
            <div className="flex gap-2">
              <button onClick={() => handleChangeUserRole('manager')} className="text-[#9cd2b8]">Manager</button>
              <button onClick={() => handleChangeUserRole('engineer')} className="text-[#cbc3d9]">Engineer</button>
            </div>
          </div>
        </div>
      )}

      {/* Main layout contents area wrapper */}
      <div className={`flex-1 min-w-0 md:pl-72 ${activeSOS ? 'pt-24 md:pt-16 pb-4' : 'pt-14 md:pt-0 pb-4'}`}>
        <main className="h-full min-h-screen">
          {renderTabContent()}
        </main>
      </div>

    </div>
  );
}
