const mqtt = require('mqtt');
const CommonConfig = require('./commonConfig');
const appSettings = require('./appSettings')

// Connect to the MQTT broker
const client = mqtt.connect('tcp://pro.ambicam.com:1883'); // Replace with your MQTT broker's address

let gMyId = 0;
let msgType;

class MQTTMessage {
  constructor(srcId, dstId, msgType, msgLen, msg) {
    this.srcId = srcId;
    this.dstId = dstId;
    this.msgType = msgType;
    this.msgLen = msgLen;
    this.msg = msg;
  }
}




function VUtil_parseInt(array, start, end) {
  var i = 0;
  var j = 0;
  var retVal = 0;

  for (i = start; i < end; i++) {
    retVal |= (array[i] & 0x0FF) << (8 * j);
    j++;
  }

  return retVal;
}

function VUtil_decodeMsgHeader(buff) {
  var msgHdr = { srcId: 0, dstId: 0, msgType: 0, msgLen: 0 };

  /* Parse srcId */
  msgHdr.srcId = VUtil_parseInt(buff, 0, 4);

  /* Parse dstId */
  msgHdr.dstId = VUtil_parseInt(buff, 4, 8);

  /* Parse msgType */
  msgHdr.msgType = VUtil_parseInt(buff, 8, 12);

  /* Parse msgLen */
  msgHdr.msgLen = VUtil_parseInt(buff, 12, 16);

  return msgHdr;
}

function VUtil_decodeGetConfigMsg(buff, offset, len) {
  var appSettings = {
    uuid: "",
    grUuid: "",
    streamCfg: [
      {
        enabled: 0,
        enableAudio: 0,
        publishUrl: "",
        mqttUrl: "",
        enableTelnet: 0,
        telnetUrl: "",
        isHd: 0
      }
    ],
    timeCfg: [
      {
        time: "",
        timeZone: "",
        tz: "",
        dstmode: 0,
        autoupdate: 0,
        autoupdatetzonvif: 0,
        ntpserver: "",
        ntpinterval: 0,
        ntpenable: 0
      }
    ],
    emailCfg: [
      {
        emailserver: "",
        emailport: 0,
        ssl: 0,
        logintype: 0,
        emailusername: "",
        emailpassword: "",
        from: "",
        to: "",
        subject: "",
        text: "",
        attatchment: ""
      }
    ],
    videoCh011: [
      {
        bps: 0,
        fps: 0,
        gop: 0,
        brmode: 0,
        piclevel: 0,
        fixqplevel: 0,
        width: 0,
        height: 0,
        bmainstream: 1,
        bfield: 0
      }
    ],
    // Define other properties similarly
  };

  var msg;
  var lines = [];
  var lineCnt;
  var offset;
  var line;

  // Initialize arrays within the appSettings object
  appSettings.recordSch.workday = [-1, -1, -1, -1, -1, -1];
  appSettings.recordSch.weekend = [-1, -1, -1, -1, -1, -1];

  appSettings.recordSch.sun = [-1, -1, -1, -1, -1, -1];
  appSettings.recordSch.mon = [-1, -1, -1, -1, -1, -1];
  appSettings.recordSch.tue = [-1, -1, -1, -1, -1, -1];
  appSettings.recordSch.wed = [-1, -1, -1, -1, -1, -1];
  appSettings.recordSch.thu = [-1, -1, -1, -1, -1, -1];
  appSettings.recordSch.fri = [-1, -1, -1, -1, -1, -1];
  appSettings.recordSch.sat = [-1, -1, -1, -1, -1, -1];

  appSettings.mdCfg.MdRegion = Array(32).fill(255); // Assuming 32 elements

  // Parse the input buffer and populate the appSettings object
  msg = String.fromCharCode.apply(null, buff.slice(offset, offset + len));
  console.log("XML Decode Msg");
  console.log(msg);
  lines = msg.split("\n");

  offset = 0;
  lineCnt = lines.length;
  while (offset < lineCnt) {
    line = lines[offset];

    if (line.indexOf(TAG_GR_UUID) > 0) {
      offset++;
      offset = decodeGrUuid(lines, offset, appSettings);
    } else if (line.indexOf(TAG_UUID) > 0) {
      offset++;
      offset = decodeUuid(lines, offset, appSettings);
    } else if (line.indexOf(TAG_STREAM_CFG) > 0) {
      offset++;
      offset = decodeStreamCfg(lines, offset, appSettings.streamCfg[0]);
    } else if (line.indexOf(TAG_TIME_CFG) > 0) {
      offset++;
      offset = decodeTimeCfg(lines, offset, appSettings.timeCfg[0]);
    } else if (line.indexOf(TAG_EMAIL_CFG) > 0) {
      offset++;
      offset = decodeEmailCfg(lines, offset, appSettings.emailCfg[0]);
    } else if (line.indexOf(TAG_VIDEO_CFG) > 0) {
      offset++;
      offset = decodeVideoCfg(lines, offset, appSettings.videoCh011[0]);
    } else if (line.indexOf(TAG_DISPLAY_CFG) > 0) {
      offset++;
      offset = decodeDisplayCfg(lines, offset, appSettings.displayCfg[0]);
    } else if (line.indexOf(TAG_OSD_CFG) > 0) {
      offset++;
      offset = decodeOsdCfg(lines, offset, appSettings.osdCfg[0]);
    } else if (line.indexOf(TAG_RECORD_CFG) > 0) {
      offset++;
      offset = decodeRecordCfg(lines, offset, appSettings.recordCh011[0]);
    } else if (line.indexOf(TAG_IMAGE_CFG) > 0) {
      offset++;
      offset = decodeImageCfg(lines, offset, appSettings.imageCfg[0]);
    }
    // Define other cases similarly
    else if (line.indexOf() > 0) {
      offset++;
      offset = decodeImageCfg(lines, offset, appSettings.imageCfg[0]);
    } else {
      console.log("Unknown Line : " + line);
      offset++;
    }
  }

  printConfig(appSettings);

  return appSettings;
}


