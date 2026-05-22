import express from 'express';
import path from 'path';
import fs from 'fs';
import http from 'http';
import url from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Memory Database
let machines = [
  { id: 'M-402', name: 'CNC Axis 4', locationZone: 'A-1', healthScore: 94, status: 'online', uptimeHours: 1250, lastServiceDate: '2026-04-10', temp: 68.4, vibration: 11.2, pressure: 90 },
  { id: 'P-114', name: 'Auxiliary Hydraulic Circuit', locationZone: 'C-1', healthScore: 82, status: 'warning', uptimeHours: 840, lastServiceDate: '2026-03-15', temp: 42.1, vibration: 12.4, pressure: 115 },
  { id: 'I-03', name: 'Inspection Optical Sensor', locationZone: 'B-1', healthScore: 99, status: 'online', uptimeHours: 3200, lastServiceDate: '2026-05-01', temp: 35.2, vibration: 1.2, pressure: 0 },
  { id: 'ASM-001', name: 'Assembly Line Alpha Motor', locationZone: 'A-1', healthScore: 98, status: 'online', uptimeHours: 4120, lastServiceDate: '2026-05-12', temp: 58.7, vibration: 9.8, pressure: 0 },
  { id: 'CLS-042', name: 'Cooling System Beta', locationZone: 'A-2', healthScore: 72, status: 'warning', uptimeHours: 1850, lastServiceDate: '2026-02-28', temp: 85.0, vibration: 18.5, pressure: 120 },
  { id: 'ROB-112', name: 'Welding Arm X-1', locationZone: 'B-2', healthScore: 88, status: 'online', uptimeHours: 2950, lastServiceDate: '2026-04-20', temp: 44.2, vibration: 15.1, pressure: 45 },
  { id: 'EX-02', name: 'Extruder Alpha', locationZone: 'D-1', healthScore: 91, status: 'online', uptimeHours: 1100, lastServiceDate: '2025-11-15', temp: 195.4, vibration: 22.4, pressure: 250 },
  { id: 'T-42', name: 'Conveyor Beta Main Motor', locationZone: 'C-1', healthScore: 45, status: 'offline', uptimeHours: 6200, lastServiceDate: '2026-01-10', temp: 82.3, vibration: 45.2, pressure: 0 }
];

let tickets = [
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
];

let attendance = [
  { id: '1', workerId: 'T-492', workerName: 'J. Kowalski', clockIn: new Date(Date.now() - 4 * 3600000).toISOString(), locationLat: 37.7750, locationLng: -122.4195, isValid: true },
  { id: '2', workerId: 'E-118', workerName: 'S. Miller', clockIn: new Date(Date.now() - 5 * 3600000).toISOString(), clockOut: new Date(Date.now() - 1 * 3600000).toISOString(), locationLat: 37.7745, locationLng: -122.4188, isValid: true },
  { id: '3', workerId: 'S-882', workerName: 'A. Chen', clockIn: new Date(Date.now() - 2 * 3600000).toISOString(), locationLat: 37.7752, locationLng: -122.4190, isValid: true }
];

let workerLocations = {
  'T-492': { lat: 37.7750, lng: -122.4195, name: 'J. Kowalski', lastUpdate: new Date().toISOString() },
  'S-882': { lat: 37.7752, lng: -122.4190, name: 'A. Chen', lastUpdate: new Date().toISOString() }
};

let chatSessions = [];

let liveAlerts = [
  { id: 'alert-1', severity: 'critical', title: 'Temperature Spike', message: 'Cooling System Beta exceeding operational threshold by 15°C.', timestamp: 'Just now' },
  { id: 'alert-2', severity: 'warning', title: 'Calibration Required', message: 'Welding Arm X-1 scheduled for routine calibration in 2 hours.', timestamp: '12m ago' },
  { id: 'alert-3', severity: 'info', title: 'Firmware Deployed', message: 'V2.4.1 successfully deployed to Assembly Line Alpha.', timestamp: '1h ago' }
];

// Geofence configuration
const FACTORY_LAT = 37.7749;
const FACTORY_LNG = -122.4194;
const FACTORY_RADIUS_METERS = 200;

