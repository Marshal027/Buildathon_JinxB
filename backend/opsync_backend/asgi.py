import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.urls import path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'opsync_backend.settings')

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing consumers and routing.
django_asgi_app = get_asgi_application()

from api.consumers import FactoryConsumer

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        URLRouter([
            path("ws/factory/", FactoryConsumer.as_asgi()),
        ])
    ),
})
