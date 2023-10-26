const mongoose = require("mongoose");

const cameraList = mongoose.Schema({
  id: {
    type: Number,
  },
  cameraID: {
    type: String,
  },
  isvalid: {
    type: Number,
    default: 0,
  },
  isptz: {
    type: Boolean,
    default: false,
  },
  isfhd: {
    type: Boolean,
    default: false,
  },
  isnumplate: {
    type: Boolean,
    default: false,
  },
  is360: {
    type: Boolean,
    default: false,
  },
  ProUrl: {
    type: String,
    default: 'tcp://pro.ambicam.com:1883',
  },
}, { collection: 'CameraList' });

module.exports = mongoose.model("cameraList", cameraList);
