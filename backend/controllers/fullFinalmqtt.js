const mqtt = require('mqtt');
const commonConfig = require('./commonConfig');
const { VUtil_decodeGetConfigMsg, VUtil_encodeMsgHeader, getDefaultSettings, VUtil_getStreamId } = require('./vutil');

// MQTT broker URL
const brokerUrl = 'tcp://pro.ambicam.com:1883'; // Replace with your MQTT broker's URL
let deviceid = 'AAAA-011214-AAAAA';
let plan = 'DVR-30'
let topic = generateRandomTopic(); // MQTT topic
let gmyId = null;
let msgtype = null;

class MqttPayload {
    constructor(buffer) {
        this.TrimmedBuffer = buffer
        this._offset = 0
        this._payload = buffer
    }
}

class MQTTMessage {
    constructor(srcId, dstId, msgType, msgLen, msg) {
        this.srcId = srcId || 844;
        this.dstId = dstId || 0;
        this.msgType = msgType || 6;
        this.msgLen = msgLen || 0;
        this.msg = msg || [];
    }
}

// MQTT client options
const options = {
    clientId: topic, // Unique client ID
};

function generateRandomTopic() {
    const topicPrefix = 'webPc-';
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
        randomPart += Math.floor(Math.random() * 10).toString();
    }
    return topicPrefix + randomPart;
}

// Create an MQTT client
const client = mqtt.connect(brokerUrl, options);
console.log('options:', options);
// MQTT client connection event handler
client.on('connect', () => {
    console.log('Connected to MQTT broker');

    // Subscribe to a topic
    console.log('topic:', topic);
    client.subscribe('vmukti/VCam1_1/rx/' + topic, (err) => {
        if (!err) {
            console.log('Subscribed to vmukti/VCam1_1/rx/' + topic);
        }
    });

    gmyId = VUtil_getStreamId(topic);
    console.log('gmyId:', gmyId);

    msgtype = commonConfig.MSG_TYPE_GET_CONFIG;
    console.log('msgtype:', msgtype);

    let request = "<uuid name=" + deviceid + " >"
    let requestLen = request.length + 1;
    const ArrayBuffer = [requestLen + 16]
    let msg = new MQTTMessage();
    msg.dstId = 0;
    msg.msg = null;
    msg.msgLen = requestLen;
    msg.msgType = msgtype;
    msg.srcId = 800;

    console.log('msg:', msg);

    let offset = VUtil_encodeMsgHeader(ArrayBuffer, msg);
    console.log('offset:', offset);

    for (let i = 0; i < request.length; i++) {
        ArrayBuffer[offset++] = request.charCodeAt(i);
    }
    // console.log('ArrayBuffer:', ArrayBuffer);
    ArrayBuffer[offset++] = 0;

    let payload = new MqttPayload(ArrayBuffer);
    payload = Buffer.from(payload.TrimmedBuffer);
    // payload = JSON.stringify(payload);
    console.log('payload:', payload);

    // Publish a message to a topic
    client.publish('vmukti/VCam1_1/tx/' + topic, payload, 0, false);
    console.log('Published message on topic vmukti/VCam1_1/rx/' + topic);
});

// MQTT message event handler
client.on('message', (topic, message) => {
    console.log(`Received message on topic ${topic}: ${message}`);
});

// Handle MQTT client errors
client.on('error', (error) => {
    console.error('MQTT client error:', error);
});

// MQTT client disconnection event
client.on('close', () => {
    console.log('Disconnected from MQTT broker');
});

// Gracefully close the MQTT client on process exit
process.on('SIGINT', () => {
    client.end();
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    client.end();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    client.end();
});