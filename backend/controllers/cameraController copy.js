const mqtt = require('mqtt');
const { getSingleProducts } = require("./productController");

const cameradal = require('./cameradal'); // Import your camera data access layer
const CommonConfig = require('./'); // Import your CommonConfig module
const Log = require('./Log'); // Import your logging module
const mqttUrl = "tcp://pro.ambicam.com:1883";
const dbName = "vmukti";
const tbName = "VCam1_1";
const topic = "hr-0002";

const cameraSettings = {
    cameraname: "",
    cameraurl: "",
    streamname: "",
    deviceid: "",
    msgtoset: "",
    msgtype: 0,
    settype: 0,
    _file: "",
    osdCfg: "",
    plan: "",
    wifiinfo: "",
    quality_level: 0,
    publish_on_off: false,
    email_on_off: false,
    record_on_off: false,
    audio_on_off: false,
    motion_on_off: false,
    timeZone: "",
    hf_imghue: "",
    hf_imgbright: "",
    hf_imgcontrast: "",
    hf_imgsaturation: "",
    wdr: 0,
    ircut: 0,
    flip_on_off: false,
    mirror_on_off: false,
};

const CommonConfig = {
    TAG_UUID: "Uuid",
    TAG_GR_UUID: "GrUuid",
    TAG_STREAM_CFG: "StreamCfg",
    TAG_TIME_CFG: "TimeCfg",
    TAG_EMAIL_CFG: "EmailCfg",
    TAG_VIDEO_CFG: "VideoCfg",
    TAG_DISPLAY_CFG: "DisplayCfg",
    TAG_OSD_CFG: "OsdCfg",
    TAG_RECORD_CFG: "RecordCfg",
    TAG_IMAGE_CFG: "ImageCfg",
    TAG_MD_CFG: "MdCfg",
    TAG_DEV_INFO: "DevInfo",
    TAG_NET_INFO: "NetworkInfo",
    TAG_PTZ_INFO: "PtzCfg",

    TAG_VIDEO_CH011: "VideoCh011",
    TAG_VIDEO_CH012: "VideoCh012",
    TAG_VIDEO_CH013: "VideoCh013",

    TAG_RECORD_CH011: "RecordCh011",
    TAG_RECORD_CH012: "RecordCh012",
    TAG_RECORD_SCH: "RecordSch",

    ADDR_ID_BROADCAST: -1,
    ADDR_ID_CONF_SERVER: 0,

    MSG_TYPE_KEEP_ALIVE: 0,
    MSG_TYPE_GET_CONFIG: 1,
    MSG_TYPE_SET_CONFIG: 2,
    MSG_TYPE_AUDIO: 3,
    MSG_TYPE_FILE: 4,
    MSG_TYPE_DISCONNECT: 5,
    MSG_TYPE_GET_STATUS: 6,
    MSG_TYPE_GET_CLI_STATS: 7,
    MSG_TYPE_GET_GRP_STATS: 8,
    MSG_TYPE_ALARM: 9,
    MSG_TYPE_FACTORY_DFLT: 10,
    MSG_TYPE_REBOOT: 11,
    MSG_TYPE_REDIRECT: 12,
    MSG_TYPE_EMail_publishURL_cameraName: 104,
    MSG_TYPE_GET_LIST: 54,
    MSG_TYPE_GET_VIDEO_FILE: 53,
    MSG_TYPE_CANCEL_VIDEO_FILE: 55,
};


async function getSetting(cameraid) {
    try {
        const listcamera = await getSingleProducts(cameraid)

        if (listcamera) {
            const deviceid = listcamera.deviceid;
            const plan = listcamera.planname;
            const msgtype = CommonConfig.MSG_TYPE_GET_CONFIG;
            await connectMQTT(); // Assuming connectMQTT is an async function

            // Simulate sleep for 5 seconds (5000 milliseconds)
            await new Promise(resolve => setTimeout(resolve, 5000));

            return jsonString; // Assuming jsonString is defined somewhere
        } else {
            return "ERROR";
        }
    } catch (ex) {
        Log.logmessage("getSetting()", ex.message);
        return "ERROR: Unable to connect to server, Please try again";
    }
}

