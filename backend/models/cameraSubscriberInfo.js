const mongoose = require("mongoose");

const cameraSubscriberInfoSchema = mongoose.Schema({
    id: {
        type: Number,
    },
    subemail: {
        type: String,
        required: [true, "Please Enter camera Id"],
    },
    subdeviceid: {
        type: String,
        required: [true, "Please Enter subscribed device Id"],
    },
    issubscribe: {
        type: Number,
        default: 0,
    },
    subscriptiondate: {
        type: Date,
        default: null,
    },
    cvrplanid: {
        type: Number,
        default: null,
    },
    urlid: {
        type: Number,
        default: 0,
    },
    plan_month: {
        type: Number,
        default: 0
    },
}, { collection: 'cameraSubscriberInfo' });

module.exports = mongoose.model("cameraSubscriberInfo", cameraSubscriberInfoSchema);
