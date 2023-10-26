const mqtt = require('mqtt');
const commonConfig = require('./commonConfig');
const { VUtil_decodeGetConfigMsg, VUtil_encodeMsgHeader, VUtil_decodeMsgHeader, VUtil_getStreamId } = require('./vutil');
const express = require('express');
const bodyParser = require('body-parser');

const brokerUrl = 'tcp://pro.ambicam.com:1883'; // Replace with your MQTT broker's URL
let deviceid = 'AAAA-011214-AAAAA';
let plan = 'DVR-30'
let topic = generateRandomTopic(); // MQTT topic
let gmyId = null;
let msgtype = null;
let strwifi = null;

let JsonString = null;

const app = express();
const port = 3000;
// Replace with your MQTT broker's URL

// MQTT client options
const mqttOptions = {
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

function processGetConfigMsg(payload, offset, len) {
  // Assuming VUtil_decodeGetConfigMsg function is available
  let appSettings = VUtil_decodeGetConfigMsg(payload, offset, len);
  strwifi = appSettings.nwInfo.networktype;
  // appSettings 
  invokeMessage(appSettings);

  return appSettings;

}

function invokeMessage(appSettings) {
  strwifi = appSettings.nwInfo.networktype;
  let get_config_values = '';

  const publish_on_off = appSettings.streamCfg.enabled === 0 ? false : true;
  const audio_on_off = appSettings.streamCfg.enableAudio === 0 ? false : true;
  const motion_on_off = appSettings.mdCfg.MdbEnable === 0 ? false : true;
  const email_on_off = appSettings.mdCfg.md_emailsnap_switch === 0 ? false : true;
  const flip_on_off = appSettings.imageCfg.flip === 0 ? false : true;
  const mirror_on_off = appSettings.imageCfg.mirror === 0 ? false : true;
  const wifiinfo = appSettings.nwInfo.networktype;
  const wdr = appSettings.imageCfg.wdr;

  const hf_imghue = appSettings.displayCfg.hue.toString();
  const hf_imgbright = appSettings.displayCfg.brightness.toString();
  const hf_imgcontrast = appSettings.displayCfg.contrast.toString();
  const hf_imgsaturation = appSettings.displayCfg.saturation.toString();
  const ircut = appSettings.displayCfg.ircutmode - 1;
  let osdCfg = '';

  if (appSettings.osdCfg.cont_1.startsWith("Ambicam")) {
    osdCfg = appSettings.osdCfg.cont_1.substring(8);
  } else {
    osdCfg = appSettings.osdCfg.cont_1;
  }

  let quality_level = 2;

  const record_on_off = appSettings.recordCh011.enable === 0 ? false : true;

  if (appSettings.videoCh012.bps === 768) {
    quality_level = 0;
  } else if (appSettings.videoCh012.bps === 512) {
    quality_level = 1;
  } else if (appSettings.videoCh012.bps === 120) {
    quality_level = 3;
  } else if (appSettings.videoCh012.bps === 80) {
    quality_level = 4;
  } else {
    quality_level = 2;
  }

  const toggleSettings = {
    publish_on_off,
    audio_on_off,
    motion_on_off,
    email_on_off,
    record_on_off,
    flip_on_off,
    mirror_on_off,
    wifiinfo,
    wdr,
    hf_imghue,
    hf_imgbright,
    hf_imgcontrast,
    hf_imgsaturation,
    ircut,
    osdCfg,
    timeZone: appSettings.timeCfg.timeZone,
    quality_level,
    plan
  };

  // return appSettings;

  const mqttmessage = {
    srcId: gmyId,
    msgType: commonConfig.MSG_TYPE_SET_CONFIG,
    dstId: 0
  };

}



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

// Create an MQTT client
const mqttClient = mqtt.connect(brokerUrl, mqttOptions);

// Middleware to parse JSON requests
app.use(bodyParser.json());

// HTTP route to publish a message to MQTT
app.post('/publish', (req, res) => {
  const deviceId = req.body.deviceId;

  if (!deviceId) {
    return res.status(400).json({ error: 'Message is required' });
  }

  gmyId = VUtil_getStreamId(topic);
  let request = "<uuid name=" + deviceId + " >"
  let requestLen = request.length + 1;
  const ArrayBuffer = [requestLen + 16]
  let msg = new MQTTMessage();
  msg.dstId = 0;
  msg.msg = null;
  msg.msgLen = requestLen;
  msg.msgType = commonConfig.MSG_TYPE_GET_CONFIG;
  msg.srcId = gmyId;

  let offset = VUtil_encodeMsgHeader(ArrayBuffer, msg);
  // console.log('offset:', offset);

  for (let i = 0; i < request.length; i++) {
    ArrayBuffer[offset++] = request.charCodeAt(i);
  }
  // console.log('ArrayBuffer:', ArrayBuffer);
  ArrayBuffer[offset++] = 0;

  let payload = new MqttPayload(ArrayBuffer);
  payload = Buffer.from(payload.TrimmedBuffer);

  // Publish the message to the MQTT topic
  mqttClient.publish('vmukti/VCam1_1/tx/' + topic, payload, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to publish message' });
    }

  });

  mqttClient.on('message', (topic, message) => {
    // console.log(`Received message on topic ${mqttTopic}: ${message}`);
    // console.log('message:', JSON.stringify(message));
    let buffer = Buffer.from(message);
    // Assuming `outbuffer` is a Uint8Array
    const bytesAsInts = Array.from(buffer);
    // Assuming `outbuffer` is a Uint8Array
    // const decoder = new TextDecoder('utf-8');
    // const bytesAsChar = buffer.toString('utf8');
    // console.log('bytesAsChar:', bytesAsChar);

    let uint8Array = new Uint8Array(message);

    // Convert the Uint8Array to a string
    let utf8String = String.fromCharCode.apply(null, uint8Array);

    let Mqttmessage = VUtil_decodeMsgHeader(buffer);
    console.log('mqttMessage:', Mqttmessage)
    let appSettings = processGetConfigMsg(buffer, 16, Mqttmessage.msgLen)
    JsonString = appSettings
    // let appSettings = VUtil_decodeGetConfigMsg(buffer, 16, Mqttmessage.msgLen);
    // appSettings = invokeMessage(appSettings);
    // console.log('Mqttmessage:', Mqttmessage);
    if (message) {
      res.json({ "appSettings": JsonString });
    }
  });
});

// MQTT client connection event handler
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');

  // Subscribe to the MQTT topic
  mqttClient.subscribe('vmukti/VCam1_1/rx/' + topic, (err) => {
    if (!err) {
      console.log(`Subscribed to ${'vmukti/VCam1_1/rx/' + topic}`);
    }
  });
});


// Start the Express server
app.listen(port, () => {
  console.log(`Express API listening on port ${port}`);
});

// Handle MQTT client errors
mqttClient.on('error', (error) => {
  console.error('MQTT client error:', error);
});

// Gracefully close the MQTT client on process exit
process.on('SIGINT', () => {
  mqttClient.end();
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  mqttClient.end();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  mqttClient.end();
});
