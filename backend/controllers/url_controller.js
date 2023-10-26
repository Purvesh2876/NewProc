const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const url_list = require("../models/url_list");
const CVRPlan = require("../models/CVRPlan");
const crypto = require("crypto");
const ApiFeatures = require("../utils/apifeatures");


exports.getUrllist = catchAsyncErrors(async (req, res, next) => {
    const url = await url_list.find();
    res.status(200).json({
        success: true,
        url,
    });
});

exports.deleteUrl = catchAsyncErrors(async (req, res, next) => {
    const urlId = req.params.id;

    // Find the URL by ID and remove it
    const url = await url_list.findById(urlId);

    if (!url) {
        return next(new ErrorHander('URL not found', 404));
    }

    await url.remove();

    res.status(200).json({
        success: true,
        message: 'URL deleted successfully',
    });
});

// exports.updateUrls = catchAsyncErrors(async (req, res, next) => {

//     const streamurl = req.body.streamurl;

//     const streamurls = url_list.findById(req.params.id);

//     streamurls.streamurl = streamurl;

//     await streamurls.save();

//     res.status(200).json({
//         success: true,
//         streamurls,
//     });
// });

exports.updateUrls = catchAsyncErrors(async (req, res, next) => {
    const { streamurl } = req.body;
    const urlId = req.params.id;

    // Use findByIdAndUpdate to find and update the document in a single step
    const updatedUrl = await url_list.findByIdAndUpdate(urlId, { streamurl }, { new: true });

    if (!updatedUrl) {
        return next(new ErrorHander("URL not found", 404));
    }

    res.status(200).json({
        success: true,
        updatedUrl,
    });
});


exports.plans = catchAsyncErrors(async (req, res, next) => {
    const url = await CVRPlan.find();
    let serverUrl = [];

    for (let i = 0; i < url.length; i++) {
        let serverId = url[i].Serverid;
        let urllists = await url_list.find({ id: serverId });
        let urllist = urllists[0].streamurl;
        let plan = url[i].plan_name;
        let plandays = url[i].plandays;

        let data = {
            plan,
            plandays,
            urllist
        }
        serverUrl.push(data);
    }


    res.status(200).json({
        success: true,
        serverUrl,
    });
});

// exports.plans = catchAsyncErrors(async (req, res, next) => {
//     const url = await CVRPlan.find();
//     const serverUrls = await url_list.find({ id: url.map(item => item.Serverid) });

//     const streamUrls = serverUrls.map(server => server.streamurl);

//     url.forEach((item, index) => {
//         item.streamurl = streamUrls[index];
//     });

//     res.status(200).json({
//         success: true,
//         url,
//         url: streamUrls, // Send the extracted "streamurl" values
//     });
// });



exports.updatePlans = catchAsyncErrors(async (req, res, next) => {

    const plan_name = req.body.plan_name;
    const plandetail = req.body.plandetail;
    const plandays = req.body.plandays;
    const isenable = req.body.isenable;
    const price = req.body.price;

    const plans = CVRPlan.findById(req.params.id);

    plans.plan_name = plan_name;
    plans.plandetail = plandetail;
    plans.plandays = plandays;
    plans.isenable = isenable;
    plans.price = price;

    await plans.save();

    res.status(200).json({
        success: true,
        plans,
    });
});