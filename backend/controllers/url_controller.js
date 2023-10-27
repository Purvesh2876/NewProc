const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const url_list = require("../models/url_list");
const CVRPlan = require("../models/CVRPlan");
const crypto = require("crypto");
const ApiFeatures = require("../utils/apifeatures");
const mongoose = require('mongoose');


exports.getAllStreamUrls = async (req, res, next) => {
    try {
      const streamUrls = await url_list.find({}, 'streamurl'); // Fetch all stream URLs from url_list collection
      res.status(200).json({
        success: true,
        streamUrls: streamUrls
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error'
      });
    }
  };


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
    try {
        const data = await CVRPlan.aggregate([
            {
                $lookup: {
                    from: 'url_list', // The name of the collection to perform the join with
                    localField: 'Serverid', // Field from CVRPlan collection
                    foreignField: 'id', // Field from url_list collection
                    as: 'urlDetails' // Name of the new field to store the joined data
                }
            },
            {
                $unwind: {
                    path: '$urlDetails',
                    preserveNullAndEmptyArrays: true // Include plans with no matching streamurl in url_list
                }
            },
            {
                $project: {
                    plan: '$plan_name', // Rename fields if necessary
                    plandays: '$plandays',
                    streamurl: {
                        $cond: {
                            if: { $eq: ['$urlDetails', null] }, // Check if urlDetails is null (no matching streamurl)
                            then: '', // Set streamurl to an empty string
                            else: '$urlDetails.streamurl' // Use the streamurl from urlDetails
                        }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            serverUrl: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});


exports.getPlanById = catchAsyncErrors(async (req, res, next) => {
    const planId = req.params.id; // Extract the plan ID from the request parameters

    try {
        // Find the CVRPlan document by ID
        const plan = await CVRPlan.findById(planId).exec();

        if (!plan) {
            // If the document with the provided ID is not found
            return next(new ErrorHander("Plan not found", 404));
        }

        // Now, retrieve the 'streamurl' from the 'url_list' collection
        const streamurl = await url_list.findOne({ id: plan.Serverid }).select('streamurl').exec();

        // Send the retrieved plan fields and streamurl in the response
        res.status(200).json({
            success: true,
            plan: {
                _id: plan._id,
                // Include all CVRPlan fields here
                plan_name: plan.plan_name,
                plandays: plan.plandays,
                // ... include other fields as needed
                streamurl: streamurl ? streamurl.streamurl : null // Use streamurl if found, or null if not found
            }
        });
    } catch (error) {
        // Handle errors, e.g., validation errors
        next(error); // Pass the error to the error-handling middleware
    }
});


// 2nd for plan_name, plandays and streamurl



// exports.updatePlans = catchAsyncErrors(async (req, res, next) => {
//     const { plan_name, plandays, streamurl } = req.body; // Destructure plan_name, plandays, and streamurl from the request body
//     const planId = req.params.id; // Extract the plan ID from the request parameters

//     try {
//         // Find the CVRPlan document by ID and update plan_name, plandays, and streamurl properties
//         const updatedPlan = await CVRPlan.findByIdAndUpdate(
//             planId,
//             { plan_name, plandays, streamurl }, // Update plan_name, plandays, and streamurl properties
//             { new: true, runValidators: true } // Options: new returns the modified document, runValidators ensures validation is performed
//         );

//         if (!updatedPlan) {
//             // If the document with the provided ID is not found
//             return next(new ErrorHander("Plan not found", 404));
//         }

//         // Send the updated plan in the response
//         res.status(200).json({
//             success: true,
//             plan: updatedPlan,
//         });
//     } catch (error) {
//         // Handle errors, e.g., validation errors
//         next(error); // Pass the error to the error-handling middleware
//     }
// });

exports.updatePlan = catchAsyncErrors(async (req, res, next) => {
    const planId = req.params.id; // Extract the plan ID from the request parameters
    const { plan_name, plandays, streamurl } = req.body; // Extract updated fields from the request body

    try {
        // Update CVRPlan document by ID
        const updatedPlan = await CVRPlan.findByIdAndUpdate(planId, { plan_name, plandays }, { new: true }).exec();

        if (!updatedPlan) {
            // If the document with the provided ID is not found
            return next(new ErrorHander("Plan not found", 404));
        }

        // Update streamurl in url_list collection based on planId
        const updatedStreamUrl = await url_list.findOneAndUpdate(
            { id: updatedPlan.Serverid },
            { streamurl },
            { new: true }
        ).exec();

        // Send the updated plan and streamurl in the response
        res.status(200).json({
            success: true,
            plan: {
                _id: updatedPlan._id,
                plan_name: updatedPlan.plan_name,
                plandays: updatedPlan.plandays,
                streamurl: updatedStreamUrl ? updatedStreamUrl.streamurl : null
            }
        });
    } catch (error) {
        // Handle errors, e.g., validation errors
        next(error); // Pass the error to the error-handling middleware
    }
});





// exports.updatePlans = catchAsyncErrors(async (req, res, next) => {
//     const { plan_name, plandays, streamurl } = req.body; // Destructure plan_name, plandays, and streamurl from the request body
//     const planId = req.params.id; // Extract the plan ID from the request parameters

//     try {
//         // Find the CVRPlan document by ID and update the plan_name, plandays, and streamurl properties
//         const updatedPlan = await CVRPlan.findByIdAndUpdate(
//             planId,
//             { plan_name, plandays, streamurl }, // Update plan_name, plandays, and streamurl properties
//             { new: true, runValidators: true } // Options: new returns the modified document, runValidators ensures validation is performed
//         );

//         if (!updatedPlan) {
//             // If the document with the provided ID is not found
//             return next(new ErrorHander("Plan not found", 404));
//         }

//         // Send the updated plan in the response
//         res.status(200).json({
//             success: true,
//             plan: updatedPlan,
//         });
//     } catch (error) {
//         // Handle errors, e.g., validation errors
//         next(error); // Pass the error to the error-handling middleware
//     }
// });


exports.deletePlan = catchAsyncErrors(async (req, res, next) => {
    const planId = req.params.id;

    // Find the URL by ID and remove it
    const plan = await CVRPlan.findById(planId);

    if (!plan) {
        return next(new ErrorHander('URL not found', 404));
    }

    await plan.remove();

    res.status(200).json({
        success: true,
        message: 'URL deleted successfully',
    });
});