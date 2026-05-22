from django.db import models

class Ticket(models.Model):
    ticket_id = models.CharField(max_length=50, unique=True)
    machine_id = models.CharField(max_length=50, blank=True, null=True)
    machine_name = models.CharField(max_length=100, blank=True, null=True)
    reported_by = models.CharField(max_length=100, default="AI Chatbot triage")
    issue_description = models.TextField()
    severity = models.CharField(max_length=50, default="critical")
    status = models.CharField(max_length=50, default="open")
    created_at = models.DateTimeField(auto_now_add=True)
    checklist = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.ticket_id} - {self.machine_name} ({self.status})"

class Email(models.Model):
    sender = models.CharField(max_length=100)
    sender_role = models.CharField(max_length=50, default="manager")
    recipient = models.CharField(max_length=100)
    subject = models.CharField(max_length=200)
    body = models.TextField()
    timestamp = models.CharField(max_length=50)
    date = models.CharField(max_length=50)
    priority = models.CharField(max_length=50, default="normal")
    read = models.BooleanField(default=False)
    folder = models.CharField(max_length=50, default="inbox")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} -> {self.recipient}: {self.subject}"