async function connectMQTT() {
    try {
        const host = 'tcp://pro.ambicam.com:1883' // Assuming ObjUserDAL.GetcameraProUrl is defined
        const randomTopic = "webPc-" + Math.floor(Math.random() * 1000000);
        const gMyId = randomTopic;


        const client = mqtt.connect(host, {
            clientId: gMyId,
        });

        client.on('connect', () => {
            RegisterSubscriptions();
            console.log('Connected to MQTT broker');
            if (msgtype === CommonConfig.MSG_TYPE_GET_CONFIG) {
                const struuid = deviceid;
                const request = `<uuid name="${struuid}" >`;
                const requestLen = request.length + 1;
                const arraybuffer = new Array(requestLen + 16);
                const mqttmessage = {};

                mqttmessage.srcId = gMyId;
                mqttmessage.msgType = CommonConfig.MSG_TYPE_GET_CONFIG;
                mqttmessage.msgLen = requestLen;
                mqttmessage.dstId = 0;
                let offset = Vutil.VUtil_encodeMsgHeader(arraybuffer, mqttmessage);

                for (let i = 0; i < request.length; i++) {
                    arraybuffer[offset++] = request.charCodeAt(i);
                }

                arraybuffer[offset++] = 0;
                const bytes = new Uint8Array(arraybuffer);
                const payload = Buffer.from(bytes.buffer);
                PublishMqtt(`${dbName}/${tbName}/tx/${topic}`, payload);

                if (settype === 1) {
                    msgtype = CommonConfig.MSG_TYPE_SET_CONFIG;
                }
            }
            else if (msgtype === CommonConfig.MSG_TYPE_GET_LIST) {
                const struuid = deviceid + "," + _file;
                const request = `<uuid name=${struuid} >`;
                const requestLen = request.length + 1;
                const arraybuffer = new Array(requestLen + 16);
                const mqttmessage = {};

                mqttmessage.srcId = gMyId;
                mqttmessage.msgType = CommonConfig.MSG_TYPE_GET_LIST;
                mqttmessage.msgLen = requestLen;
                mqttmessage.dstId = 0;
                let offset = Vutil.VUtil_encodeMsgHeader(arraybuffer, mqttmessage);

                for (let i = 0; i < request.length; i++) {
                    arraybuffer[offset++] = request.charCodeAt(i);
                }

                arraybuffer[offset++] = 0;
                const bytes = new Uint8Array(arraybuffer);
                const payload = Buffer.from(bytes.buffer);
                PublishMqtt(`${dbName}/${tbName}/tx/${topic}`, payload);
            } else if (msgtype === CommonConfig.MSG_TYPE_SET_CONFIG) {
                const set_appsetting = JSON.parse(msgtoset);

                // Edit cameraname
                // var camtxt = document.getElementById('camnameplayer');
                // camtxt.setAttribute('disabled', 'disabled');
                set_appsetting.osdCfg.cont_1 = "Ambicam " + this.osdCfg;

                set_appsetting.displayCfg.hue = parseInt(this.hf_imghue);
                set_appsetting.displayCfg.brightness = parseInt(this.hf_imgbright);
                set_appsetting.displayCfg.contrast = parseInt(this.hf_imgcontrast);
                set_appsetting.displayCfg.saturation = parseInt(this.hf_imgsaturation);

                set_appsetting.nwInfo.networktype = this.wifiinfo;

                set_appsetting.recordCh011.enable = this.record_on_off ? 1 : 0;

                set_appsetting.displayCfg.ircutmode = this.ircut + 1;
                set_appsetting.imageCfg.flip = this.flip_on_off ? 1 : 0;
                set_appsetting.imageCfg.mirror = this.mirror_on_off ? 1 : 0;
                set_appsetting.imageCfg.wdr = this.wdr;

                set_appsetting.streamCfg.enabled = this.publish_on_off ? 1 : 0;
                set_appsetting.streamCfg.enableAudio = this.audio_on_off ? 1 : 0;
                set_appsetting.mdCfg.MdbEnable = this.motion_on_off ? 1 : 0;
                set_appsetting.mdCfg.md_emailsnap_switch = this.email_on_off ? 1 : 0;

                if (quality_level === 0) {
                    set_appsetting.videoCh012.bps = 768;
                    set_appsetting.videoCh012.fps = 25;
                    set_appsetting.videoCh012.gop = 100;
                    set_appsetting.videoCh012.brmode = 2;
                    set_appsetting.videoCh012.width = 640;
                    set_appsetting.videoCh012.height = 360;
                    set_appsetting.videoCh012.bmainstream = 1;
                    set_appsetting.videoCh012.bfield = 0;
                    set_appsetting.videoCh012.piclevel = 1;
                    set_appsetting.videoCh012.fixqplevel = 1;
                } else if (quality_level === 1) {
                    set_appsetting.videoCh012.bps = 512;
                    set_appsetting.videoCh012.fps = 20;
                    set_appsetting.videoCh012.gop = 80;
                    set_appsetting.videoCh012.brmode = 2;
                    set_appsetting.videoCh012.width = 640;
                    set_appsetting.videoCh012.height = 360;
                    set_appsetting.videoCh012.bmainstream = 1;
                    set_appsetting.videoCh012.bfield = 0;
                    set_appsetting.videoCh012.piclevel = 2;
                    set_appsetting.videoCh012.fixqplevel = 2;
                } else if (quality_level === 3) {
                    set_appsetting.videoCh012.bps = 120;
                    set_appsetting.videoCh012.fps = 10;
                    set_appsetting.videoCh012.gop = 40;
                    set_appsetting.videoCh012.brmode = 2;
                    set_appsetting.videoCh012.width = 640;
                    set_appsetting.videoCh012.height = 360;
                    set_appsetting.videoCh012.bmainstream = 1;
                    set_appsetting.videoCh012.bfield = 0;
                    set_appsetting.videoCh012.piclevel = 4;
                    set_appsetting.videoCh012.fixqplevel = 4;
                } else if (quality_level === 4) {
                    set_appsetting.videoCh012.bps = 80;
                    set_appsetting.videoCh012.fps = 5;
                    set_appsetting.videoCh012.gop = 12;
                    set_appsetting.videoCh012.brmode = 2;
                    set_appsetting.videoCh012.width = 640;
                    set_appsetting.videoCh012.height = 360;
                    set_appsetting.videoCh012.bmainstream = 1;
                    set_appsetting.videoCh012.bfield = 0;
                    set_appsetting.videoCh012.piclevel = 5;
                    set_appsetting.videoCh012.fixqplevel = 5;
                } else {
                    set_appsetting.videoCh012.bps = 250;
                    set_appsetting.videoCh012.fps = 15;
                    set_appsetting.videoCh012.gop = 60;
                    set_appsetting.videoCh012.brmode = 2;
                    set_appsetting.videoCh012.width = 640;
                    set_appsetting.videoCh012.height = 360;
                    set_appsetting.videoCh012.bmainstream = 1;
                    set_appsetting.videoCh012.bfield = 0;
                    set_appsetting.videoCh012.piclevel = 3;
                    set_appsetting.videoCh012.fixqplevel = 3;
                }

                set_appsetting.timeCfg.timeZone = timeZone;

                const msgStr = Vutil.VUtil_encodeMsg(set_appsetting);

                const arraybuffer = new Array(msgStr.length + 16);
                const mqttmessage = {};

                mqttmessage.srcId = gMyId;
                mqttmessage.msgType = CommonConfig.MSG_TYPE_SET_CONFIG;
                mqttmessage.msgLen = msgStr.length;
                mqttmessage.dstId = 0;
                let offset = Vutil.VUtil_encodeMsgHeader(arraybuffer, mqttmessage);

                for (let i = 0; i < msgStr.length; i++) {
                    arraybuffer[offset++] = msgStr.charCodeAt(i);
                }

                const bytes = new Uint8Array(arraybuffer);
                const payload = Buffer.from(bytes.buffer);
                PublishMqtt(`${dbName}/${tbName}/tx/${topic}`, payload);

                setTimeout(() => {
                    publishdone.set();
                }, 2000);
            } else if (msgtype === CommonConfig.MSG_TYPE_REBOOT) {
                const struuid = deviceid;
                const request = `<uuid name=${struuid} >`;
                const requestLen = request.length + 1;
                const arraybuffer = new Array(requestLen + 16);
                const mqttmessage = {};

                mqttmessage.srcId = gMyId;
                mqttmessage.msgType = CommonConfig.MSG_TYPE_REBOOT;
                mqttmessage.msgLen = requestLen;
                mqttmessage.dstId = 0;
                let offset = Vutil.VUtil_encodeMsgHeader(arraybuffer, mqttmessage);

                for (let i = 0; i < request.length; i++) {
                    arraybuffer[offset++] = request.charCodeAt(i);
                }

                arraybuffer[offset++] = 0;
                const bytes = new Uint8Array(arraybuffer);
                const payload = Buffer.from(bytes.buffer);
                PublishMqtt(`${dbName}/${tbName}/tx/${topic}`, payload);

                setTimeout(() => {
                    publishdone.set();
                }, 2000);
            }
        });

        client.on('error', (error) => {
            console.error('Error:', error.message);
            // Handle errors here
        });

        client.on('close', () => {
            console.log('Disconnected from MQTT broker');
            // Handle disconnects here
        });

        client.on('message', (topic, message) => {
            // Handle incoming messages here
        });

        if (msgtype === CommonConfig.MSG_TYPE_GET_CONFIG) {
            // Subscribe to a specific topic if needed
            client.subscribe(topic, (error) => {
                if (error) {
                    console.error('Error subscribing to topic:', error.message);
                }
            });
        }
    } catch (ex) {
        console.error('Error:', ex.message);
        // Handle exceptions here
    }
}