function is_within_geofence(lat, lng) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat * Math.PI) / 180;
  const phi2 = (FACTORY_LAT * Math.PI) / 180;
  const deltaPhi = ((FACTORY_LAT - lat) * Math.PI) / 180;
  const deltaLambda = ((FACTORY_LNG - lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= FACTORY_RADIUS_METERS;
}

// Active WebSocket clients
const clients = new Set();

function broadcast(event) {
  const data = JSON.stringify(event);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

// REST endpoints
app.post('/api/auth/login', (req, res) => {
  const { role, username } = req.body;
  const user = {
    id: role === 'worker' ? 'T-492' : 'Admin-1',
    username: username || (role === 'worker' ? 'J. Kowalski' : 'Admin User'),
    role: role || 'manager',
    department: role === 'worker' ? 'Assembly Section A' : 'Operations Ctrl'
  };
  res.json({
    sf_access: 'temp_access_token_123',
    sf_refresh: 'temp_refresh_token_123',
    user
  });
});

app.post('/api/auth/refresh', (req, res) => {
  res.json({ sf_access: 'temp_access_token_refreshed' });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    user: {
      id: 'Admin-1',
      username: 'Admin User',
      role: 'manager'
    }
  });
});

app.get('/api/machines', (req, res) => {
  res.json(machines);
});

app.patch('/api/machines/:id', (req, res) => {
  const { id } = req.params;
  const update = req.body;
  machines = machines.map(m => m.id === id ? { ...m, ...update } : m);
  const updatedMachine = machines.find(m => m.id === id);
  if (updatedMachine) {
    broadcast({
      type: 'machine.status.update',
      payload: updatedMachine
    });
  }
  res.json(updatedMachine);
});

app.get('/api/attendance', (req, res) => {
  res.json(attendance);
});

app.post('/api/attendance/checkin', (req, res) => {
  const { lat, lng, workerId, workerName } = req.body;
  const isValid = is_within_geofence(lat, lng);
  const name = workerName || 'J. Kowalski';
  const id = workerId || 'T-492';

  const newRecord = {
    id: Math.random().toString(),
    workerId: id,
    workerName: name,
    clockIn: new Date().toISOString(),
    locationLat: lat,
    locationLng: lng,
    isValid
  };

  attendance.unshift(newRecord);

  if (isValid) {
    workerLocations[id] = { lat, lng, name, lastUpdate: new Date().toISOString() };
    broadcast({
      type: 'attendance.update',
      payload: { workerId: id, name, event: 'clock_in', timestamp: newRecord.clockIn }
    });
  }

  res.json(newRecord);
});

app.post('/api/attendance/checkout', (req, res) => {
  const { workerId } = req.body;
  const id = workerId || 'T-492';
  const record = attendance.find(a => a.workerId === id && !a.clockOut);
  if (record) {
    record.clockOut = new Date().toISOString();
    delete workerLocations[id];
    broadcast({
      type: 'attendance.update',
      payload: { workerId: id, name: record.workerName, event: 'clock_out', timestamp: record.clockOut }
    });
    res.json(record);
  } else {
    res.status(400).json({ error: 'No active clock-in session found' });
  }
});

app.post('/api/workers/location', (req, res) => {
  const { workerId, name, lat, lng } = req.body;
  const id = workerId || 'T-492';
  workerLocations[id] = { lat, lng, name: name || 'Worker', lastUpdate: new Date().toISOString() };
  broadcast({
    type: 'worker.location.update',
    payload: { workerId: id, name, lat, lng, timestamp: new Date().toISOString() }
  });
  res.json({ success: true });
});

app.get('/api/workers/locations', (req, res) => {
  res.json(Object.entries(workerLocations).map(([id, val]) => ({ id, ...val })));
});

app.get('/api/tickets', async (req, res) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/tickets/');
    if (response.ok) {
      const djangoTickets = await response.json();
      const mappedTickets = djangoTickets.map(t => ({
        id: t.ticket_id,
        machineId: t.machine_id,
        machineName: t.machine_name,
        reportedBy: t.reported_by,
        issueDescription: t.issue_description,
        severity: t.severity,
        status: t.status,
        createdAt: t.created_at,
        checklist: t.checklist || []
      }));
      res.json(mappedTickets);
    } else {
      res.json(tickets);
    }
  } catch (err) {
    console.error('Error fetching tickets from Django:', err);
    res.json(tickets);
  }
});

