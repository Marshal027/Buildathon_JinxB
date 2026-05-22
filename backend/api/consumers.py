import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer

class FactoryConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("factory_group", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("factory_group", self.channel_name)

    async def factory_event(self, event):
        await self.send_json(event["message"])