function RegisterSubscriptions() {
    const subscriptionTopic = `${dbName}/${tbName}/rx/${topic}`;
    client.subscribe(subscriptionTopic, { qos: 0 }, (error) => {
        if (error) {
            console.error('Error subscribing to topic:', error.message);
        } else {
            console.log('Subscribed to topic:', subscriptionTopic);
        }
    });
}

function PublishMqtt(topic, payload) {
    try {
        client.publish(topic, payload, { qos: 0, retain: false }, (error) => {
            if (error) {
                console.error('Error publishing message:', error.message);
            } else {
                console.log('Published message to topic:', topic);
            }
        });
    } catch (ex) {
        console.error('Error:', ex.message);
        // Handle exceptions here
    }
}

function invokeMessage(appSettings) {
    const strwifi = appSettings.nwInfo.networktype;
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

    const timeZone = appSettings.timeCfg.timeZone;
    let quality_level = 2;

    const record_on_off = appSettings.recordCh011.enable === 0 ? false : true;

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
    } else {
        quality_level = 2;
    }

    const toggleSettings = {
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

    const jsonString = JSON.stringify(toggleSettings);
    const mqttmessage = {
        srcId: gMyId,
        msgType: CommonConfig.MSG_TYPE_SET_CONFIG,
        dstId: 0
    };

    setTimeout(() => {
        // Rest of the code here
    }, 2000);
}