app.post('/api/tickets', async (req, res) => {
  const { machineId, machineName, reportedBy, issueDescription, severity } = req.body;
  const ticketId = `TKT-${Math.floor(8800 + Math.random() * 1100)}`;
  const defaultChecklist = [
    { text: 'Diagnostics review', done: false },
    { text: 'Resolve underlying issues', done: false }
  ];
  
  const newTicket = {
    id: ticketId,
    machineId,
    machineName: machineName || (machines.find(m => m.id === machineId)?.name || 'Unknown Machine'),
    reportedBy: reportedBy || 'System Watchdog',
    issueDescription,
    severity: severity || 'complex',
    status: 'open',
    createdAt: new Date().toISOString(),
    checklist: defaultChecklist
  };

  try {
    const djangoPayload = {
      ticket_id: newTicket.id,
      machine_id: newTicket.machineId,
      machine_name: newTicket.machineName,
      reported_by: newTicket.reportedBy,
      issue_description: newTicket.issueDescription,
      severity: newTicket.severity,
      status: newTicket.status,
      checklist: newTicket.checklist
    };

    const response = await fetch('http://127.0.0.1:8000/api/tickets/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(djangoPayload)
    });

    if (response.ok) {
      const createdTkt = await response.json();
      const mappedTkt = {
        id: createdTkt.ticket_id,
        machineId: createdTkt.machine_id,
        machineName: createdTkt.machine_name,
        reportedBy: createdTkt.reported_by,
        issueDescription: createdTkt.issue_description,
        severity: createdTkt.severity,
        status: createdTkt.status,
        createdAt: createdTkt.created_at,
        checklist: createdTkt.checklist || []
      };
      
      tickets.unshift(mappedTkt);
      broadcast({
        type: 'ticket.created',
        payload: mappedTkt
      });
      res.json(mappedTkt);
    } else {
      tickets.unshift(newTicket);
      broadcast({
        type: 'ticket.created',
        payload: newTicket
      });
      res.json(newTicket);
    }
  } catch (err) {
    console.error('Error saving ticket to Django:', err);
    tickets.unshift(newTicket);
    broadcast({
      type: 'ticket.created',
      payload: newTicket
    });
    res.json(newTicket);
  }
});

