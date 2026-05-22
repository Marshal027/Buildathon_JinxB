# SmartFactory 360°
**Product Requirements Document • Software Requirements Specification • Build Guide**

**Hackathon: SOLO Manufacturing Live Project**  
Theme: Industrial Workflow Optimization using AI & Automation  
Stack: React (Frontend) • Django (Backend)  
Version 1.0 | May 2026

---

# PART 1 — Product Requirements Document (PRD)

## 1.1 Product Overview

SmartFactory 360° is an integrated smart factory management platform that digitizes the factory floor through a real-time 3D digital twin, AI-powered maintenance intelligence, mobile worker tracking, and a manager operations dashboard. The platform is designed to eliminate paper-based processes, reduce machine downtime, and give managers live visibility into every moving part of the factory.

> **Mission Statement:** Bridge the gap between physical factory operations and real-time digital intelligence — enabling faster decisions, fewer breakdowns, and a more productive workforce.

---

## 1.2 Target Users & Personas

| Persona | Role | Primary Pain Point | Value Delivered |
|---|---|---|---|
| Factory Manager | Oversight & decisions | No real-time visibility into floor activity | Live dashboard + alerts |
| Factory Worker | Machine operation | Unclear how to handle machine issues | AI chatbot guidance |
| Maintenance Engineer | Repairs & upkeep | Reactive, not proactive maintenance | Predictive ticket system |
| HR / Admin | Attendance & records | Manual attendance tracking | Auto attendance via app |

---

## 1.3 Core Product Components

### Component 1 — 3D Factory Environment (Web)

A web-based interactive 3D digital twin of the factory floor.

- Every machine and worker represented as a 3D object in real-time
- Clicking a machine: shows health score, uptime %, current status, last maintenance date, active alerts
- Clicking a worker: shows name, role, current task, location zone, attendance status
- Color-coded status overlays (green = OK, amber = warning, red = critical)
- Live data feeds via WebSocket — updates every 5–10 seconds
- Zoom, pan, rotate controls; floor plan importable from CAD/SVG

### Component 2 — AI Maintenance Chatbot

An AI-powered chatbot accessible to workers via web and mobile.

- Workers describe the issue in natural language
- AI triages the issue into Simple / Moderate / Complex
- Simple: provides step-by-step self-resolution guide
- Moderate: escalates with a guided checklist and notifies supervisor
- Complex: auto-creates a support ticket, notifies manager, logs to maintenance history
- Supports image uploads (photo of the issue) for better diagnosis
- Multi-language support for diverse workforce

### Component 3 — Mobile Attendance & Tracking App

A React Native / PWA mobile application for workers.

- GPS + BLE beacon-based indoor positioning to track worker location zones
- One-tap clock-in / clock-out with geofence validation (must be on-site)
- Push notifications for task assignments, safety alerts, chatbot replies
- Offline-first design — queues data when connectivity is poor
- Workers can view their own schedule, shift hours, and task history

### Component 4 — Manager Dashboard (Web)

A web dashboard providing full operational visibility.

- Live KPI tiles: active workers, machines online, open tickets, productivity index
- Attendance heatmap: who is present, absent, late
- Machine status table: sortable by health score, last maintenance, active issues
- Maintenance ticket queue: assign, prioritize, close tickets
- Worker productivity metrics: tasks completed, time-on-floor, idle time
- Exportable reports (PDF/CSV) for shift summaries

---

## 1.4 Recommended Additional Features (Hackathon Scope)

| Feature | Component | Impact | Effort |
|---|---|---|---|
| Anomaly alert feed (real-time) | Dashboard + 3D View | High | Medium |
| Predictive maintenance scoring | AI Chatbot + Dashboard | High | Medium |
| Worker safety SOS button | Mobile App | High | Low |
| Shift scheduling module | Dashboard | Medium | Medium |
| Voice input for chatbot | AI Chatbot | Medium | Low |
| QR code machine identification | Mobile App | Medium | Low |
| Productivity leaderboard (gamification) | Dashboard + Mobile | Medium | Low |
| Energy consumption monitoring widget | Dashboard | Medium | High |