function processStatusMsg(payload, offset, len) {
    const clientStats = Vutil.VUtil_decodeStatusMsg(payload, offset, len);
    let str = "";

    for (let i = 0; i < clientStats.length - 1; i++) {
        if (1 === clientStats[i].isUp) {
            str += clientStats[i].name;
        } else {
            str += clientStats[i].name;
        }
        str += '\n';
    }
    return str;
    // You can't update the DOM directly in Node.js, so the following line won't work here:
    // document.getElementById('statusTxt2').innerHTML = str;
}

function processAlarmMsg(topic) {
    // Implement the logic for processing alarm messages here
}

function processGroupStatusMsg(payload, offset, len) {
    // Implement the logic for processing group status messages here
}

function processDisconnectMsg(payload, offset, len) {
    // Implement the logic for processing disconnect messages here
}

function processFileMsg(payload, offset, len) {
    // Implement the logic for processing file messages here
}

function processAudioMsg(payload, offset, len) {
    // Implement the logic for processing audio messages here
}

function processSetConfigMsg(payload, offset, len) {
    // Implement the logic for processing set config messages here
}

function processGetFilelistMsg(payload, offset, len) {
    try {
        const str_flist = Vutil.VUtil_getStringFromBuff(payload, offset, len);
        const flist_array = str_flist.split(',');
        // div_flist.Controls.Add(new LiteralControl("<ul class='list-group' id='ul_data'>"));
        let g = 0;
        flist_array.forEach((f) => {
            // System.Web.UI.WebControls.Button dynamicButton = new System.Web.UI.WebControls.Button();
            // dynamicButton.Text = f.split(':')[0];
            // dynamicButton.CssClass = "btn btn-link";
            // dynamicButton.Click += new EventHandler(dynamicButton_Click);

            // div_flist.Controls.Add(dynamicButton);
            if (f.split(':')[1] !== '0') {
                // div_flist.Controls.Add(new LiteralControl("<li class='list-group-item list-group-item-info'><i class='fa fa-file'></i>" + f.split(':')[0] + "<div class='panel panel-default' id='div_"+g+"'></div></li>"));
            } else {
                // div_flist.Controls.Add(new LiteralControl("<li class='list-group-item'><i class='fa fa-folder'></i>" + f.split(':')[0] + "<div class='panel panel-default' id='div_" + g + "'></div></li>"));
            }
            g++;
        });

        // div_flist.Controls.Add(new LiteralControl("</ul>"));
    } catch (ex) {
        // Handle the exception
    }
}

