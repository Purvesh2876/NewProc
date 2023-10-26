import paho.mqtt.client as mqtt

# MQTT broker URL
broker_url = "pro.ambicam.com"
broker_port = 1883  # MQTT default port

# Your topic
topic = "webPc-123456"  # Replace with your desired topic

# MQTT client callback functions
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("ConwebPcnected to MQTT broker")
        client.subscribe(topic)
    else:
        print(f"Connection failed with code {rc}")

def on_message(client, userdata, msg):
    print(f"Received message on topic {msg.topic}: {msg.payload.decode()}")

def on_disconnect(client, userdata, rc):
    print("Disconnected from MQTT broker")

# Create an MQTT client
client = mqtt.Client()

# Set callback functions
client.on_connect = on_connect
client.on_message = on_message
client.on_disconnect = on_disconnect

# Connect to the MQTT broker
client.connect(broker_url, broker_port, keepalive=60)

# Start the MQTT client loop
client.loop_start()

# Publish a message (example)
client.publish(topic, "Hello, MQTT!")

# Keep the script running
try:
    while True:
        pass
except KeyboardInterrupt:
    pass

# Disconnect from the MQTT broker
client.disconnect()
client.loop_stop()