---

## 1.5 Success Metrics (KPIs)

| Metric | Target | Measurement |
|---|---|---|
| Machine downtime reduction | 30% decrease | Ticket resolution time |
| Attendance tracking accuracy | >95% | GPS checkin vs manual log |
| Chatbot issue self-resolution rate | >50% | Resolved without ticket creation |
| Manager response time to alerts | <5 minutes | Alert-to-action timestamp |
| Worker app adoption rate | >80% of workforce | Daily active users |

---

## 1.6 Constraints & Assumptions

- Hackathon scope: MVP functionality only — production hardening is post-hackathon
- Workers have Android or iOS smartphones with location services enabled
- Factory has WiFi coverage; BLE beacons optional for indoor precision
- Backend hosted on a single server/cloud VM during the hackathon demo
- 3D environment uses a pre-built factory floor layout (no live CAD import required)
- AI chatbot powered by LLM API (e.g., Claude API) — no custom model training

---

# PART 2 — Software Requirements Specification (SRS)

## 2.1 System Architecture Overview

SmartFactory 360° follows a client-server architecture with real-time communication layers:

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend (Web) | React 18 + Three.js + Tailwind CSS | 3D viewer, dashboard, chatbot UI |
| Frontend (Mobile) | React Native / PWA | Worker app, attendance, notifications |
| Backend API | Django 5 + Django REST Framework | Business logic, auth, data management |
| Real-time Layer | Django Channels + Redis | WebSocket for live updates |
| AI Integration | Anthropic Claude API (claude-sonnet-4) | Chatbot intelligence, issue triage |
| Database | PostgreSQL | Primary data store |
| Cache / Broker | Redis | Session cache, task queue, WS broker |
| Task Queue | Celery + Redis | Async jobs, notifications, report gen |
| File Storage | AWS S3 / MinIO | Image uploads, report exports |
| Auth | Django SimpleJWT | JWT-based authentication |

---

## 2.2 Functional Requirements

### FR-01: Authentication & Authorization

- FR-01.1: System shall support role-based access (Worker, Manager, Admin, Maintenance Engineer)
- FR-01.2: Workers authenticate via mobile app using email/PIN or QR scan
- FR-01.3: Managers authenticate via web using email + password with JWT tokens
- FR-01.4: Token refresh every 24 hours; refresh token valid for 7 days
- FR-01.5: API endpoints protected by role middleware

### FR-02: 3D Factory Environment

- FR-02.1: Render a 3D factory floor model using Three.js with machine and worker nodes
- FR-02.2: Machine nodes shall display real-time status via color overlay (green/amber/red)
- FR-02.3: Worker nodes shall update position every 10 seconds based on mobile GPS data
- FR-02.4: Click on machine → side panel shows: ID, name, health %, uptime %, last service date, active alerts
- FR-02.5: Click on worker → side panel shows: name, role, zone, shift status, current task
- FR-02.6: 3D scene shall support orbit controls (pan/zoom/rotate)
- FR-02.7: System shall support at minimum 50 concurrent machine nodes and 100 worker nodes

### FR-03: AI Maintenance Chatbot

- FR-03.1: Chat interface accessible on web and mobile
- FR-03.2: Worker submits issue description; system sends to Claude API with factory context in system prompt
- FR-03.3: AI response classifies issue as Simple / Moderate / Complex
- FR-03.4: Simple issues: AI returns step-by-step resolution guide (max 5 steps)
- FR-03.5: Complex issues: system auto-creates a MaintenanceTicket record in database
- FR-03.6: Ticket creation triggers real-time notification to Manager dashboard via WebSocket
- FR-03.7: Worker can attach an image (JPEG/PNG, max 5MB) to provide visual context
- FR-03.8: All chat sessions stored with timestamps for audit trail
- FR-03.9: AI system prompt shall include: machine list, common failure modes, resolution SOPs