app.patch('/api/tickets/:id', async (req, res) => {
  const { id } = req.params;
  const update = req.body;
  
  tickets = tickets.map(t => t.id === id ? { ...t, ...update } : t);
  const updatedLocalTicket = tickets.find(t => t.id === id);

  try {
    const getRes = await fetch('http://127.0.0.1:8000/api/tickets/');
    if (getRes.ok) {
      const djangoTickets = await getRes.json();
      const targetTkt = djangoTickets.find(t => t.ticket_id === id);
      if (targetTkt) {
        const djangoUpdate = {};
        if (update.machineId !== undefined) djangoUpdate.machine_id = update.machineId;
        if (update.machineName !== undefined) djangoUpdate.machine_name = update.machineName;
        if (update.reportedBy !== undefined) djangoUpdate.reported_by = update.reportedBy;
        if (update.issueDescription !== undefined) djangoUpdate.issue_description = update.issueDescription;
        if (update.severity !== undefined) djangoUpdate.severity = update.severity;
        if (update.status !== undefined) djangoUpdate.status = update.status;
        if (update.checklist !== undefined) djangoUpdate.checklist = update.checklist;

        const patchRes = await fetch(`http://127.0.0.1:8000/api/tickets/${targetTkt.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(djangoUpdate)
        });

        if (patchRes.ok) {
          const patchData = await patchRes.json();
          const mappedTkt = {
            id: patchData.ticket_id,
            machineId: patchData.machine_id,
            machineName: patchData.machine_name,
            reportedBy: patchData.reported_by,
            issueDescription: patchData.issue_description,
            severity: patchData.severity,
            status: patchData.status,
            createdAt: patchData.created_at,
            checklist: patchData.checklist || []
          };
          res.json(mappedTkt);
          return;
        }
      }
    }
  } catch (err) {
    console.error('Error patching ticket in Django:', err);
  }
  
  res.json(updatedLocalTicket);
});

app.post('/api/alerts/sos', (req, res) => {
  const { workerId, name, lat, lng } = req.body;
  const id = workerId || 'T-492';
  const workerName = name || 'J. Kowalski';

  broadcast({
    type: 'alert.sos',
    payload: { workerId: id, name: workerName, lat, lng, timestamp: new Date().toISOString() }
  });

  liveAlerts.unshift({
    id: Math.random().toString(),
    severity: 'critical',
    title: `SOS triggered by ${workerName}`,
    message: `Immediate response requested at Lat: ${lat}, Lng: ${lng}`,
    timestamp: 'Just now'
  });

  res.json({ success: true, message: 'SOS broadcasted successfully' });
});

app.post('/api/notifications/broadcast', (req, res) => {
  const { message, priority, sentBy } = req.body;
  broadcast({
    type: 'alert.broadcast',
    payload: { message, priority: priority || 'high', sent_by: sentBy || 'Admin' }
  });
  liveAlerts.unshift({
    id: Math.random().toString(),
    severity: priority === 'high' ? 'critical' : 'info',
    title: 'Manager Broadcast',
    message,
    timestamp: 'Just now'
  });
  res.json({ success: true });
});

app.get('/api/dashboard/summary', async (req, res) => {
  let currentTickets = tickets;
  try {
    const response = await fetch('http://127.0.0.1:8000/api/tickets/');
    if (response.ok) {
      const djangoTickets = await response.json();
      currentTickets = djangoTickets.map(t => ({
        id: t.ticket_id,
        machineId: t.machine_id,
        machineName: t.machine_name,
        reportedBy: t.reported_by,
        issueDescription: t.issue_description,
        severity: t.severity,
        status: t.status,
        createdAt: t.created_at,
        checklist: t.checklist || []
      }));
    }
  } catch (err) {
    console.error('Error fetching tickets for summary:', err);
  }

  const total = machines.length;
  const online = machines.filter(m => m.status === 'online' || m.status === 'warning').length;
  const activeWorkers = Object.keys(workerLocations).length;
  const openCount = currentTickets.filter(t => t.status !== 'resolved').length;
  const criticalCount = currentTickets.filter(t => t.status !== 'resolved' && t.severity === 'critical').length;

  const summary = {
    productivity: 94,
    personnelActive: activeWorkers + 125, // offset with static mockup baseline
    machinesOnline: online,
    machinesTotal: total,
    openTickets: openCount,
    criticalTickets: criticalCount
  };
  res.json({ summary, liveAlerts });
});

// --- EMAIL SYSTEM PROXIES ---
app.get('/api/emails', async (req, res) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/emails/');
    if (response.ok) {
      let data = await response.json();
      
      // If the email table in Django is empty, seed it with initial emails!
      if (data.length === 0) {
        const initialEmails = [
          {
            sender: 'Admin Supervisor',
            sender_role: 'manager',
            recipient: 'sarah.miller@opsync.com',
            subject: 'Mandatory Safety Inspection - Shift A',
            body: 'Team, please ensure that all Sync-Engine-9000 units are checked for thermal stability before starting the 20:00 shift. Refer to the troubleshooting docs if the warning LED flashes. We must keep our compliance scores above 95% this quarter.',
            timestamp: '10:42 AM',
            date: 'Today',
            priority: 'high',
            read: false,
            folder: 'inbox'
          },
          {
            sender: 'Sarah Miller',
            sender_role: 'engineer',
            recipient: 'manager@opsync.com',
            subject: 'Sync-Engine-9000 calibration complete',
            body: 'Just completed the alignment calibration on unit 3. The throughput is now steady at 98.4%. Please monitor the database connection. The secondary logger has been rebooted as well.',
            timestamp: '08:15 AM',
            date: 'Today',
            priority: 'normal',
            read: true,
            folder: 'inbox'
          },
          {
            sender: 'Automated System Monitor',
            sender_role: 'system',
            recipient: 'engineers@opsync.com',
            subject: '[WARNING] Database Connection Timeout',
            body: 'Alert: DB Connection latency exceeded 500ms on server node-4. Falling back to primary replica. Investigation ticket raised. System operations remain nominal but redundancy is temporarily degraded.',
            timestamp: 'Yesterday',
            date: 'Yesterday',
            priority: 'critical',
            read: false,
            folder: 'inbox'
          },
          {
            sender: 'Operator Dave',
            sender_role: 'operator',
            recipient: 'manager@opsync.com',
            subject: 'Refuse Bin Overflow on Row D',
            body: 'Row D bin is full of metal filings. Requesting the facility team to clear it during the shift handover. Thanks!',
            timestamp: 'Yesterday',
            date: 'Yesterday',
            priority: 'low',
            read: true,
            folder: 'inbox'
          }
        ];

        for (const email of initialEmails) {
          await fetch('http://127.0.0.1:8000/api/emails/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(email)
          });
        }
        
        // Re-fetch seeded emails
        const refetch = await fetch('http://127.0.0.1:8000/api/emails/');
        data = await refetch.json();
      }

      // Map DRF model fields to frontend structure
      const mapped = data.map(e => ({
        id: e.id,
        sender: e.sender,
        senderRole: e.sender_role,
        recipient: e.recipient,
        subject: e.subject,
        body: e.body,
        timestamp: e.timestamp,
        date: e.date,
        priority: e.priority,
        read: e.read,
        folder: e.folder
      }));
      res.json(mapped);
    } else {
      res.status(response.status).json({ error: 'Failed to fetch emails from Django backend' });
    }
  } catch (err) {
    console.error('Error fetching emails from Django:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/emails', async (req, res) => {
  const { sender, senderRole, recipient, subject, body, timestamp, date, priority, read, folder } = req.body;
  const djangoPayload = {
    sender: sender || 'Admin Supervisor',
    sender_role: senderRole || 'manager',
    recipient: recipient || 'staff@opsync.com',
    subject: subject || 'No Subject',
    body: body || '',
    timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: date || 'Today',
    priority: priority || 'normal',
    read: read || false,
    folder: folder || 'inbox'
  };

  try {
    const response = await fetch('http://127.0.0.1:8000/api/emails/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(djangoPayload)
    });

    if (response.ok) {
      const createdEmail = await response.json();
      res.json({
        id: createdEmail.id,
        sender: createdEmail.sender,
        senderRole: createdEmail.sender_role,
        recipient: createdEmail.recipient,
        subject: createdEmail.subject,
        body: createdEmail.body,
        timestamp: createdEmail.timestamp,
        date: createdEmail.date,
        priority: createdEmail.priority,
        read: createdEmail.read,
        folder: createdEmail.folder
      });
    } else {
      res.status(response.status).json({ error: 'Failed to save email to Django backend' });
    }
  } catch (err) {
    console.error('Error creating email in Django:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/emails/:id', async (req, res) => {
  const { id } = req.params;
  const { read, folder } = req.body;
  
  const djangoPayload = {};
  if (read !== undefined) djangoPayload.read = read;
  if (folder !== undefined) djangoPayload.folder = folder;

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/emails/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(djangoPayload)
    });

    if (response.ok) {
      const updatedEmail = await response.json();
      res.json({
        id: updatedEmail.id,
        sender: updatedEmail.sender,
        senderRole: updatedEmail.sender_role,
        recipient: updatedEmail.recipient,
        subject: updatedEmail.subject,
        body: updatedEmail.body,
        timestamp: updatedEmail.timestamp,
        date: updatedEmail.date,
        priority: updatedEmail.priority,
        read: updatedEmail.read,
        folder: updatedEmail.folder
      });
    } else {
      res.status(response.status).json({ error: 'Failed to update email in Django' });
    }
  } catch (err) {
    console.error('Error updating email in Django:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/emails/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/emails/${id}/`, {
      method: 'DELETE'
    });
    if (response.ok) {
      res.json({ success: true });
    } else {
      res.status(response.status).json({ error: 'Failed to delete email from Django' });
    }
  } catch (err) {
    console.error('Error deleting email from Django:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/chatbot/sessions', (req, res) => {
  res.json(chatSessions);
});

// AI Chatbot with lazy initialized Gemini API
let aiClient = null;
function getGemini() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: key || 'dummy_api_key_fallback',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

app.post('/api/chatbot/message', async (req, res) => {
  const { message, sessionId, image } = req.body;

  // Find or create session
  const finalSessionId = sessionId || 'session-1';
  let session = chatSessions.find(s => s.id === finalSessionId);
  if (!session) {
    session = {
      id: finalSessionId,
      workerId: 'T-492',
      messages: [],
      createdAt: new Date().toISOString()
    };
    chatSessions.push(session);
  }

  // Push user message
  const userMsg = {
    id: Math.random().toString(),
    role: 'user',
    content: message,
    timestamp: new Date().toLocaleTimeString(),
    image
  };
  session.messages.push(userMsg);

  // Read troubleshooting docs from markdown file dynamically
  const troubleshootingDocsPath = path.join(process.cwd(), 'frontend', 'Opsync', 'public', 'troubleshooting_docs.md');
  let troubleshootingDocs = '';
  try {
    troubleshootingDocs = fs.readFileSync(troubleshootingDocsPath, 'utf8');
  } catch (err) {
    console.error('Could not read troubleshooting docs:', err);
  }

  const systemInstruction = `You are opp sync Assistant, an AI maintenance helper.
You must ONLY answer questions using the information provided in the troubleshooting guide below.
Do NOT use any other knowledge. Do NOT make up answers.
If the answer to the user's question cannot be found or clearly inferred from the troubleshooting guide, you MUST respond exactly with: "I cannot answer this question based on the troubleshooting guide." and nothing else.

Troubleshooting Guide:
${troubleshootingDocs}`;

  try {
    let aiResponseText = '';
    const key = process.env.GEMINI_API_KEY;
    let useFallback = !key || key === 'MY_GEMINI_API_KEY';

    if (!useFallback) {
      try {
        const payload = {
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [
            {
              parts: []
            }
          ],
          generationConfig: {
            temperature: 0.2
          }
        };

        if (image) {
          const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            payload.contents[0].parts.push({
              inlineData: {
                data: matches[2],
                mimeType: matches[1]
              }
            });
          }
        }

        payload.contents[0].parts.push({ text: message });

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': key
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const resData = await response.json();
          aiResponseText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else {
          console.warn(`Gemini API returned status ${response.status}. Falling back to local troubleshooting matcher.`);
          useFallback = true;
        }
      } catch (err) {
        console.error('Gemini API call failed, falling back to local matcher:', err);
        useFallback = true;
      }
    }

    if (useFallback) {
      // Offline fallback simulator to respond instantly based on troubleshooting guide
      const lower = message.toLowerCase();
      if (lower.includes('blinking red') || lower.includes('status led') || lower.includes('red led')) {
        aiResponseText = "The blinking red LED indicates a database connection timeout. Check if the database instance is running and verify the login credentials in the configuration file.";
      } else if (lower.includes('restart')) {
        aiResponseText = "Press and hold the manual power button on the front panel for 5 seconds, or execute the command `opsync restart` from the admin terminal.";
      } else if (lower.includes('disk full') || lower.includes('clean-logs') || lower.includes('clean logs')) {
        aiResponseText = "Clean up log files by running the clean command: `opsync clean-logs`. You can also configure log rotation in `opsync.config.json`.";
      } else if (lower.includes('conflict') || lower.includes('sync conflict')) {
        aiResponseText = "Access the conflict resolution panel, choose between 'last-write-wins' or manual merge. You can also specify the default policy in the schema configuration under `conflictResolution`.";
      } else if (lower.includes('solid blue') || lower.includes('blue light')) {
        aiResponseText = "A solid blue light indicates that the machine is successfully connected, operational, and actively syncing tables.";
      } else if (lower.includes('mark franco')) {
        aiResponseText = "Mark Franco is the owner of Sync-Engine-9000 machine.";
      } else if (lower.includes('omkar') || lower.includes('pedenakar')) {
        aiResponseText = "Mark Fenandes is the engineer of Sync-Engine-9000 machine.";
      } else {
        aiResponseText = "I cannot answer this question based on the troubleshooting guide.";
      }
    }

    const cannotAnswer = aiResponseText.toLowerCase().includes("cannot answer this question") || 
                         aiResponseText.toLowerCase().includes("cannot answer based on the troubleshooting guide");

    const aiMsg = {
      id: Math.random().toString(),
      role: 'assistant',
      content: aiResponseText,
      timestamp: new Date().toLocaleTimeString(),
      cannot_answer: cannotAnswer
    };
    session.messages.push(aiMsg);

    res.json({
      response_text: aiResponseText,
      cannot_answer: cannotAnswer
    });

  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: 'AI Chat API error: ' + err.message });
  }
});


// Serve React app
async function startServer() {
  const server = http.createServer(app);

  // Set up WebSocket server attached to the HTTP server
  const wss = new WebSocketServer({ noServer: true });
  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  server.on('upgrade', (request, socket, head) => {
    const pathname = url.parse(request.url || '').pathname;
    if (pathname === '/ws/factory/') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Enable Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`opp sync backend running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
