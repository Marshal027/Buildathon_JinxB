import datetime
from django.utils import timezone
from api.models import Machine, Ticket, LiveAlert, Attendance

def seed_db():
    try:
        if Machine.objects.count() == 0:
            machines = [
                Machine(id='M-402', name='CNC Axis 4', locationZone='A-1', healthScore=94, status='online', uptimeHours=1250, lastServiceDate='2026-04-10', temp=68.4, vibration=11.2, pressure=90),
                Machine(id='P-114', name='Auxiliary Hydraulic Circuit', locationZone='C-1', healthScore=82, status='warning', uptimeHours=840, lastServiceDate='2026-03-15', temp=42.1, vibration=12.4, pressure=115),
                Machine(id='I-03', name='Inspection Optical Sensor', locationZone='B-1', healthScore=99, status='online', uptimeHours=3200, lastServiceDate='2026-05-01', temp=35.2, vibration=1.2, pressure=0),
                Machine(id='ASM-001', name='Assembly Line Alpha Motor', locationZone='A-1', healthScore=98, status='online', uptimeHours=4120, lastServiceDate='2026-05-12', temp=58.7, vibration=9.8, pressure=0),
                Machine(id='CLS-042', name='Cooling System Beta', locationZone='A-2', healthScore=72, status='warning', uptimeHours=1850, lastServiceDate='2026-02-28', temp=85.0, vibration=18.5, pressure=120),
                Machine(id='ROB-112', name='Welding Arm X-1', locationZone='B-2', healthScore=88, status='online', uptimeHours=2950, lastServiceDate='2026-04-20', temp=44.2, vibration=15.1, pressure=45),
                Machine(id='EX-02', name='Extruder Alpha', locationZone='D-1', healthScore=91, status='online', uptimeHours=1100, lastServiceDate='2025-11-15', temp=195.4, vibration=22.4, pressure=250),
                Machine(id='T-42', name='Conveyor Beta Main Motor', locationZone='C-1', healthScore=45, status='offline', uptimeHours=6200, lastServiceDate='2026-01-10', temp=82.3, vibration=45.2, pressure=0)
            ]
            Machine.objects.bulk_create(machines)

        if Ticket.objects.count() == 0:
            tickets = [
                Ticket(
                    id='TKT-8902',
                    machineId='M-402',
                    machineName='CNC Axis 4',
                    reportedBy='System Watchdog',
                    assignedTo='J. Doe',
                    issueDescription='AI sensors detected sustained temperature variance exceeding operational thresholds by 15% on the main spindle bearing assembly.',
                    aiAssessment='Continuous data streams indicate a 94% probability of imminent bearing failure on Axis 4. Friction coefficients have spiked synchronously with localized temperature increases. Recommended immediate halt of operations to prevent catastrophic spindle damage.',
                    severity='critical',
                    status='open',
                    createdAt=timezone.now() - datetime.timedelta(minutes=10),
                    checklist=[
                        {'text': 'Halt Machine M-402', 'done': False},
                        {'text': 'Lockout/Tagout (LOTO)', 'done': False},
                        {'text': 'Inspect Spindle Housing', 'done': False}
                    ]
                ),
                Ticket(
                    id='TKT-8895',
                    machineId='P-114',
                    machineName='Auxiliary Hydraulic Circuit',
                    reportedBy='Automation Guard',
                    severity='complex',
                    status='open',
                    issueDescription='Intermittent pressure drops noted in auxiliary hydraulic circuit B during high-load cycles.',
                    aiAssessment='Periodic visual pressure spike matching cycle initiation suggests standard valve wear or micro-leakage in line B. Inspection requested.',
                    createdAt=timezone.now() - datetime.timedelta(minutes=120),
                    checklist=[
                        {'text': 'Measure line B pressure drops', 'done': True},
                        {'text': 'Diagnose relief valve seals', 'done': False}
                    ]
                ),
                Ticket(
                    id='TKT-8891',
                    machineId='I-03',
                    machineName='Inspection Optical Sensor',
                    reportedBy='Supervisor Miller',
                    severity='low',
                    status='open',
                    issueDescription='Optical sensor array on inspection line 3 requires scheduled quarterly calibration.',
                    aiAssessment='Preventative compliance alert. No telemetric anomalies detected; routine upkeep.',
                    createdAt=timezone.now() - datetime.timedelta(minutes=300),
                    checklist=[
                        {'text': 'Run optic calibration protocol', 'done': False}
                    ]
                )
            ]
            Ticket.objects.bulk_create(tickets)

        if LiveAlert.objects.count() == 0:
            alerts = [
                LiveAlert(severity='critical', title='Temperature Spike', message='Cooling System Beta exceeding operational threshold by 15°C.', timestamp='Just now'),
                LiveAlert(severity='warning', title='Calibration Required', message='Welding Arm X-1 scheduled for routine calibration in 2 hours.', timestamp='12m ago'),
                LiveAlert(severity='info', title='Firmware Deployed', message='V2.4.1 successfully deployed to Assembly Line Alpha.', timestamp='1h ago')
            ]
            LiveAlert.objects.bulk_create(alerts)

        if Attendance.objects.count() == 0:
            attendance = [
                Attendance(workerId='T-492', workerName='J. Kowalski', clockIn=timezone.now() - datetime.timedelta(hours=4), locationLat=37.7750, locationLng=-122.4195, isValid=True),
                Attendance(workerId='E-118', workerName='S. Miller', clockIn=timezone.now() - datetime.timedelta(hours=5), clockOut=timezone.now() - datetime.timedelta(hours=1), locationLat=37.7745, locationLng=-122.4188, isValid=True),
                Attendance(workerId='S-882', workerName='A. Chen', clockIn=timezone.now() - datetime.timedelta(hours=2), locationLat=37.7752, locationLng=-122.4190, isValid=True)
            ]
            Attendance.objects.bulk_create(attendance)
    except Exception as e:
        print("Database seed bypassed or tables not ready yet:", e)

def ws_broadcast(event_type, payload):
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            "factory_group",
            {
                "type": "factory_event",
                "message": {
                    "type": event_type,
                    "payload": payload
                }
            }
        )