### FR-04: Mobile Attendance & Tracking

- FR-04.1: Workers clock-in via mobile app; GPS coordinates recorded and validated against factory geofence
- FR-04.2: Geofence defined as a polygon or circular radius around factory address (configurable in Admin)
- FR-04.3: Location updates sent to server every 30 seconds while worker is clocked in
- FR-04.4: App caches location data offline for up to 2 hours if connectivity lost; syncs on reconnect
- FR-04.5: Push notifications delivered via FCM (Firebase Cloud Messaging)
- FR-04.6: Workers receive notifications for: task assignments, chatbot replies, safety broadcasts
- FR-04.7: SOS button sends instant alert to all managers with worker name, location, and timestamp
- FR-04.8: Workers can view their own attendance history and shift schedule

### FR-05: Manager Dashboard

- FR-05.1: Dashboard loads within 3 seconds; live data tiles update via WebSocket
- FR-05.2: KPI header: Total workers present, machines online, open tickets, productivity index
- FR-05.3: Attendance panel: list view with filter by date, department, shift
- FR-05.4: Machine health table: sortable/filterable columns for ID, name, status, health score, uptime, last service
- FR-05.5: Ticket queue: view, assign to engineer, update status (Open / In Progress / Resolved)
- FR-05.6: Manager can broadcast safety messages to all workers (push notification + in-app alert)
- FR-05.7: Shift summary report exportable as PDF and CSV
- FR-05.8: Alert log: chronological feed of all system alerts (machine anomalies, SOS, ticket creates)

### FR-06: Predictive Maintenance (Recommended)

- FR-06.1: Machine health score computed from: uptime hours since last service, reported issue count, anomaly flag
- FR-06.2: Machines with health score below threshold (configurable, default 60%) auto-flagged for service
- FR-06.3: AI chatbot uses health score context when triaging reported issues
- FR-06.4: Dashboard displays 7-day health trend sparklines per machine

---

## 2.3 Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Performance | API response time < 500ms for 95th percentile under 100 concurrent users |
| NFR-02 | Real-time | WebSocket updates delivered within 2 seconds of data change |
| NFR-03 | Availability | System uptime ≥ 99% during hackathon demo window |
| NFR-04 | Security | All API endpoints require JWT; passwords hashed with bcrypt; HTTPS enforced |
| NFR-05 | Scalability | Architecture supports horizontal scaling of Django via Gunicorn + Nginx |
| NFR-06 | Mobile | Mobile PWA loads in < 4 seconds on 4G connection |
| NFR-07 | Usability | Worker app requires no more than 3 taps for any primary action |
| NFR-08 | Data Retention | Attendance and ticket records retained for minimum 90 days |
| NFR-09 | Accessibility | Dashboard meets WCAG 2.1 AA contrast ratios |
| NFR-10 | Offline | Mobile app functions for attendance and SOS with no internet for up to 2 hours |

---

## 2.4 Core Data Models

### User

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | VARCHAR(100) | Full name |
| email | VARCHAR(150) | Unique, login identifier |
| role | ENUM | worker │ manager │ engineer │ admin |
| department | FK → Department | |
| phone_token | VARCHAR(255) | FCM push token |
| created_at | TIMESTAMP | |

### Machine

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | VARCHAR(100) | e.g., CNC Mill #3 |
| location_zone | VARCHAR(50) | Floor zone ID |
| health_score | INTEGER (0–100) | Computed field |
| status | ENUM | online │ warning │ offline │ maintenance |
| uptime_hours | FLOAT | Hours since last reset |
| last_service_date | DATE | |
| model_position | JSON | {x, y, z} for 3D scene |

### AttendanceRecord

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| worker | FK → User | |
| clock_in | TIMESTAMP | |
| clock_out | TIMESTAMP | Nullable |
| location_lat | FLOAT | Clock-in GPS lat |
| location_lng | FLOAT | Clock-in GPS lng |
| is_valid | BOOLEAN | Geofence validation result |

