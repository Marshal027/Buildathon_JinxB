export interface User {
  id: string;
  username: string;
  role: 'admin' | 'manager' | 'engineer' | 'worker';
  department?: string;
  phoneToken?: string;
  profilePic?: string;
}

export interface Machine {
  id: string; // e.g. M-402, P-114
  name: string;
  locationZone: string; // e.g. A-1, B-2
  healthScore: number; // 0-100
  status: 'online' | 'warning' | 'offline' | 'maintenance';
  uptimeHours: number;
  lastServiceDate: string;
  modelPosition?: { x: number; y: number; z: number };
  temp?: number;
  vibration?: number;
  pressure?: number;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  clockIn: string;
  clockOut?: string;
  locationLat: number;
  locationLng: number;
  isValid: boolean;
}

export interface MaintenanceTicket {
  id: string; // TKT-XXXX
  machineId: string;
  machineName: string;
  reportedBy: string; // name
  assignedTo?: string; // name
  issueDescription: string;
  aiAssessment?: string;
  severity: 'low' | 'complex' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  checklist?: { text: string; done: boolean }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  image?: string; // base64 inline or path
}

export interface ChatSession {
  id: string;
  workerId: string;
  machineId?: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface DashboardSummary {
  productivity: number;
  personnelActive: number;
  machinesOnline: number;
  machinesTotal: number;
  openTickets: number;
  criticalTickets: number;
}

export interface ServerEvent {
  type: 'machine.status.update' | 'worker.location.update' | 'ticket.created' | 'alert.sos' | 'alert.broadcast' | 'attendance.update';
  payload: any;
}
