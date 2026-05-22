from rest_framework import viewsets
from .models import Ticket, Email
from .serializers import TicketSerializer, EmailSerializer
from django.core.mail import send_mail

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by('-created_at')
    serializer_class = TicketSerializer

class EmailViewSet(viewsets.ModelViewSet):
    queryset = Email.objects.all().order_by('-created_at')
    serializer_class = EmailSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        try:
            # Send the email. Standard sender name: Opsync Mailer
            send_mail(
                subject=instance.subject,
                message=instance.body,
                from_email='mailer@opsync.com',
                recipient_list=[instance.recipient],
                fail_silently=False,
            )
            print(f"Successfully dispatched console mail to {instance.recipient}")
        except Exception as e:
            print(f"Error dispatching console mail to {instance.recipient}: {e}")