### MaintenanceTicket

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| machine | FK → Machine | |
| reported_by | FK → User | |
| assigned_to | FK → User | Nullable — maintenance engineer |
| issue_description | TEXT | Original worker report |
| ai_assessment | TEXT | AI triage output |
| severity | ENUM | simple │ moderate │ complex |
| status | ENUM | open │ in_progress │ resolved |
| image_url | VARCHAR(255) | Nullable |
| created_at | TIMESTAMP | |
| resolved_at | TIMESTAMP | Nullable |

### WorkerLocation

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| worker | FK → User | |
| latitude | FLOAT | |
| longitude | FLOAT | |
| zone | VARCHAR(50) | Computed from coordinates |
| timestamp | TIMESTAMP | |

---

## 2.5 Key API Endpoints

| Method | Endpoint | Auth Role | Description |
|---|---|---|---|
| POST | /api/auth/login/ | Public | Login, returns JWT |
| POST | /api/auth/refresh/ | Public | Refresh JWT |
| GET | /api/machines/ | Manager, Engineer | List all machines with status |
| PATCH | /api/machines/{id}/ | Manager, Engineer | Update machine status |
| GET | /api/attendance/ | Manager | List attendance records (filter by date/worker) |
| POST | /api/attendance/checkin/ | Worker | Clock in with GPS coords |
| POST | /api/attendance/checkout/ | Worker | Clock out |
| GET/POST | /api/tickets/ | All | List tickets / create ticket |
| PATCH | /api/tickets/{id}/ | Manager, Engineer | Update ticket status/assignee |
| POST | /api/chatbot/message/ | Worker | Send message to AI chatbot |
| GET | /api/workers/locations/ | Manager | Get current worker locations |
| POST | /api/alerts/sos/ | Worker | Trigger SOS alert |
| POST | /api/notifications/broadcast/ | Manager | Broadcast push to all workers |
| GET | /api/dashboard/summary/ | Manager | Aggregated KPI data |
| GET | /api/reports/shift/ | Manager | Generate shift summary report |

---

## 2.6 WebSocket Event Schema

| Event | Direction | Payload Summary |
|---|---|---|
| machine.status.update | Server → Client | { machine_id, status, health_score, timestamp } |
| worker.location.update | Server → Client | { worker_id, lat, lng, zone, timestamp } |
| ticket.created | Server → Client | { ticket_id, machine_id, severity, reported_by } |
| alert.sos | Server → Client | { worker_id, name, lat, lng, timestamp } |
| alert.broadcast | Server → Client | { message, priority, sent_by } |
| attendance.update | Server → Client | { worker_id, event: clock_in│clock_out, timestamp } |

---

## 2.7 AI Chatbot — System Prompt Design

> **Chatbot System Prompt Template**
>
> You are SmartFactory Assistant, an AI maintenance helper for factory workers. You have access to the factory's machine list, common failure modes, and standard operating procedures (SOPs). When a worker reports an issue:
> 1. Identify the machine and failure pattern.
> 2. Classify severity: SIMPLE (worker can fix), MODERATE (supervisor review needed), COMPLEX (engineer required).
> 3. For SIMPLE: provide a numbered self-resolution guide of max 5 steps.
> 4. For COMPLEX: respond with severity=COMPLEX and a brief diagnosis; the system will auto-create a ticket.
>
> Always be concise, clear, and safety-first. Never advise actions that could cause physical harm.

---

# PART 3 — Step-by-Step Build Guide

Development roadmap for a solo developer or small team. Each phase is designed as a standalone working increment. Estimated hours are for a hackathon sprint pace.

---

## Phase 1 — Project Scaffold & Auth (Hours 0–4)

