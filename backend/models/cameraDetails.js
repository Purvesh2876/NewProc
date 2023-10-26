const mongoose = require("mongoose");

const cameraDetails = mongoose.Schema({
  id: {
    type: Number,
  },
  cameraid: {
    type: String,
    required: [true, "Please Enter camera Id"],
  },
  customerid: {
    type: String,
    required: [true, "Please Enter  customer Id"],
  },
  name: {
    type: String,
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
  device_id: {
    type: String,
    default: null,
  },
  urlid: {
    type: String,
    default: null,
  },
  cvrplanid: {
    type: String,
    default: null,
  },
  subid: {
    type: Number,
    default: null,
  },
  lag: {
    type: String,
    default: null,
  },
  lat: {
    type: String,
    default: null,
  },
  branch_id: {
    type: String,
    default: null,
  },
  isptz: {
    type: String,
    default: null,
  },
  isfhd: {
    type: String,
    default: null,
  },
}, { collection: 'CameraDetails' });

module.exports = mongoose.model("cameraDetails", cameraDetails);
