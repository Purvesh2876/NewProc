const cameraDetails = require("../models/cameraDetails");
const cameraList = require("../models/cameraList");
const cameraSubscriberInfo = require("../models/cameraSubscriberInfo");
const Camera = require("../models/camera");
const CVRPlan = require("../models/CVRPlan");
const url_list = require("../models/url_list");
const streamdetails = require("../models/streamdetails");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const { v4: uuidv4 } = require('uuid');
const mqtt = require('mqtt');
// Create Product -- Admin
let gMyId = 0;
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  const name = req.body.name;
  const cameraID = req.body.cameraID;
  const customerid = req.body.customerid;

  const streamname = uuidv4();
  let cameraid = uuidv4();

  cameraid = cameraid.toUpperCase();
  let created_date = Date.now();

  let isExist = await cameraList.find({ cameraID: cameraID });

  if (isExist.length > 0) {
    return next(new ErrorHander("Camera already exists", 400));
  } else {
    const productlist = await cameraList.create({
      cameraID,
    });

    const product = await cameraDetails.create({
      cameraid,
      customerid,
      name,
      created_date,
    });

  }
  res.status(201).json({
    success: true,

    // product,
    // productlist,
  });
});

function getSettingDefault(cameraurl, email, deviceID, cameraname) {
  var appSettings = {
    uuid: deviceID,
    grUuid: email,
    streamCfg: {
      enabled: 1,
      enableAudio: 1,
      enableTelnet: 0,
      isHd: 0,
      publishUrl: cameraurl,
      mqttUrl: "tcp://pro.ambicam.com:1883", // Or use ConfigurationManager.AppSettings["mqttserver"] to get the value.
      telnetUrl: "telnet.ambicam.com:8888",
      fwUpdtTo: "a0",
    },
    timeCfg: {
      dstmode: 0,
      autoupdate: 1,
      autoupdatetzonvif: 0,
      ntpinterval: 1,
      ntpenable: 1,
      time: "00000000",
      timeZone: "Asia/Calcutta",
      tz: "STD:+5:30",
      ntpserver: "time.ambicam.com",
    },
    emailCfg: {
      emailserver: "smtp.gmail.com",
      emailusername: "alerts@ambicam.com",
      emailpassword: "v|c{azo)>?6",
      from: "alerts@ambicam.com",
      to: email,
      subject: "Ambicam Motion Alert",
      text: "This is an ambicam email alert",
      attatchment: "",
      emailport: 465,
      ssl: 1,
      logintype: 1,
    },
    videoCh011: {
      bps: 512,
      fps: 20,
      gop: 60,
      brmode: 2,
      piclevel: 1,
      fixqplevel: 1,
      width: 1280,
      height: 720,
      bmainstream: 1,
      bfield: 0,
    },
    videoCh012: {
      bps: 256,
      fps: 15,
      gop: 60,
      brmode: 2,
      piclevel: 1,
      fixqplevel: 1,
      width: 640,
      height: 360,
      bmainstream: 1,
      bfield: 0,
    },
    videoCh013: {
      bps: 64,
      fps: 5,
      gop: 15,
      brmode: 2,
      piclevel: 4,
      fixqplevel: 4,
      width: 320,
      height: 180,
      bmainstream: 1,
      bfield: 0,
    },
    displayCfg: {
      hue: 50,
      brightness: 50,
      saturation: 50,
      contrast: 50,
      ircutmode: 1,
    },
    osdCfg: {
      rgncnt: 2,
      fontsize: 1,
      x_0: 928,
      y_0: 32,
      w_0: 304,
      h_0: 32,
      cont_0: "YYYY-MM-DD hh:mm:ss",
      show_0: 1,
      x_1: 64,
      y_1: 32,
      w_1: 112,
      h_1: 32,
      cont_1: cameraname,
      show_1: 1,
    },
    recordCh011: {
      startTimerRec: 0,
      startManualRec: 1,
      singlefiletime: 300,
      enable: 0,
      filepath: "/bin/vs/sd/rec",
    },
    recordCh012: {
      startTimerRec: 0,
      startManualRec: 0,
      singlefiletime: 60,
      enable: 0,
      filepath: "/bin/vs/sd/rec",
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
      workday: [0, -1, 0, -1, 0, -1],
      weekend: [0, -1, 0, -1, 0, -1],
      sun: [0, -1, 0, -1, 0, -1],
      mon: [0, -1, 0, -1, 0, -1],
      tue: [0, -1, 0, -1, 0, -1],
      wed: [0, -1, 0, -1, 0, -1],
      thu: [0, -1, 0, -1, 0, -1],
      fri: [0, -1, 0, -1, 0, -1],
      sat: [0, -1, 0, -1, 0, -1]
    },
    imageCfg: {
      devno: 0,
      chn: 0,
      flip: 0,
      mirror: 0,
      wdr: 1,
    },
    mdCfg: {
      md_email_switch: 0,
      md_snap_switch: 1,
      md_emailsnap_switch: 0,
      md_ftpsnap_switch: 1,
      md_record_switch: 0,
      md_ftprec_switch: 0,
      md_ioalmdo_switch: 0,
      etm: 2,
      workday: 0,
      weekend: 0,
      md_interval: 30,
      MdbEnable: 0,
      MdSensitiValue: 1,
      MDThresholdValue: 10,
      MdInterval: 30,
      MdRegion: [
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        0, 0,
      ],
      md_alarm: 0,
      defend_alarm: 0,
      tc_alarm: 0,
    },
    devInfo: {
      hwVersion: 1,
      swVer: 1,
      provisioningVer: 1,
      publisherVer: 1,
      serialNo: "VVVIPC1504173580HSDS-j0TsuixTi4l"
    },
    nwInfo: {
      networktype: "NONE",
      macaddress: "00:00:00:00:00:00",
      ip: "0.0.0.0",
      netmask: "0.0.0.0",
      gateway: "0.0.0.0",
      sdnsip: "0.0.0.0",
      fdnsip: "0.0.0.0",
    },
    ptzinfo: {
      leftPos: 595,
      rightPos: 0,
      upPos: 0,
      downPos: 0,
      farPos: 0,
      nearPos: 0,
      currTiltPos: 0,
      currPanPos: 0,
      currZoomPos: 0,
    },
  };

  return appSettings;
}