| Step | Task | Command / Detail |
|---|---|---|
| 1.1 | Create Django project | `django-admin startproject smartfactory_backend` |
| 1.2 | Create React app | `npx create-react-app smartfactory-web --template typescript` |
| 1.3 | Install Django deps | `pip install djangorestframework djangorestframework-simplejwt channels redis celery psycopg2 pillow anthropic` |
| 1.4 | Install React deps | `npm install three @react-three/fiber @react-three/drei tailwindcss axios react-query socket.io-client` |
| 1.5 | Configure PostgreSQL | Update `settings.py` DATABASES block with pg credentials |
| 1.6 | Create User model | Custom AbstractUser with role field (worker/manager/engineer/admin) |
| 1.7 | JWT Auth endpoints | Configure SimpleJWT: `/api/auth/login/`, `/api/auth/refresh/` |
| 1.8 | CORS setup | Install django-cors-headers; allow localhost:3000 |
| 1.9 | Test auth flow | Postman: login → get token → call protected endpoint |

---

## Phase 2 — Core Data Models & APIs (Hours 4–8)

- Create Django apps: `machines`, `attendance`, `tickets`, `workers`, `notifications`
- Define models: Machine, AttendanceRecord, MaintenanceTicket, WorkerLocation (see Section 2.4)
- Run migrations: `python manage.py makemigrations && migrate`
- Create serializers (ModelSerializer) for each model
- Create ViewSets with router registration in `urls.py`
- Seed database with factory fixture data (10 machines, 20 workers) for demo
- Add filtering (django-filter) to attendance and tickets endpoints
- Test all CRUD endpoints via Postman / DRF browsable API

---

## Phase 3 — Real-time Layer: Django Channels (Hours 8–11)

- Install channels: `pip install channels channels-redis`
- Configure ASGI in `asgi.py` with ProtocolTypeRouter for HTTP and WebSocket
- Create `FactoryConsumer` in `consumers.py` — group broadcast on connect
- Create group names: `factory_floor` (managers), `worker_{id}` (per worker)
- Wire routing in `routing.py`: `ws/factory/` → FactoryConsumer
- Create utility function: `channel_layer.group_send()` triggered from Django signals
- Add Django signals on `Machine.save()` and `MaintenanceTicket.save()` to broadcast WS events
- Test WebSocket connection using wscat or browser console

---

## Phase 4 — AI Chatbot Backend (Hours 11–14)

- Create chatbot app with `ChatSession` and `ChatMessage` models
- Create `/api/chatbot/message/` endpoint (POST, Worker auth required)
- Install Anthropic SDK: `pip install anthropic`
- Build `chatbot_service.py`: loads machine context from DB, builds system prompt, calls Claude API
- Parse AI response for severity classification keyword (SIMPLE / MODERATE / COMPLEX)
- If COMPLEX: auto-create MaintenanceTicket, trigger WebSocket `ticket.created` event to managers
- Store ChatMessage (user + assistant) to ChatSession for history
- Handle image uploads: save to S3/MinIO, pass URL to Claude API as image content block
- Add rate limiting: max 20 chatbot messages per worker per hour

---

## Phase 5 — 3D Factory Environment (Hours 14–20)

- Create React component: `FactoryScene` using `@react-three/fiber` `<Canvas>`
- Build factory floor as a flat plane with grid texture
- Create `MachineNode` component: colored box with StatusIndicator (green/amber/red point light)
- Create `WorkerNode` component: cylinder + label using `@react-three/drei` `<Html>`
- Implement click handlers: `onMachineClick` / `onWorkerClick` → set `selectedEntity` state
- Create `InfoPanel` component (right sidebar): shows entity details on selection
- Connect to WebSocket: `useEffect` subscribes to `machine.status.update` and `worker.location.update`
- On WS message: update machine/worker state → Three.js re-renders color/position
- Add `OrbitControls` from drei for pan/zoom/rotate
- Style with Tailwind dark theme glass-panel sidebar

---

## Phase 6 — Manager Dashboard (Hours 20–25)

