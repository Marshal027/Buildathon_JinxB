from rest_framework import serializers
from api.models import Machine, Ticket, Attendance, WorkerLocation, LiveAlert, ChatSession, ChatMessage

class MachineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Machine
        fields = '__all__'

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'

class WorkerLocationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='workerId', read_only=True)
    class Meta:
        model = WorkerLocation
        fields = ['id', 'workerId', 'name', 'lat', 'lng', 'lastUpdate']

class LiveAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveAlert
        fields = '__all__'

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'

class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    class Meta:
        model = ChatSession
        fields = '__all__'