exports.addProduct = catchAsyncErrors(async (req, res, next) => {
  const name = req.body.name;
  const cameraID = req.body.cameraID;
  const customerid = req.body.customerid;
  const email = req.body.email;

  // const camera = await cameraDetails.find({ cameraid: cameraID });
  const camera = await cameraSubscriberInfo.findOne({ subdeviceid: cameraID });

  const urlid = await url_list.findOne({ id: camera.urlid });
  // if (!camera) {
  //   return next(new ErrorHander("Camera not found", 404));
  // }
  const cameraDetail = await cameraDetails.findOne({ subid: camera.id });

  // if (cameraDetail) {
  //   return next(new ErrorHander("Camera already exists", 400));
  // }


  let cameraid = uuidv4();
  cameraid = cameraid.toUpperCase();
  let created_date = Date.now();
  const streamname = uuidv4();


  // const product = await cameraDetails.create({
  //   cameraid,
  //   customerid,
  //   name,
  //   created_date,
  //   subid: camera.id,
  // });

  // const streamDetails = await streamdetails.create({
  //   cameraid:cameraid, // Use the same cameraid as the newly created camera
  //   streamname: streamname, // Set your stream name here
  //   status: 0,               // Add other relevant fields
  //   StatusDate:Date.now(),
  //   alertDate:Date.now(),
  // });

  // if (!streamDetails) {
  //   return next(new ErrorHander("Failed to create streamdetails", 500));
  // }

  const appSettings = getSettingDefault(urlid.streamurl, email, cameraID, name);


  res.status(201).json({
    appSettings
  });
});

exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  try {
    const cameralists = await cameraDetails.find({ customerid: req.query.customerid });

    const promises = cameralists.map(async (camera) => {
      const subdevice = await cameraSubscriberInfo.findOne({ id: camera.subid });
      const cameraListData = await cameraList.findOne({ cameraID: subdevice.subdeviceid });
      const urlData = await url_list.findOne({ id: subdevice.urlid });
      const cvrPlanData = await CVRPlan.findOne({ id: subdevice.cvrplanid });
      const streamnameData = await streamdetails.findOne({ cameraid: camera.cameraid });

      const uuid = streamnameData.streamname; // Assuming 'uuid' is the field name
      const buffer = uuid.buffer;
      const uuidString = buffer.toString('hex');
      const uuidWithoutHyphens = uuidString;
      const formattedUUID = `${uuidWithoutHyphens.slice(0, 8)}-${uuidWithoutHyphens.slice(8, 12)}-${uuidWithoutHyphens.slice(12, 16)}-${uuidWithoutHyphens.slice(16, 20)}-${uuidWithoutHyphens.slice(20)}`;

      return {
        cameraid: camera.cameraid,
        customerid: camera.customerid,
        cameraname: camera.name,
        cameraurl: urlData.streamurl,
        createdDate: camera.created_date,
        deviceid: cameraListData.cameraID,
        is360: cameraListData.is360,
        isfhd: camera.isfhd,
        islive: streamnameData.status,
        isnumplate: cameraListData.isnumplate,
        isptz: camera.isptz,
        plandays: cvrPlanData.plandays,
        plandisplayname: cvrPlanData.plan_name,
        planname: cvrPlanData.plan_name,
        streamname: formattedUUID,
      };
    });

    const jsonData = await Promise.all(promises);

    res.status(200).json({
      success: true,
      totalItems: cameralists.length,
      cameras: jsonData,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});




exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  let cameraid = req.params.id;
  // console.log("cameraid", cameraid);

  let existCameras = await cameraDetails.findOne({ cameraid: cameraid })

  res.status(200).json(
    existCameras,
  );
});

exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 20;
  const productCount = await Camera.countDocuments();

  const apiFeature = new ApiFeatures(Camera.find(), req.query)
    .search()
    .filter();

  let productss = await apiFeature.query;

  apiFeature.pagination(resultPerPage);

  productss = await apiFeature.query;

  const totalPages = Math.ceil(productCount / resultPerPage);

  res.status(200).json({
    success: true,
    productss,
    productCount,
    totalPages,
  });
});

// Update Product -- Admin

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  const serverUrl = req.body.serverUrl;
  const cvrplan = req.body.serverUrl;

  let product = await cameraDetails.find({ subdeviceid: req.params.cameraid });

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  product[0].cameraurl = serverUrl || product[0].cameraurl;
  product[0].planname = cvrplan || product[0].planname;

  await product[0].save();

  res.status(200).json({
    success: true,
    product,
  });
});

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  let cameraid = req.params.id;
  // console.log("cameraid", cameraid);

  let existCamera = await cameraDetails.findOne({ cameraid: cameraid })

  let streaminfo = await streamdetails.findOne({ cameraid: cameraid });

  if (!existCamera) {
    return next(new ErrorHander("Camera not found", 404));
  }

  await existCamera.remove();

  if (!streaminfo) {
    return next(new ErrorHander("Camera not found", 404));
  }
  await streaminfo.remove();

  res.status(200).json(
    "Camera Deleted Successfully",
  );
});