- Create Dashboard layout: top KPI bar + grid of panels
- KPI bar: fetch `/api/dashboard/summary/` — display workers present, machines online, open tickets, productivity
- Real-time updates: connect WebSocket, update KPI tiles on relevant events
- Attendance table: react-query fetch `/api/attendance/`, add date filter + department filter
- Machine health table: sortable columns, health score shown as colored progress bar
- Ticket queue: list with status badges, assign dropdown (fetch engineers), status update button
- Alert feed: live-updating list of WebSocket events (ticket created, SOS, machine warnings)
- Broadcast modal: text input → POST `/api/notifications/broadcast/`
- Export buttons: `/api/reports/shift/?format=csv` and `?format=pdf` (Celery task generates PDF)

---

## Phase 7 — Mobile Attendance App (Hours 25–30)

- Create React Native app (Expo) or PWA with `manifest.json` for install prompt
- Worker login screen: email + PIN → POST `/api/auth/login/` → store JWT in AsyncStorage
- Home screen: Clock In / Clock Out button + current status
- Clock In: call `navigator.geolocation.getCurrentPosition()` → POST `/api/attendance/checkin/`
- If outside geofence: show error "You must be on-site to clock in"
- Background location: use `Expo Location.startLocationUpdatesAsync()` every 30 seconds while clocked in
- SOS button: prominent red button → POST `/api/alerts/sos/` with current GPS
- Chatbot tab: WebView or native chat UI → connects to chatbot API
- Push notifications: configure FCM, store device token on login via `PATCH /api/users/me/`
- My Schedule tab: `GET /api/workers/{id}/schedule/` → list upcoming shifts

---

## Phase 8 — Integration & Demo Prep (Hours 30–36)

- End-to-end test all user journeys (Worker clock-in → appears on 3D view → Manager sees it)
- Test chatbot triage: submit complex issue → verify ticket appears on manager dashboard in real-time
- Test SOS: trigger from mobile → verify manager alert appears within 2 seconds
- Seed realistic demo data: 15 workers, 8 machines, 5 historical tickets, varied attendance
- Deploy Django to Railway / Render / DigitalOcean with Gunicorn + Nginx
- Deploy React to Vercel or Netlify
- Configure env vars: `ANTHROPIC_API_KEY`, `DATABASE_URL`, `REDIS_URL`, FCM credentials
- Rehearse demo flow: login as worker → chatbot → auto-ticket → switch to manager → see ticket live

---

## Phase 9 — Bonus Features (If Time Allows)

| Feature | Effort | Where to Add |
|---|---|---|
| QR code machine scan (worker scans → chatbot pre-fills machine) | 2 hrs | Mobile App + Chatbot |
| Predictive maintenance score algorithm | 3 hrs | machines/services.py + Dashboard |
| Worker productivity leaderboard | 2 hrs | Dashboard panel |
| Voice input for chatbot (Web Speech API) | 1 hr | Chatbot UI |
| Dark/light mode toggle on Dashboard | 1 hr | Tailwind + Context |
| Animated machine pulse on 3D view for active alerts | 1 hr | Three.js animation loop |

---

## Technology Stack Summary

| Layer | Technology | Version / Notes |
|---|---|---|
| Frontend Web | React + TypeScript | v18 — Vite or CRA |
| 3D Rendering | Three.js + R3F | @react-three/fiber ^8 |
| UI Styling | Tailwind CSS | v3 |
| State / Data | React Query + Zustand | Server state + client state |
| Mobile | Expo (React Native) or PWA | Expo SDK 50+ |
| Backend | Django + DRF | Django 5.x |
| Real-time | Django Channels + Redis | channels 4.x |
| AI | Anthropic Claude API | claude-sonnet-4-20250514 |
| Task Queue | Celery | v5.x with Redis broker |
| Database | PostgreSQL | v16 |
| Deployment | Railway / Render + Vercel | Free tier sufficient for hackathon |
| CI (optional) | GitHub Actions | Lint + test on push |

---

> **Hackathon Demo Tip:** Lead with the 3D factory view — it's visually striking and immediately communicates the concept. Demo the end-to-end flow: worker reports an issue via chatbot → ticket appears on manager dashboard in real-time. This single flow demonstrates AI, real-time data, and the manager-worker loop in under 60 seconds.

---

*Confidential — Hackathon Use Only*