function VUtil_getStreamId(stream) {
  var streamId = 0;

  for (var i = 0; i < stream.length; i++) {
    streamId += stream.charCodeAt(i);
  }

  return streamId;
}

function VUtil_packInt(array, offset, val) {
  array[offset++] = (val >> 0) & 0xFF;
  array[offset++] = (val >> 8) & 0xFF;
  array[offset++] = (val >> 16) & 0xFF;
  array[offset++] = (val >> 24) & 0xFF;

  return 4;
}

function VUtil_encodeMsgHeader(buff, msgHdr) {
  var offset = 0;

  offset += VUtil_packInt(buff, offset, msgHdr.srcId);
  offset += VUtil_packInt(buff, offset, msgHdr.dstId);
  offset += VUtil_packInt(buff, offset, msgHdr.msgType);
  offset += VUtil_packInt(buff, offset, msgHdr.msgLen);

  return offset;
}

/////////////////    working ///////////////////////////////////
// client.on('connect', async () => {
//   console.log('Publisher connected to MQTT broker');

//   // The topic we want to publish to
//   let topoc = 'vmukti/VCam1_1/rx/hr-0002';
//   var topic = "webPc-";
//   for (var i = 0; i < 6; i++) {
//     topic += Math.floor(Math.random() * 10);
//   }
//   gMyId = VUtil_getStreamId(topic);
//   let struuid = "AAAA-007368-AAAAA"
//   let request = `<uuid name=${struuid} >`
//   let requestLen = request.length + 1;
//   let ArrayBuffer = [requestLen + 16]
//   let srcId = gMyId;
//   let msgType = CommonConfig.MSG_TYPE_GET_CONFIG;
//   let msgLen = requestLen;
//   let dstId = 0;
//   let message = new MQTTMessage(srcId, dstId, msgType, msgLen, request);

//   let offset = VUtil_encodeMsgHeader(new Uint8Array(ArrayBuffer), message);

//   for (let i = 0; i < request.length; i++) {
//     ArrayBuffer[offset++] = request.charCodeAt(i);
//   }
//   ArrayBuffer[offset++] = 0;
//   let bytes = new Uint8Array(ArrayBuffer);

//   client.publish(topoc, bytes, (err) => {
//     if (err) {
//       console.error('Error publishing message:', err);
//     } else {
//       console.log(`Published: ${message}`);
//     }

/////////////////////////////////////////////                    /////////////////////////////////////


client.on('connect', async () => {
  console.log('Publisher connected to MQTT broker');
  client.subscribe('vmukti/VCam1_1/rx/hr-0002', (err) => {
    if (err) {
      console.error('Error subscribing to topic:', err);
    } else {
      console.log(`Subscribed to topic: vmukti/VCam1_1/rx/hr-0002`);
    }
  });

  // The topic we want to publish to
  let topoc = 'vmukti/VCam1_1/rx/hr-0002';
  var topic = "webPc-";
  for (var i = 0; i < 6; i++) {
    topic += Math.floor(Math.random() * 10);
  }
  gMyId = VUtil_getStreamId(topic);
  let struuid = "AAAA-007368-AAAAA"
  let request = "<uuid name=" + struuid + " >";
  let requestLen = request.length + 1;
  let ArrayBuffer = [requestLen + 16]
  let srcId = gMyId;
  let msgType = CommonConfig.MSG_TYPE_GET_CONFIG;
  let msgLen = requestLen;
  let dstId = 0;
  let message = new MQTTMessage(srcId, dstId, msgType, msgLen, ArrayBuffer);

  let offset = VUtil_encodeMsgHeader(new Uint8Array(ArrayBuffer), message);

  for (let i = 0; i < request.length; i++) {
    ArrayBuffer[offset++] = request.charCodeAt(i);
  }
  ArrayBuffer[offset++] = 0;
  let bytes = new Uint8Array(ArrayBuffer);
  console.log(bytes)

  client.publish(topoc, bytes, (err) => {
    if (err) {
      console.error('Error publishing message:', err);
    } else {
      console.log(`Published: ${message}`);
    }

    client.on('message', function (topic, message) {
      // Handle the received message
      console.log(message);
    });

    // Disconnect from the broker after publishing
    client.end();
  });
});

