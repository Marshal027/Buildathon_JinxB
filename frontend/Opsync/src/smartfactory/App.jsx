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
import WorkerPortal from './pages/WorkerPortal.jsx';
import MailSystemPage from './pages/MailSystemPage.jsx';
import Editor from '../pages/Editor.jsx';
import CctvFootagePage from './pages/CctvFootagePage.jsx';
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState({ id: 'Admin-1', name: 'Admin Supervisor', role: 'manager' });
  const [wsConnected, setWsConnected] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data State
  const [machines, setMachines] = useState([
    { id: 'M-402', name: 'CNC Axis 4', locationZone: 'A-1', healthScore: 94, status: 'online', uptimeHours: 1250, lastServiceDate: '2026-04-10', temp: 68.4, vibration: 11.2, pressure: 90 },
    { id: 'P-114', name: 'Auxiliary Hydraulic Circuit', locationZone: 'C-1', healthScore: 82, status: 'warning', uptimeHours: 840, lastServiceDate: '2026-03-15', temp: 42.1, vibration: 12.4, pressure: 115 },
    { id: 'I-03', name: 'Inspection Optical Sensor', locationZone: 'B-1', healthScore: 99, status: 'online', uptimeHours: 3200, lastServiceDate: '2026-05-01', temp: 35.2, vibration: 1.2, pressure: 0 },
    { id: 'ASM-001', name: 'Assembly Line Alpha Motor', locationZone: 'A-1', healthScore: 98, status: 'online', uptimeHours: 4120, lastServiceDate: '2026-05-12', temp: 58.7, vibration: 9.8, pressure: 0 },
    { id: 'CLS-042', name: 'Cooling System Beta', locationZone: 'A-2', healthScore: 72, status: 'warning', uptimeHours: 1850, lastServiceDate: '2026-02-28', temp: 85.0, vibration: 18.5, pressure: 120 },
    { id: 'ROB-112', name: 'Welding Arm X-1', locationZone: 'B-2', healthScore: 88, status: 'online', uptimeHours: 2950, lastServiceDate: '2026-04-20', temp: 44.2, vibration: 15.1, pressure: 45 },
    { id: 'EX-02', name: 'Extruder Alpha', locationZone: 'D-1', healthScore: 91, status: 'online', uptimeHours: 1100, lastServiceDate: '2025-11-15', temp: 195.4, vibration: 22.4, pressure: 250 },
    { id: 'T-42', name: 'Conveyor Beta Main Motor', locationZone: 'C-1', healthScore: 45, status: 'offline', uptimeHours: 6200, lastServiceDate: '2026-01-10', temp: 82.3, vibration: 45.2, pressure: 0 }
  ]);
  const [tickets, setTickets] = useState([
    {
      id: 'TKT-8902',
      machineId: 'M-402',
      machineName: 'CNC Axis 4',
      reportedBy: 'System Watchdog',
      assignedTo: 'J. Doe',
      issueDescription: 'AI sensors detected sustained temperature variance exceeding operational thresholds by 15% on the main spindle bearing assembly.',
      aiAssessment: 'Continuous data streams indicate a 94% probability of imminent bearing failure on Axis 4. Friction coefficients have spiked synchronously with localized temperature increases. Recommended immediate halt of operations to prevent catastrophic spindle damage.',
      severity: 'critical',
      status: 'open',
      createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
      checklist: [
        { text: 'Halt Machine M-402', done: false },
        { text: 'Lockout/Tagout (LOTO)', done: false },
        { text: 'Inspect Spindle Housing', done: false }
      ]
    },
    {
      id: 'TKT-8895',
      machineId: 'P-114',
      machineName: 'Auxiliary Hydraulic Circuit',
      reportedBy: 'Automation Guard',
      severity: 'complex',
      status: 'open',
      issueDescription: 'Intermittent pressure drops noted in auxiliary hydraulic circuit B during high-load cycles.',
      aiAssessment: 'Periodic visual pressure spike matching cycle initiation suggests standard valve wear or micro-leakage in line B. Inspection requested.',
      createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
      checklist: [
        { text: 'Measure line B pressure drops', done: true },
        { text: 'Diagnose relief valve seals', done: false }
      ]
    },
    {
      id: 'TKT-8891',
      machineId: 'I-03',
      machineName: 'Inspection Optical Sensor',
      reportedBy: 'Supervisor Miller',
      severity: 'low',
      status: 'open',
      issueDescription: 'Optical sensor array on inspection line 3 requires scheduled quarterly calibration.',
      aiAssessment: 'Preventative compliance alert. No telemetric anomalies detected; routine upkeep.',
      createdAt: new Date(Date.now() - 300 * 60000).toISOString(),
      checklist: [
        { text: 'Run optic calibration protocol', done: false }
      ]
    }
  ]);
  const [attendance, setAttendance] = useState([
    { id: '1', workerId: 'T-492', workerName: 'J. Kowalski', clockIn: new Date(Date.now() - 4 * 3600000).toISOString(), locationLat: 37.7750, locationLng: -122.4195, isValid: true },
    { id: '2', workerId: 'E-118', workerName: 'S. Miller', clockIn: new Date(Date.now() - 5 * 3600000).toISOString(), clockOut: new Date(Date.now() - 1 * 3600000).toISOString(), locationLat: 37.7745, locationLng: -122.4188, isValid: true },
    { id: '3', workerId: 'S-882', workerName: 'A. Chen', clockIn: new Date(Date.now() - 2 * 3600000).toISOString(), locationLat: 37.7752, locationLng: -122.4190, isValid: true }
  ]);
  const [workerLocations, setWorkerLocations] = useState([
    { id: 'T-492', lat: 37.7750, lng: -122.4195, name: 'J. Kowalski', lastUpdate: new Date().toISOString() },
    { id: 'S-882', lat: 37.7752, lng: -122.4190, name: 'A. Chen', lastUpdate: new Date().toISOString() }
  ]);
  const [liveAlerts, setLiveAlerts] = useState([
    { id: 'alert-1', severity: 'critical', title: 'Temperature Spike', message: 'Cooling System Beta exceeding operational threshold by 15°C.', timestamp: 'Just now' },
    { id: 'alert-2', severity: 'warning', title: 'Calibration Required', message: 'Welding Arm X-1 scheduled for routine calibration in 2 hours.', timestamp: '12m ago' },
    { id: 'alert-3', severity: 'info', title: 'Firmware Deployed', message: 'V2.4.1 successfully deployed to Assembly Line Alpha.', timestamp: '1h ago' }
  ]);
  const [chatMessages, setChatMessages] = useState([]);
  const [activeRecord, setActiveRecord] = useState(null);
  
  // Dashboard Metrics
  const [summary, setSummary] = useState({
    productivity: 94,
    personnelActive: 128,
    machinesOnline: 7,
    machinesTotal: 8,
    openTickets: 3,
    criticalTickets: 1
  });

  // Active Critical SOS Alerts State
  const [activeSOS, setActiveSOS] = useState(null);
  const [ticketSentPopup, setTicketSentPopup] = useState(false);

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

      // Check active clock in for Kowalski
      const active = attendanceRes.find(a => a.workerId === currentUser.id && !a.clockOut);
      if (active) {
        setActiveRecord(active);
      } else {
        setActiveRecord(null);
      }
    } catch (err) {
      console.log('Using client-side state backup. Telemetry simulation active.');
      // Local telemetry drift simulation
      setMachines(prev => prev.map(m => {
        if (m.status === 'online' || m.status === 'warning') {
          const tempDelta = (Math.random() - 0.5) * 1.5;
          const vibDelta = (Math.random() - 0.5) * 0.8;
          return {
            ...m,
            temp: parseFloat((m.temp + tempDelta).toFixed(1)),
            vibration: parseFloat(Math.max(0.1, m.vibration + vibDelta).toFixed(1))
          };
        }
        return m;
      }));

      // Calculate summary metrics locally
      setSummary(prev => {
        const total = machines.length;
        const online = machines.filter(m => m.status === 'online' || m.status === 'warning').length;
        const openCount = tickets.filter(t => t.status !== 'resolved').length;
        const criticalCount = tickets.filter(t => t.status !== 'resolved' && t.severity === 'critical').length;
        return {
          ...prev,
          machinesOnline: online,
          machinesTotal: total,
          openTickets: openCount,
          criticalTickets: criticalCount
        };
      });

      const active = attendance.find(a => a.workerId === currentUser.id && !a.clockOut);
      setActiveRecord(active || null);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Periodically fetch dashboard summary updates
    const interval = setInterval(fetchAllData, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Live telemetry simulation — drift machine data every 5 seconds
  useEffect(() => {
    const simInterval = setInterval(() => {
      // Simulate machine telemetry drift
      setMachines(prev => prev.map(m => {
        if (m.status === 'offline') return m;
        const tempDrift = (Math.random() - 0.48) * 2.2;
        const vibDrift = (Math.random() - 0.48) * 1.5;
        const healthDrift = Math.random() < 0.15 ? (Math.random() < 0.5 ? -1 : 1) : 0;
        const newHealth = Math.max(10, Math.min(100, m.healthScore + healthDrift));
        const newTemp = parseFloat(Math.max(20, m.temp + tempDrift).toFixed(1));
        const newVib = parseFloat(Math.max(0.5, m.vibration + vibDrift).toFixed(1));
        // Status can shift based on health
        let newStatus = m.status;
        if (newHealth < 50) newStatus = 'offline';
        else if (newHealth < 70) newStatus = 'warning';
        else if (m.status === 'warning' && newHealth > 80) newStatus = 'online';
        return { ...m, temp: newTemp, vibration: newVib, healthScore: newHealth, status: newStatus };
      }));

      // Drift worker location coordinates slightly
      setWorkerLocations(prev => prev.map(w => ({
        ...w,
        lat: parseFloat((w.lat + (Math.random() - 0.5) * 0.0002).toFixed(6)),
        lng: parseFloat((w.lng + (Math.random() - 0.5) * 0.0002).toFixed(6)),
        lastUpdate: new Date().toISOString()
      })));

      // Recalculate summary from live state
      setSummary(prev => {
        const prodDrift = (Math.random() - 0.45) * 0.6;
        return {
          ...prev,
          productivity: Math.max(85, Math.min(99, parseFloat((prev.productivity + prodDrift).toFixed(1)))),
          machinesOnline: machines.filter(m => m.status === 'online' || m.status === 'warning').length,
          machinesTotal: machines.length,
          openTickets: tickets.filter(t => t.status !== 'resolved').length,
          criticalTickets: tickets.filter(t => t.status !== 'resolved' && t.severity === 'critical').length,
          personnelActive: workerLocations.length + 125
        };
      });
    }, 5000);
    return () => clearInterval(simInterval);
  }, [machines, tickets, workerLocations]);

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
            case 'ticket.updated':
              setTickets(prev => prev.map(t => t.id === signal.payload.id ? signal.payload : t));
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
    if (role === 'worker') {
      setCurrentUser({ id: 'T-492', name: 'J. Kowalski', role: 'worker' });
      setActiveTab('worker-portal');
    } else if (role === 'engineer') {
      setCurrentUser({ id: 'Eng-03', name: 'Sarah Miller', role: 'engineer' });
      setActiveTab('maintenance-ai');
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
      setMachines(prev => prev.map(m => m.id === id ? { ...m, ...update } : m));
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
      setTickets(prev => prev.map(t => t.id === id ? { ...t, ...update } : t));
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
      const fallbackTkt = {
        id: `TKT-${Math.floor(8800 + Math.random() * 1100)}`,
        machineId: newTkt.machineId,
        machineName: newTkt.machineName || (machines.find(m => m.id === newTkt.machineId)?.name || 'Unknown Machine'),
        reportedBy: newTkt.reportedBy || 'System Watchdog',
        issueDescription: newTkt.issueDescription,
        severity: newTkt.severity || 'complex',
        status: 'open',
        createdAt: new Date().toISOString(),
        checklist: [
          { text: 'Diagnostics review', done: false },
          { text: 'Resolve underlying issues', done: false }
        ]
      };
      setTickets(prev => [fallbackTkt, ...prev]);
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
      setLiveAlerts(prev => [
        {
          id: Math.random().toString(),
          severity: priority === 'high' ? 'critical' : 'info',
          title: 'Manager Broadcast',
          message: msg,
          timestamp: 'Just now'
        },
        ...prev
      ]);
    }
  };

  const handleWorkerClockIn = async (lat, lng) => {
    try {
      const res = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, workerId: currentUser.id, workerName: currentUser.name })
      });
      const data = await res.json();
      if (data.isValid) {
        setActiveRecord(data);
      }
      fetchAllData();
      return data;
    } catch (err) {
      const data = {
        id: Math.random().toString(),
        workerId: currentUser.id,
        workerName: currentUser.name,
        clockIn: new Date().toISOString(),
        locationLat: lat,
        locationLng: lng,
        isValid: true
      };
      setActiveRecord(data);
      setAttendance(prev => [data, ...prev]);
      setWorkerLocations(prev => {
        const filtered = prev.filter(w => w.id !== currentUser.id);
        return [...filtered, { id: currentUser.id, lat, lng, name: currentUser.name, lastUpdate: new Date().toISOString() }];
      });
      return data;
    }
  };

  const handleWorkerClockOut = async () => {
    try {
      const res = await fetch('/api/attendance/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: currentUser.id })
      });
      const data = await res.json();
      setActiveRecord(null);
      fetchAllData();
      return data;
    } catch (err) {
      setAttendance(prev => prev.map(a => a.workerId === currentUser.id && !a.clockOut ? { ...a, clockOut: new Date().toISOString() } : a));
      setWorkerLocations(prev => prev.filter(w => w.id !== currentUser.id));
      setActiveRecord(null);
      return { success: true };
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
      setActiveSOS({
        name: currentUser.name,
        id: currentUser.id,
        lat,
        lng
      });
      setLiveAlerts(prev => [
        {
          id: Math.random().toString(),
          severity: 'critical',
          title: `SOS triggered by ${currentUser.name}`,
          message: `Immediate response requested at Lat: ${lat}, Lng: ${lng}`,
          timestamp: 'Just now'
        },
        ...prev
      ]);
    }
  };

  const handleTriggerGeneralSOS = () => {
    handleWorkerSOS(37.7750, -122.4195);
  };

  const [docsContent, setDocsContent] = useState('');

  useEffect(() => {
    // Mock documentation so Gemini has content to answer from
    const mockDocs = `
    ### What does a blinking red LED mean?
    Answer: A blinking red LED indicates a database connection timeout. Check if the database instance is running and verify credentials.

    ### How do I reboot the machine?
    Answer: To reboot, press and hold the manual power button on the front panel for 5 seconds, or execute the command 'oppsynce restart' from the admin terminal.

    ### What should I do if the disk is full?
    Answer: Clean up log files by running the clean command: 'oppsynce clean-logs'. You can also configure log rotation in oppsynce.config.json.
    `;
    setDocsContent(mockDocs);
  }, [activeTab]);

  // Fallback local response generator when offline / Gemini API fails
  const getLocalFallbackResponse = (input) => {
    const text = input.toLowerCase().trim();

    // 1. Try to find the answer dynamically from loaded docsContent first!
    if (docsContent) {
      const sections = docsContent.split(/###\s+/);
      const cleanStr = (s) => s.toLowerCase().replace(/[?.,!:]/g, '').trim();
      const inputCleaned = cleanStr(text);
      
      for (const section of sections) {
        const lines = section.split('\n');
        if (lines.length < 2) continue;
        
        const questionLine = lines[0].trim();
        if (!questionLine) continue;
        
        let answerText = '';
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('**Answer:**')) {
            answerText = line.substring(11).trim();
            break;
          } else if (line.startsWith('Answer:')) {
            answerText = line.substring(7).trim();
            break;
          } else if (line.startsWith('**') && line.endsWith('**')) {
            answerText = line.replace(/^\*\*|\*\*$/g, '').trim();
            break;
          }
        }
        
        if (!answerText) continue;
        
        const questionCleaned = cleanStr(questionLine);
        
        // Match if clean question contains the clean query or clean query contains the clean question
        if (inputCleaned.includes(questionCleaned) || questionCleaned.includes(inputCleaned)) {
          return answerText;
        }
        
        // Match if all significant keywords (length > 3) are found in the question
        const words = inputCleaned.split(/\s+/).filter(w => w.length > 3);
        if (words.length > 0 && words.every(w => questionCleaned.includes(w))) {
          return answerText;
        }
      }
    }

    // 2. Predefined fallback responses as second option
    if (text.includes('led') || text.includes('blinking red')) {
      return "The blinking red LED indicates a database connection timeout. Check if the database instance is running and verify the login credentials in the configuration file.";
    }
    if (text.includes('restart') || text.includes('reboot')) {
      return "Press and hold the manual power button on the front panel for 5 seconds, or execute the command `oppsynce restart` from the admin terminal.";
    }
    if (text.includes('disk full') || text.includes('space') || text.includes('disk')) {
      return "Clean up log files by running the clean command: `oppsynce clean-logs`. You can also configure log rotation in `oppsynce.config.json`.";
    }
    if (text.includes('conflict') || text.includes('warning')) {
      return "Access the conflict resolution panel, choose between 'last-write-wins' or manual merge. You can also specify the default policy in the schema configuration under `conflictResolution`.";
    }
    if (text.includes('blue') || text.includes('light')) {
      return "A solid blue light indicates that the machine is successfully connected, operational, and actively syncing tables.";
    }
    if (text.includes('hello') || text.includes('hi') || text.includes('hey') || text.includes('hola')) {
      return "Hello! I'm here to help you. How can I assist you today?";
    }
    return "I cannot find this in the documentation. Would you like to forward this message to the manager?";
  };

  // Create issue escalation ticket for manager
  const handleChatSubmitIssue = async (msgId, userQuestion) => {
    try {
      const badMachine = machines.find(m => m.status !== 'online') || machines[0] || { id: 'M-402', name: 'CNC Axis 4' };
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machineId: badMachine.id,
          machineName: badMachine.name,
          reportedBy: 'Worker AI Portal',
          issueDescription: userQuestion,
          severity: 'critical'
        })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error('Failed to submit escalation ticket:', err);
    }

    setChatMessages(prev => prev.map(m => m.id === msgId ? { ...m, submitted: true } : m));

    // Inject alert to manager notification list
    const alertId = `notification-${Date.now()}`;
    const newAlert = {
      id: alertId,
      severity: 'critical',
      title: 'Ticket forwarded to manager',
      message: `Triage ticket created for issue: "${userQuestion}"`,
      timestamp: 'Just now'
    };
    setLiveAlerts(prev => [newAlert, ...prev]);

    // Show success popup instead of SOS
    setTicketSentPopup(true);
    setTimeout(() => {
      setTicketSentPopup(false);
    }, 4000);
  };

  // Chat agent submission using Gemini
  const handleBotSubmitMessage = async (message, image) => {
    const userMsg = {
      id: Math.random().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString(),
      image
    };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      const apiKey = 'AIzaSyDYNtpQwVOnD4BVLARdyXYhs-4tm18Hots';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

      // Build chat conversation history for Gemini context window
      const contents = chatMessages
        .filter(msg => msg.content)
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

      // Add the current user input message
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      // Construct system instruction based on latest documentation
      const systemInstructionText = `You are a helpful and neutral AI assistant. You have access to the following troubleshooting documentation for the Sync-Engine-9000 machine:\n\n${docsContent}\n\nYour task is to answer user troubleshooting questions using ONLY the facts provided in the documentation above. When you provide an answer from the documentation, you MUST start your reply exactly with: 'within the documentation it says '. First provide the direct answer from the documentation, and then explain the reasoning or provide more context. If the user asks a troubleshooting question about the machine that CANNOT be answered based on the provided documentation, you MUST respond exactly with: 'I cannot find this in the documentation. Would you like to forward this message to the manager?'`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemInstructionText }]
          }
        })
      });

      if (!response.ok) {
        throw new Error('Gemini API call failed');
      }

      const data = await response.json();
      let responseText = '';
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        responseText = data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid Gemini output structure');
      }

      const showSubmitButton = responseText.toLowerCase().includes("forward this message to the manager") || responseText.toLowerCase().includes("forward message to the manager");

      const aiMsg = {
        id: Math.random().toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString(),
        showSubmitButton,
        associatedUserQuestion: message
      };
      setChatMessages(prev => [...prev, aiMsg]);

    } catch (geminiErr) {
      console.log('Gemini failed or offline, falling back to local docs index matching:', geminiErr);
      const responseText = getLocalFallbackResponse(message);
      const showSubmitButton = responseText.toLowerCase().includes("forward this message to the manager") || responseText.toLowerCase().includes("forward message to the manager");

      const aiMsg = {
        id: Math.random().toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString(),
        showSubmitButton,
        associatedUserQuestion: message
      };
      setChatMessages(prev => [...prev, aiMsg]);
    }
  };;

  const handleClearSession = async () => {
    setChatMessages([]);
  };

  // Selected Machine state pointer shared globally
  const [selectedMachine, setSelectedMachine] = useState(null);

  // Layout routing switcher
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (currentUser.role === 'engineer') {
          return <div className="text-center p-10 font-bold text-[#ffb4ab]">Access Denied. Engineers do not have access to this page.</div>;
        }
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
        if (currentUser.role === 'engineer') {
          return <div className="text-center p-10 font-bold text-[#ffb4ab]">Access Denied. Engineers do not have access to this page.</div>;
        }
        return (
          <MachineHealthPage 
            machines={machines}
            selectedMachine={selectedMachine}
            onSelectMachine={setSelectedMachine}
            onUpdateMachineStatus={handleUpdateMachineStatus}
          />
        );
      case 'maintenance-ai':
        if (currentUser.role !== 'engineer') {
          return <div className="text-center p-10 font-bold text-[#ffb4ab]">Access Denied. Only Engineers can access the AI Chat.</div>;
        }
        return (
          <ChatPage 
            messages={chatMessages}
            onSubmitMessage={handleBotSubmitMessage}
            onClearSession={handleClearSession}
            onSubmitIssue={handleChatSubmitIssue}
            machines={machines}
          />
        );
      case 'tickets':
        if (currentUser.role === 'engineer') {
          return <div className="text-center p-10 font-bold text-[#ffb4ab]">Access Denied. Engineers do not have access to this page.</div>;
        }
        return (
          <TicketsPage 
            tickets={tickets}
            onUpdateTicket={handleUpdateTicket}
            onAddTicket={handleAddTicket}
          />
        );
      case 'personnel':
        if (currentUser.role === 'engineer') {
          return <div className="text-center p-10 font-bold text-[#ffb4ab]">Access Denied. Engineers do not have access to this page.</div>;
        }
        return (
          <PersonnelPage 
            attendance={attendance}
            workerLocations={workerLocations}
          />
        );
      case 'mail-system':
        if (currentUser.role === 'engineer') {
          return <div className="text-center p-10 font-bold text-[#ffb4ab]">Access Denied. Engineers do not have access to this page.</div>;
        }
        return <MailSystemPage />;
      case 'editor':
        if (currentUser.role !== 'manager') {
          return <div className="text-center p-10 font-bold text-[#ffb4ab]">Access Denied. Only Managers can access the Document Editor.</div>;
        }
        return <Editor />;
      case 'cctv':
        if (currentUser.role !== 'manager') {
          return <div className="text-center p-10 font-bold text-[#ffb4ab]">Access Denied. Only Managers can access the CCTV Footage.</div>;
        }
        return <CctvFootagePage />;
      case 'settings':
        if (currentUser.role === 'engineer') {
          return <div className="text-center p-10 font-bold text-[#ffb4ab]">Access Denied. Engineers do not have access to this page.</div>;
        }
        return <SettingsPage />;
      case 'worker-portal':
        return (
          <WorkerPortal 
            onClockIn={handleWorkerClockIn}
            onClockOut={handleWorkerClockOut}
            onTriggerSOS={handleWorkerSOS}
            activeRecord={activeRecord}
            wsConnected={wsConnected}
          />
        );
      default:
        return <div className="text-white text-center p-10 font-bold">Workspace View Error</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#ffffff] font-sans flex relative select-none">
      
      {/* Real-time floating alarm distress card */}
      {activeSOS && (
        <div className="fixed top-20 right-6 left-6 md:left-auto md:w-[450px] bg-[#1c1b1d]/95 backdrop-blur-md border border-[#ba1a1a]/30 rounded-2xl shadow-[0_20px_50px_rgba(186,26,26,0.3)] z-[999] overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-[#ba1a1a] transition-all duration-300">
          <div className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3 border-b border-white/5 pb-2.5">
              <ShieldAlert className="w-5 h-5 text-[#ba1a1a]" />
              <span className="text-xs font-bold tracking-wider uppercase text-red-500">
                CRITICAL SOS DISTRESS SIGNAL
              </span>
            </div>
            
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="text-white font-semibold">
                Operator Name: <span className="text-yellow-400 font-bold">{activeSOS.name}</span>
              </div>
              <div className="text-[#ffffff]/80">
                Worker ID: <span className="font-mono text-white">{activeSOS.id}</span>
              </div>
              <div className="text-[#ffffff]/80">
                Coordinates: <span className="font-mono text-white">{activeSOS.lat.toFixed(6)}, {activeSOS.lng.toFixed(6)}</span>
              </div>
              <p className="text-xs text-[#ffb4ab] mt-2 font-medium bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 p-2.5 rounded-lg leading-relaxed">
                ⚠️ GEOFENCED CRITICAL SOS DETECTED. Immediate response requested. Dispatch medical and security teams to the location zone.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <button 
                onClick={() => setActiveSOS(null)}
                className="text-xs font-bold bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-xl px-4 py-2 transition-all active:scale-95 shadow-md shadow-red-950 cursor-pointer"
              >
                Acknowledge Alarm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Sent Confirmation Popup */}
      {ticketSentPopup && (
        <div className="fixed top-20 right-6 left-6 md:left-auto md:w-[350px] bg-[#1c1b1d]/95 backdrop-blur-md border border-[#9cd2b8]/30 rounded-2xl shadow-[0_20px_50px_rgba(156,210,184,0.15)] z-[999] overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-[#9cd2b8] animate-fadeIn">
          <div className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#9cd2b8]/10 flex items-center justify-center shrink-0">
                <Ticket className="w-4 h-4 text-[#9cd2b8]" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white">Ticket Sent</h4>
                <p className="text-[11px] text-[#ffffff]/60 mt-0.5 leading-relaxed">Your diagnostic issue has been successfully forwarded to the management dashboard.</p>
              </div>
              <button onClick={() => setTicketSentPopup(false)} className="text-[#ffffff]/50 hover:text-white p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Sidebar desktop */}
      <div className="hidden md:block">
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
        <h1 className="text-[#9cd2b8] font-bold text-sm tracking-tight">Oppsynce</h1>
        <button 
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="p-1.5 text-[#ffffff] hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer routing overlay navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-[#0a0a0b]/95 z-[90] pt-16 px-4 flex flex-col gap-2">
          {currentUser.role !== 'engineer' && (
            <button 
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`py-2.5 text-left text-sm ${activeTab === 'dashboard' ? 'text-[#9cd2b8] font-bold' : ''}`}
            >
              Manager Dashboard
            </button>
          )}
          {currentUser.role !== 'engineer' && (
            <button 
              onClick={() => { setActiveTab('machine-health'); setMobileMenuOpen(false); }}
              className={`py-2.5 text-left text-sm ${activeTab === 'machine-health' ? 'text-[#9cd2b8] font-bold' : ''}`}
            >
              Machine Health Layout
            </button>
          )}
          {currentUser.role === 'engineer' && (
            <button 
              onClick={() => { setActiveTab('maintenance-ai'); setMobileMenuOpen(false); }}
              className={`py-2.5 text-left text-sm ${activeTab === 'maintenance-ai' ? 'text-[#9cd2b8] font-bold' : ''}`}
            >
              Maintenance AI Chat
            </button>
          )}
          {currentUser.role !== 'engineer' && (
            <button 
              onClick={() => { setActiveTab('tickets'); setMobileMenuOpen(false); }}
              className={`py-2.5 text-left text-sm ${activeTab === 'tickets' ? 'text-[#9cd2b8] font-bold' : ''}`}
            >
              Tickets Explorer
            </button>
          )}

          {currentUser.role !== 'engineer' && (
            <button 
              onClick={() => { setActiveTab('mail-system'); setMobileMenuOpen(false); }}
              className={`py-2.5 text-left text-sm ${activeTab === 'mail-system' ? 'text-[#9cd2b8] font-bold' : ''}`}
            >
              Mail System
            </button>
          )}
          {currentUser.role === 'manager' && (
            <>
              <button 
                onClick={() => { setActiveTab('editor'); setMobileMenuOpen(false); }}
                className={`py-2.5 text-left text-sm ${activeTab === 'editor' ? 'text-[#9cd2b8] font-bold' : ''}`}
              >
                Document Editor
              </button>
              <button 
                onClick={() => { setActiveTab('cctv'); setMobileMenuOpen(false); }}
                className={`py-2.5 text-left text-sm ${activeTab === 'cctv' ? 'text-[#9cd2b8] font-bold' : ''}`}
              >
                CCTV Footage
              </button>
            </>
          )}
          {currentUser.role !== 'engineer' && (
            <button 
              onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
              className={`py-2.5 text-left text-sm ${activeTab === 'settings' ? 'text-[#9cd2b8] font-bold' : ''}`}
            >
              System Settings
            </button>
          )}
          <button 
            onClick={() => { setActiveTab('worker-portal'); setMobileMenuOpen(false); }}
            className={`py-2.5 text-left text-sm text-[#b0cbd8] font-bold`}
          >
            Worker Companion App
          </button>

          <div className="border-t border-[#9cd2b8]/10 my-2 pt-2"></div>

          <div className="p-3 bg-neutral-900 rounded-xl flex items-center justify-between text-xs">
            <span>Simulation Role</span>
            <div className="flex gap-2">
              <button onClick={() => handleChangeUserRole('manager')} className="text-[#9cd2b8]">Manager</button>
              <button onClick={() => handleChangeUserRole('worker')} className="text-[#cbc3d9]">Worker</button>
            </div>
          </div>
        </div>
      )}

      {/* Main layout contents area wrapper */}
      <div className="flex-1 min-w-0 md:pl-52 pt-14 md:pt-0 pb-4">
        <main className="h-full min-h-screen">
          {renderTabContent()}
        </main>
      </div>

    </div>
  );
}
