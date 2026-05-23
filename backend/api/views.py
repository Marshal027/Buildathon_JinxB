import os
import math
import random
import json
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from google import genai
from google.genai import types

from api.models import Machine, Ticket, LiveAlert, Attendance, WorkerLocation, ChatSession, ChatMessage, CameraFrame
from api.serializers import (
    MachineSerializer, TicketSerializer, AttendanceSerializer,
    WorkerLocationSerializer, LiveAlertSerializer, ChatSessionSerializer
)
from api.utils import seed_db, ws_broadcast

# Ensure DB is seeded on startup
seed_db()

# Geofence configuration
FACTORY_LAT = 37.7749
FACTORY_LNG = -122.4194
FACTORY_RADIUS_METERS = 200

def is_within_geofence(lat, lng):
    R = 6371e3  # Earth radius in meters
    phi1 = (lat * math.pi) / 180
    phi2 = (FACTORY_LAT * math.pi) / 180
    deltaPhi = ((FACTORY_LAT - lat) * math.pi) / 180
    deltaLambda = ((FACTORY_LNG - lng) * math.pi) / 180

    a = (math.sin(deltaPhi / 2) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(deltaLambda / 2) ** 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c

    return distance <= FACTORY_RADIUS_METERS

# Auth endpoints
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(req):
    role = req.data.get('role', 'manager')
    username = req.data.get('username')
    
    if not username:
        username = 'J. Kowalski' if role == 'worker' else 'Admin User'
        
    user = {
        'id': 'T-492' if role == 'worker' else 'Admin-1',
        'username': username,
        'role': role,
        'department': 'Assembly Section A' if role == 'worker' else 'Operations Ctrl'
    }
    return Response({
        'sf_access': 'temp_access_token_123',
        'sf_refresh': 'temp_refresh_token_123',
        'user': user
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_view(req):
    return Response({'sf_access': 'temp_access_token_refreshed'})

@api_view(['GET'])
def me_view(req):
    return Response({
        'user': {
            'id': 'Admin-1',
            'username': 'Admin User',
            'role': 'manager'
        }
    })

# Machines endpoints
@api_view(['GET'])
def machines_list(req):
    machines = Machine.objects.all()
    for m in machines:
        if m.status != 'offline':
            temp_delta = (random.random() - 0.48) * 1.8
            vib_delta = (random.random() - 0.48) * 1.2
            press_delta = random.randint(-2, 2)
            health_delta = random.choice([-1, 0, 0, 0, 1]) if random.random() < 0.1 else 0
            
            m.temp = round(max(15.0, m.temp + temp_delta), 1)
            m.vibration = round(max(0.1, m.vibration + vib_delta), 1)
            if m.pressure > 0:
                m.pressure = max(10, m.pressure + press_delta)
            m.healthScore = max(10, min(100, m.healthScore + health_delta))
            m.save()
            
    serializer = MachineSerializer(machines, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
def machine_detail(req, id):
    try:
        machine = Machine.objects.get(id=id)
    except Machine.DoesNotExist:
        return Response({'error': 'Machine not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = MachineSerializer(machine, data=req.data, partial=True)
    if serializer.is_valid():
        updated_machine = serializer.save()
        ws_broadcast('machine.status.update', MachineSerializer(updated_machine).data)
        return Response(MachineSerializer(updated_machine).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Attendance endpoints
@api_view(['GET'])
def attendance_list(req):
    records = Attendance.objects.all().order_dict_by('-clockIn') if hasattr(Attendance.objects, 'order_dict_by') else Attendance.objects.all().order_by('-clockIn')
    serializer = AttendanceSerializer(records, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def checkin_view(req):
    lat = req.data.get('lat')
    lng = req.data.get('lng')
    workerId = req.data.get('workerId', 'T-492')
    workerName = req.data.get('workerName', 'J. Kowalski')

    if lat is None or lng is None:
        return Response({'error': 'Coordinates required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        lat = float(lat)
        lng = float(lng)
    except ValueError:
        return Response({'error': 'Invalid coordinate values'}, status=status.HTTP_400_BAD_REQUEST)

    is_valid = is_within_geofence(lat, lng)

    new_record = Attendance.objects.create(
        workerId=workerId,
        workerName=workerName,
        locationLat=lat,
        locationLng=lng,
        isValid=is_valid,
        clockIn=timezone.now()
    )

    if is_valid:
        WorkerLocation.objects.update_or_create(
            workerId=workerId,
            defaults={
                'name': workerName,
                'lat': lat,
                'lng': lng,
                'lastUpdate': timezone.now()
            }
        )
        ws_broadcast('attendance.update', {
            'workerId': workerId,
            'name': workerName,
            'event': 'clock_in',
            'timestamp': new_record.clockIn.isoformat()
        })

    return Response(AttendanceSerializer(new_record).data)

@api_view(['POST'])
def checkout_view(req):
    workerId = req.data.get('workerId', 'T-492')
    try:
        record = Attendance.objects.filter(workerId=workerId, clockOut__isnull=True).latest('clockIn')
    except Attendance.DoesNotExist:
        return Response({'error': 'No active clock-in session found'}, status=status.HTTP_400_BAD_REQUEST)

    record.clockOut = timezone.now()
    record.save()

    # Remove location
    WorkerLocation.objects.filter(workerId=workerId).delete()

    ws_broadcast('attendance.update', {
        'workerId': workerId,
        'name': record.workerName,
        'event': 'clock_out',
        'timestamp': record.clockOut.isoformat()
    })

    return Response(AttendanceSerializer(record).data)

# Worker locations endpoints
@api_view(['POST'])
def update_worker_location(req):
    workerId = req.data.get('workerId', 'T-492')
    name = req.data.get('name', 'Worker')
    lat = req.data.get('lat')
    lng = req.data.get('lng')

    if lat is None or lng is None:
        return Response({'error': 'Coordinates required'}, status=status.HTTP_400_BAD_REQUEST)

    loc, created = WorkerLocation.objects.update_or_create(
        workerId=workerId,
        defaults={
            'name': name,
            'lat': lat,
            'lng': lng,
            'lastUpdate': timezone.now()
        }
    )

    ws_broadcast('worker.location.update', {
        'workerId': workerId,
        'name': name,
        'lat': lat,
        'lng': lng,
        'timestamp': loc.lastUpdate.isoformat()
    })

    return Response({'success': True})

@api_view(['GET'])
def worker_locations_list(req):
    locs = WorkerLocation.objects.all()
    serializer = WorkerLocationSerializer(locs, many=True)
    return Response(serializer.data)

# Tickets endpoints
@api_view(['GET', 'POST'])
def tickets_list(req):
    if req.method == 'GET':
        tickets = Ticket.objects.all().order_by('-createdAt')
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data)

    elif req.method == 'POST':
        machineId = req.data.get('machineId')
        machineName = req.data.get('machineName')
        reportedBy = req.data.get('reportedBy', 'System Watchdog')
        issueDescription = req.data.get('issueDescription')
        severity = req.data.get('severity', 'complex')

        if not machineName and machineId:
            try:
                machine = Machine.objects.get(id=machineId)
                machineName = machine.name
            except Machine.DoesNotExist:
                machineName = 'Unknown Machine'

        new_id = f"TKT-{random.randint(8800, 9900)}"
        new_ticket = Ticket.objects.create(
            id=new_id,
            machineId=machineId or 'Unknown',
            machineName=machineName or 'Unknown Machine',
            reportedBy=reportedBy,
            issueDescription=issueDescription or '',
            severity=severity,
            status='open',
            checklist=[
                {'text': 'Diagnostics review', 'done': False},
                {'text': 'Resolve underlying issues', 'done': False}
            ]
        )

        ws_broadcast('ticket.created', TicketSerializer(new_ticket).data)
        return Response(TicketSerializer(new_ticket).data, status=status.HTTP_201_CREATED)

@api_view(['PATCH'])
def ticket_detail(req, id):
    try:
        ticket = Ticket.objects.get(id=id)
    except Ticket.DoesNotExist:
        return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = TicketSerializer(ticket, data=req.data, partial=True)
    if serializer.is_valid():
        updated_ticket = serializer.save()
        ws_broadcast('ticket.updated', TicketSerializer(updated_ticket).data)
        return Response(TicketSerializer(updated_ticket).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# SOS endpoints
@api_view(['POST'])
def trigger_sos(req):
    workerId = req.data.get('workerId', 'T-492')
    name = req.data.get('name', 'J. Kowalski')
    lat = req.data.get('lat')
    lng = req.data.get('lng')

    if lat is None or lng is None:
        return Response({'error': 'Coordinates required'}, status=status.HTTP_400_BAD_REQUEST)

    ws_broadcast('alert.sos', {
        'workerId': workerId,
        'name': name,
        'lat': lat,
        'lng': lng,
        'timestamp': timezone.now().isoformat()
    })

    LiveAlert.objects.create(
        severity='critical',
        title=f"SOS triggered by {name}",
        message=f"Immediate response requested at Lat: {lat}, Lng: {lng}",
        timestamp='Just now'
    )

    return Response({'success': True, 'message': 'SOS broadcasted successfully'})

# Broadcast endpoints
@api_view(['POST'])
def broadcast_notification(req):
    message = req.data.get('message')
    priority = req.data.get('priority', 'high')
    sentBy = req.data.get('sentBy', 'Admin')

    if not message:
        return Response({'error': 'Message text required'}, status=status.HTTP_400_BAD_REQUEST)

    ws_broadcast('alert.broadcast', {
        'message': message,
        'priority': priority,
        'sent_by': sentBy
    })

    LiveAlert.objects.create(
        severity='critical' if priority == 'high' else 'info',
        title='Manager Broadcast',
        message=message,
        timestamp='Just now'
    )

    return Response({'success': True})

# Summary Dashboard endpoints
@api_view(['GET'])
def dashboard_summary(req):
    total = Machine.objects.count()
    online = Machine.objects.filter(status__in=['online', 'warning']).count()
    active_workers = WorkerLocation.objects.count()
    open_tickets = Ticket.objects.exclude(status='resolved').count()
    critical_tickets = Ticket.objects.filter(severity='critical').exclude(status='resolved').count()

    summary = {
        'productivity': 94,
        'personnelActive': active_workers + 125,
        'machinesOnline': online,
        'machinesTotal': total,
        'openTickets': open_tickets,
        'criticalTickets': critical_tickets
    }

    # Fetch alerts, order by id descending
    alerts = LiveAlert.objects.all().order_by('-id')
    alerts_data = LiveAlertSerializer(alerts, many=True).data

    return Response({
        'summary': summary,
        'liveAlerts': alerts_data
    })

# Chatbot endpoints
@api_view(['GET'])
def chat_sessions_list(req):
    sessions = ChatSession.objects.all().order_by('-createdAt')
    serializer = ChatSessionSerializer(sessions, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def chat_message_create(req):
    message = req.data.get('message')
    sessionId = req.data.get('sessionId', 'session-core')
    image = req.data.get('image')  # base64 image data

    if not message:
        return Response({'error': 'Message content required'}, status=status.HTTP_400_BAD_REQUEST)

    session, created = ChatSession.objects.get_or_create(
        id=sessionId,
        defaults={'workerId': 'T-492', 'createdAt': timezone.now()}
    )

    # Save User message
    ChatMessage.objects.create(
        session=session,
        role='user',
        content=message,
        timestamp=timezone.now().strftime('%I:%M:%S %p'),
        image=image
    )

    # Fetch active machines context
    machines = Machine.objects.all()
    machine_list_str = "\n".join([
        f"{m.name} (ID: {m.id}, Zone: {m.locationZone}, Health Score: {m.healthScore}, Status: {m.status})"
        for m in machines
    ])

    system_instruction = (
        "You are SmartFactory Assistant, an AI maintenance helper.\n"
        f"Available machines on the factory floor:\n{machine_list_str}\n\n"
        "When a worker reports an issue:\n"
        "1. Identify the machine and failure pattern\n"
        "2. Classify severity: SIMPLE (worker can self-fix) | MODERATE (supervisor needed) | COMPLEX (engineer required)\n"
        "3. SIMPLE: return numbered steps (max 5). Start response with \"SEVERITY: SIMPLE\"\n"
        "4. COMPLEX: brief diagnosis only. Start response with \"SEVERITY: COMPLEX\"\n"
        "Safety first. Be concise. Never advise actions that risk physical harm."
    )

    ai_response_text = ""
    key = os.environ.get('GEMINI_API_KEY')

    if not key or key == 'MY_GEMINI_API_KEY':
        # Offline simulator
        lower_msg = message.lower()
        if 'axis 4' in lower_msg or 'temperature' in lower_msg or 'sensor' in lower_msg:
            ai_response_text = (
                "SEVERITY: COMPLEX\n\nThermal anomaly detected on Spindle Bearing Assembly of CNC Axis 4. "
                "Friction coefficients are rising rapidly. Immediate inspection and possible bearing replacement "
                "required to avoid mechanical seizure. I will generate a formal Maintenance ticket for you."
            )
        else:
            ai_response_text = (
                "SEVERITY: SIMPLE\n\n1. Locate standard calibration tool on shelf.\n"
                "2. Set alignment mode to automatic.\n3. Calibrate sensory reference lines.\n"
                "4. Complete and save logs.\n5. Verify nominal green indicator lights."
            )
    else:
        try:
            client = genai.Client(api_key=key)
            contents = []
            
            # If base64 image data is provided, append it to inputs
            if image and ';base64,' in image:
                parts = image.split(';base64,')
                mime_type = parts[0].split('data:')[1]
                base64_data = parts[1]
                contents.append(types.Part.from_bytes(
                    data=bytes(base64_data, 'utf-8'),
                    mime_type=mime_type
                ))

            contents.append(message)

            response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.7
                )
            )
            ai_response_text = response.text or ""
        except Exception as e:
            ai_response_text = f"AI Error processing request: {str(e)}"

    # Determine severity
    severity = 'SIMPLE'
    if 'SEVERITY: COMPLEX' in ai_response_text:
        severity = 'COMPLEX'
    elif 'SEVERITY: MODERATE' in ai_response_text:
        severity = 'MODERATE'

    created_ticket_id = None
    if severity == 'COMPLEX':
        # Auto-create ticket
        ticket_id = f"TKT-{random.randint(8800, 9900)}"
        new_ticket = Ticket.objects.create(
            id=ticket_id,
            machineId='M-402',
            machineName='CNC Axis 4',
            reportedBy='AI Chatbot triage',
            issueDescription=message,
            severity='critical',
            status='open',
            aiAssessment=ai_response_text,
            createdAt=timezone.now(),
            checklist=[
                {'text': 'Diagnostics review', 'done': False},
                {'text': 'Resolve Axis 4 temperature spill', 'done': False}
            ]
        )
        created_ticket_id = ticket_id
        ws_broadcast('ticket.created', TicketSerializer(new_ticket).data)

    # Save Assistant message
    ChatMessage.objects.create(
        session=session,
        role='assistant',
        content=ai_response_text,
        timestamp=timezone.now().strftime('%I:%M:%S %p')
    )

    return Response({
        'response_text': ai_response_text,
        'severity': severity,
        'ticket_id': created_ticket_id
    })


# ─── Camera Frame Endpoints ──────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def camera_frame_upload(req):
    """Receive a camera frame from the Expo mobile app."""
    image = req.data.get('image')
    if not image:
        return Response({'error': 'No image data provided'}, status=status.HTTP_400_BAD_REQUEST)

    activity_score = float(req.data.get('activity_score', 0))
    worker_count = int(req.data.get('worker_count', 0))
    device_id = req.data.get('device_id', 'mobile-cam-01')

    # Keep only the latest frame per device (delete old ones)
    CameraFrame.objects.filter(deviceId=device_id).delete()

    # Attempt real AI detection if key is available
    key = os.environ.get('GEMINI_API_KEY')
    if key and key != 'MY_GEMINI_API_KEY' and image and ';base64,' in image:
        try:
            client = genai.Client(api_key=key)
            parts = image.split(';base64,')
            mime_type = parts[0].split('data:')[1]
            base64_data = parts[1]
            
            prompt = (
                "Count the number of people/workers visible in this factory CCTV frame. "
                "Also estimate activity level (0-100) based on their engagement and movement. "
                "Return ONLY a JSON object: {\"worker_count\": X, \"activity_score\": Y}"
            )
            
            response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=[
                    types.Part.from_bytes(data=bytes(base64_data, 'utf-8'), mime_type=mime_type),
                    prompt
                ],
                config=types.GenerateContentConfig(response_mime_type='application/json')
            )
            
            if response and response.text:
                ai_data = json.loads(response.text)
                worker_count = int(ai_data.get('worker_count', worker_count))
                activity_score = float(ai_data.get('activity_score', activity_score))
        except Exception as e:
            print(f"AI Detection Error (Camera): {e}")

    frame = CameraFrame.objects.create(
        deviceId=device_id,
        image=image,
        activityScore=activity_score,
        workerCount=worker_count,
        timestamp=timezone.now()
    )

    # Broadcast to all connected web clients
    ws_broadcast('camera.frame.update', {
        'deviceId': device_id,
        'activityScore': activity_score,
        'workerCount': worker_count,
        'timestamp': frame.timestamp.isoformat(),
        # Don't include the full image in broadcast — clients will poll /api/camera/latest
    })

    return Response({'status': 'ok', 'timestamp': frame.timestamp.isoformat()})


@api_view(['GET'])
@permission_classes([AllowAny])
def camera_latest_frame(req):
    """Return the latest camera frame for the CCTV page."""
    device_id = req.query_params.get('device_id', 'mobile-cam-01')
    frame = CameraFrame.objects.filter(deviceId=device_id).order_by('-timestamp').first()
    if not frame:
        return Response({'status': 'no_frame'}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'deviceId': frame.deviceId,
        'image': frame.image,
        'activityScore': frame.activityScore,
        'workerCount': frame.workerCount,
        'timestamp': frame.timestamp.isoformat()
    })