function handleMQTTMessage(payload) {
  // Convert the received payload to an array of bytes
  const outbuffer = Array.from(payload);

  // Convert the array of bytes to an array of integers
  const bytesAsInts = outbuffer.map(x => x);

  // Convert the array of bytes to a string
  const bytesAsString = Buffer.from(outbuffer).toString('utf8');

  // Assuming Vutil.VUtil_decodeMsgHeader is defined elsewhere
  const resultmessage = VUtil_decodeMsgHeader(bytesAsInts);

  // Initialize the output_result string
  let output_result = '';

  // // Assuming publishdone and msgtoset are defined elsewhere
  // publishdone.set();

  switch (resultmessage.msgType) {
    case 'MSG_TYPE_GET_CONFIG':
      const appSettings = processGetConfigMsg(bytesAsString, 16, resultmessage.msgLen);
      msgtoset = JSON.stringify(appSettings);
      InvokeMessage(appSettings);
      // publishdone.set();
      break;
    default:
      break;
  }
}

function processGetConfigMsg(payload, offset, len) {
  // Assuming Vutil.VUtil_decodeGetConfigMsg is defined elsewhere
  const appSettings = VUtil_decodeGetConfigMsg(payload, offset, len);

  // Update strwifi with networktype from appSettings
  strwifi = appSettings.nwInfo.networktype;

  return appSettings;
}

function InvokeMessage(appSettings) {
  strwifi = appSettings.nwInfo.networktype;
  var get_config_values = '';

  var publish_on_off = appSettings.streamCfg.enabled === 0 ? false : true;
  var audio_on_off = appSettings.streamCfg.enableAudio === 0 ? false : true;
  var motion_on_off = appSettings.mdCfg.MdbEnable === 0 ? false : true;
  var email_on_off = appSettings.mdCfg.md_emailsnap_switch === 0 ? false : true;
  var flip_on_off = appSettings.imageCfg.flip === 0 ? false : true;
  var mirror_on_off = appSettings.imageCfg.mirror === 0 ? false : true;
  var wifiinfo = appSettings.nwInfo.networktype;
  var wdr = appSettings.imageCfg.wdr;

  var hf_imghue = appSettings.displayCfg.hue.toString();
  var hf_imgbright = appSettings.displayCfg.brightness.toString();
  var hf_imgcontrast = appSettings.displayCfg.contrast.toString();
  var hf_imgsaturation = appSettings.displayCfg.saturation.toString();
  var ircut = appSettings.displayCfg.ircutmode - 1;
  var osdCfg = '';
  var timeZone = appSettings.timeCfg.timeZone;
  var quality_level = 2;

  var record_on_off = appSettings.recordCh011.enable === 0 ? false : true;

  if (appSettings.osdCfg.cont_1.startsWith("Ambicam")) {
    osdCfg = appSettings.osdCfg.cont_1.substring(8);
  } else {
    osdCfg = appSettings.osdCfg.cont_1;
  }

  if (appSettings.videoCh012.bps === 768) {
    quality_level = 0;
  } else if (appSettings.videoCh012.bps === 512) {
    quality_level = 1;
  } else if (appSettings.videoCh012.bps === 120) {
    quality_level = 3;
  } else if (appSettings.videoCh012.bps === 80) {
    quality_level = 4;
  }

  var toggleSettings = {
    publish_on_off: publish_on_off,
    audio_on_off: audio_on_off,
    motion_on_off: motion_on_off,
    email_on_off: email_on_off,
    record_on_off: record_on_off,
    flip_on_off: flip_on_off,
    mirror_on_off: mirror_on_off,
    wifiinfo: wifiinfo,
    wdr: wdr,
    hf_imghue: hf_imghue,
    hf_imgbright: hf_imgbright,
    hf_imgcontrast: hf_imgcontrast,
    hf_imgsaturation: hf_imgsaturation,
    ircut: ircut,
    osdCfg: osdCfg,
    timeZone: timeZone,
    quality_level: quality_level,
    plan: plan
  };

  jsonString = JSON.stringify(toggleSettings);

  var mqttmessage = {
    srcId: gMyId,
    msgType: CommonConfig.MSG_TYPE_SET_CONFIG,
    dstId: 0
  };

  // Add a delay in JavaScript (equivalent to Thread.Sleep(2000) in C#)
  setTimeout(function () {
    // Your code to send the MQTT message here
  }, 2000);
}
