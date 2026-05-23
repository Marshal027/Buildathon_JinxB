from django.urls import path
from api import views

urlpatterns = [
    # Auth
    path('auth/login', views.login_view),
    path('auth/refresh', views.refresh_view),
    path('auth/me', views.me_view),

    # Machines
    path('machines', views.machines_list),
    path('machines/<str:id>', views.machine_detail),

    # Attendance
    path('attendance', views.attendance_list),
    path('attendance/checkin', views.checkin_view),
    path('attendance/checkout', views.checkout_view),

    # Worker Tracking
    path('workers/location', views.update_worker_location),
    path('workers/locations', views.worker_locations_list),

    # Tickets
    path('tickets', views.tickets_list),
    path('tickets/<str:id>', views.ticket_detail),

    # SOS & Alerts
    path('alerts/sos', views.trigger_sos),
    path('notifications/broadcast', views.broadcast_notification),

    # Dashboard Summary
    path('dashboard/summary', views.dashboard_summary),

    # Chatbot
    path('chatbot/sessions', views.chat_sessions_list),
    path('chatbot/message', views.chat_message_create),

    # Mobile Camera Feed
    path('camera/frame', views.camera_frame_upload),
    path('camera/latest', views.camera_latest_frame),
]
