from django.db import models
from django.utils import timezone

class Machine(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    locationZone = models.CharField(max_length=50)
    healthScore = models.IntegerField(default=100)
    status = models.CharField(max_length=20, default='online') # online, warning, offline
    uptimeHours = models.IntegerField(default=0)
    lastServiceDate = models.CharField(max_length=50)
    temp = models.FloatField(default=0.0)
    vibration = models.FloatField(default=0.0)
    pressure = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.id})"

class Ticket(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    machineId = models.CharField(max_length=50)
    machineName = models.CharField(max_length=100)
    reportedBy = models.CharField(max_length=100)
    assignedTo = models.CharField(max_length=100, blank=True, null=True)
    issueDescription = models.TextField()
    aiAssessment = models.TextField(blank=True, null=True)
    severity = models.CharField(max_length=20, default='complex') # critical, complex, moderate, low, simple
    status = models.CharField(max_length=20, default='open') # open, resolved
    createdAt = models.DateTimeField(default=timezone.now)
    checklist = models.JSONField(default=list)

    def __str__(self):
        return f"{self.id} - {self.machineName}"

class Attendance(models.Model):
    workerId = models.CharField(max_length=50)
    workerName = models.CharField(max_length=100)
    clockIn = models.DateTimeField(default=timezone.now)
    clockOut = models.DateTimeField(blank=True, null=True)
    locationLat = models.FloatField()
    locationLng = models.FloatField()
    isValid = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.workerName} - {self.clockIn}"

class WorkerLocation(models.Model):
    workerId = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    lat = models.FloatField()
    lng = models.FloatField()
    lastUpdate = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} - ({self.lat}, {self.lng})"

class LiveAlert(models.Model):
    severity = models.CharField(max_length=20) # critical, warning, info
    title = models.CharField(max_length=100)
    message = models.TextField()
    timestamp = models.CharField(max_length=50) # Keep as string or relative text (e.g. "Just now", "12m ago")

    def __str__(self):
        return f"[{self.severity}] {self.title}"

class ChatSession(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    workerId = models.CharField(max_length=50, default='T-492')
    createdAt = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.id

class ChatMessage(models.Model):
    session = models.ForeignKey(ChatSession, related_name='messages', on_delete=models.CASCADE)
    role = models.CharField(max_length=20) # user, assistant
    content = models.TextField()
    timestamp = models.CharField(max_length=50)
    image = models.TextField(blank=True, null=True) # base64 image data

    def __str__(self):
        return f"{self.role}: {self.content[:30]}"
