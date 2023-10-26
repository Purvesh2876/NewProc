let appSettings = {
    uuid: "", // Set your desired values here
    grUuid: "",
    streamCfg: {
      enabled: 0,
      enableAudio: 0,
      enableTelnet: 0,
      isHd: 0,
      publishUrl: "",
      mqttUrl: "",
      telnetUrl: "",
      fwUpdtTo: ""
    },
    timeCfg: {
      dstmode: 0,
      autoupdate: 0,
      autoupdatetzonvif: 0,
      ntpinterval: 0,
      ntpenable: 0,
      time: "",
      timeZone: "",
      tz: "",
      ntpserver: ""
    },
    emailCfg: {
      emailserver: "",
      emailusername: "",
      emailpassword: "",
      from: "",
      to: "",
      subject: "",
      text: "",
      attatchment: "",
      emailport: 0,
      ssl: 0,
      logintype: 0
    },
    videoCh011: {
      bps: 0,
      fps: 0,
      gop: 0,
      brmode: 0,
      piclevel: 0,
      fixqplevel: 0,
      width: 0,
      height: 0,
      bmainstream: 0,
      bfield: 0
    },
    videoCh012: {
      bps: 0,
      fps: 0,
      gop: 0,
      brmode: 0,
      piclevel: 0,
      fixqplevel: 0,
      width: 0,
      height: 0,
      bmainstream: 0,
      bfield: 0
    },
    videoCh013: {
      bps: 0,
      fps: 0,
      gop: 0,
      brmode: 0,
      piclevel: 0,
      fixqplevel: 0,
      width: 0,
      height: 0,
      bmainstream: 0,
      bfield: 0
    },
    displayCfg: {
      hue: 0,
      brightness: 0,
      saturation: 0,
      contrast: 0,
      ircutmode: 0
    },
    osdCfg: {
      rgncnt: 0,
      fontsize: 0,
      x_0: 0,
      y_0: 0,
      w_0: 0,
      h_0: 0,
      cont_0: "",
      show_0: 0,
      x_1: 0,
      y_1: 0,
      w_1: 0,
      h_1: 0,
      cont_1: "",
      show_1: 0
    },
    recordCh011: {
      enable: 0,
      startTimerRec: 0,
      startManualRec: 0,
      singlefiletime: 0,
      filepath: ""
    },
    recordCh012: {
      startTimerRec: 0,
      startManualRec: 0,
      singlefiletime: 0,
      enable: 0,
      filepath: ""
    },
    recordSch: {
      etm: 0,
      enWorkday: 0,
      enWeekend: 0,
      enSun: 0,
      enMon: 0,
      enTue: 0,
      enWed: 0,
      enThu: 0,
      enFri: 0,
      enSat: 0,
      workday: [],
      weekend: [],
      sun: [],
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: []
    },
    imageCfg: {
      devno: 0,
      chn: 0,
      flip: 0,
      mirror: 0,
      wdr: 0
    },
    mdCfg: {
      md_email_switch: 0,
      md_snap_switch: 0,
      md_emailsnap_switch: 0,
      md_ftpsnap_switch: 0,
      md_record_switch: 0,
      md_ftprec_switch: 0,
      md_ioalmdo_switch: 0,
      etm: 0,
      workday: 0,
      weekend: 0,
      md_interval: 0,
      MdbEnable: 0,
      MdSensitiValue: 0,
      MDThresholdValue: 0,
      MdInterval: 0,
      MdRegion: [],
      md_alarm: 0,
      defend_alarm: 0,
      tc_alarm: 0
    },
    devInfo: {
      hwVer: 0,
      swVer: 0,
      provisioningVer: 0,
      publisherVer: 0,
      serialNo: "",
      sdStatus: "",
      sdSize: 0,
      sdleftSize: 0
    },
    nwInfo: {
      networktype: "",
      macaddress: "",
      ip: "",
      netmask: "",
      gateway: "",
      sdnsip: "",
      fdnsip: ""
    },
    PtzCfg: {
      leftPos: 0,
      rightPos: 0,
      upPos: 0,
      downPos: 0,
      farPos: 0,
      nearPos: 0,
      currPanPos: 0,
      currTiltPos: 0,
      currZoomPos: 0
    }
  };

  module.exports = appSettings;