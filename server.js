import express from 'express';
import path from 'path';
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

app.get('/api/tickets', (req, res) => {
  res.json(tickets);
});

app.post('/api/tickets', (req, res) => {
  const { machineId, machineName, reportedBy, issueDescription, severity } = req.body;
  const newTicket = {
    id: `TKT-${Math.floor(8800 + Math.random() * 1100)}`,
    machineId,
    machineName: machineName || (machines.find(m => m.id === machineId)?.name || 'Unknown Machine'),
    reportedBy: reportedBy || 'System Watchdog',
    issueDescription,
    severity: severity || 'complex',
    status: 'open',
    createdAt: new Date().toISOString(),
    checklist: [
      { text: 'Diagnostics review', done: false },
      { text: 'Resolve underlying issues', done: false }
    ]
  };
  tickets.unshift(newTicket);
  broadcast({
    type: 'ticket.created',
    payload: newTicket
  });
  res.json(newTicket);
});

app.patch('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const update = req.body;
  tickets = tickets.map(t => t.id === id ? { ...t, ...update } : t);
  const updatedTicket = tickets.find(t => t.id === id);
  res.json(updatedTicket);
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

app.get('/api/dashboard/summary', (req, res) => {
  const total = machines.length;
  const online = machines.filter(m => m.status === 'online' || m.status === 'warning').length;
  const activeWorkers = Object.keys(workerLocations).length;
  const openCount = tickets.filter(t => t.status !== 'resolved').length;
  const criticalCount = tickets.filter(t => t.status !== 'resolved' && t.severity === 'critical').length;

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

  // Ready system instruction list of machines
  const machineListStr = machines.map(m => `${m.name} (ID: ${m.id}, Zone: ${m.locationZone}, Health Score: ${m.healthScore}, Status: ${m.status})`).join('\n');

  const systemInstruction = `You are SmartFactory Assistant, an AI maintenance helper.
Available machines on the factory floor:
${machineListStr}

When a worker reports an issue:
1. Identify the machine and failure pattern
2. Classify severity: SIMPLE (worker can self-fix) | MODERATE (supervisor needed) | COMPLEX (engineer required)
3. SIMPLE: return numbered steps (max 5). Start response with "SEVERITY: SIMPLE"
4. COMPLEX: brief diagnosis only. Start response with "SEVERITY: COMPLEX"
Safety first. Be concise. Never advise actions that risk physical harm.`;

  try {
    let aiResponseText = '';
    const key = process.env.GEMINI_API_KEY;

    if (!key || key === 'MY_GEMINI_API_KEY') {
      // Offline fallback simulator to respond instantly to instructions without crash
      const lower = message.toLowerCase();
      if (lower.includes('axis 4') || lower.includes('temperature') || lower.includes('sensor')) {
        aiResponseText = `SEVERITY: COMPLEX\n\nThermal anomaly detected on Spindle Bearing Assembly of CNC Axis 4. Friction coefficients are rising rapidly. Immediate inspection and possible bearing replacement required to avoid mechanical seizure. I will generate a formal Maintenance ticket for you.`;
      } else {
        aiResponseText = `SEVERITY: SIMPLE\n\n1. Locate standard calibration tool on shelf.\n2. Set alignment mode to automatic.\n3. Calibrate sensory reference lines.\n4. Complete and save logs.\n5. Verify nominal green indicator lights.`;
      }
    } else {
      const modelName = 'gemini-3.5-flash';
      const promptParts = [];

      // Append image if provided in base64
      if (image) {
        // e.g. data:image/png;base64,iVBORw...
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          promptParts.push({
            inlineData: {
              data: matches[2],
              mimeType: matches[1]
            }
          });
        }
      }

      promptParts.push({ text: message });

      const response = await getGemini().models.generateContent({
        model: modelName,
        contents: promptParts,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7
        }
      });
      aiResponseText = response.text || '';
    }

    // Determine severity from response
    let severity = 'SIMPLE';
    if (aiResponseText.includes('SEVERITY: COMPLEX')) {
      severity = 'COMPLEX';
    } else if (aiResponseText.includes('SEVERITY: MODERATE')) {
      severity = 'MODERATE';
    }

    let createdTicketId;

    if (severity === 'COMPLEX') {
      // Auto-create ticket
      const newTkt = {
        id: `TKT-${Math.floor(8800 + Math.random() * 1100)}`,
        machineId: 'M-402',
        machineName: 'CNC Axis 4',
        reportedBy: 'AI Chatbot triage',
        issueDescription: message,
        severity: 'critical',
        status: 'open',
        aiAssessment: aiResponseText,
        createdAt: new Date().toISOString(),
        checklist: [
          { text: 'Diagnostics review', done: false },
          { text: 'Resolve Axis 4 temperature spill', done: false }
        ]
      };
      tickets.unshift(newTkt);
      createdTicketId = newTkt.id;

      broadcast({
        type: 'ticket.created',
        payload: newTkt
      });
    }

    const aiMsg = {
      id: Math.random().toString(),
      role: 'assistant',
      content: aiResponseText,
      timestamp: new Date().toLocaleTimeString()
    };
    session.messages.push(aiMsg);

    res.json({
      response_text: aiResponseText,
      severity,
      ticket_id: createdTicketId
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
    console.log(`SmartFactory backend running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