function processGetConfigMsg(payload, offset, len) {
    const appSettings = Vutil.VUtil_decodeGetConfigMsg(payload, offset, len);
    strwifi = appSettings.nwInfo.networktype;
    // set values

    // updatepanelsetting.Update();
    return appSettings;
}

function processKeepAliveMsg(payload, offset, len) {
    // Implement the logic for processing keep-alive messages here
}

function JSONSerialize(objstreamsetting) {
    // You can use the built-in JSON.stringify method in Node.js to serialize objects to JSON format
    return JSON.stringify(objstreamsetting);
}

function JSONDeSerialize(objstreamsetting) {
    // Use the built-in JSON.parse method in Node.js to deserialize JSON to an object
    return JSON.parse(objstreamsetting);
}

async function btnsaveconfig_Click() {
    try {
        msgtype = CommonConfig.MSG_TYPE_SET_CONFIG;
        await ConnectMQTT();

        client.connect(true);
        await publishdone.wait(20000);
        client.disconnect();
        // Implement any additional logic you need after the MQTT operations
    } catch (ex) {
        // Handle any exceptions
    }
}
async function btn_reboot_Click() {
    try {
        msgtype = CommonConfig.MSG_TYPE_REBOOT;
        await ConnectMQTT();
        client.connect(true);
        await publishdone.wait(20000);
        client.disconnect();
    } catch (ex) {
        // Handle any exceptions
    }
}

async function btn_listFile_Click() {
    _file = '';
    msgtype = CommonConfig.MSG_TYPE_GET_LIST;
    try {
        await ConnectMQTT();
        client.connect(true);
        await publishdone.wait(20000);
        client.disconnect();
    } catch (ex) {
        // Handle any exceptions
    }
}

function dynamicButton_Click(sender) {
    _file = sender.text;
    msgtype = CommonConfig.MSG_TYPE_GET_LIST;
    ConnectMQTT().then(() => {
        client.connect(true);
        publishdone.wait(20000).then(() => {
            client.disconnect();
        });
    }).catch((ex) => {
        // Handle any exceptions
    });
}
