const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const randomstring = require('randomstring');
const ApiFeatures = require("../utils/apifeatures");


// Create a random OTP
function generateOTP(lengthChar) {
  return randomstring.generate({
    length: lengthChar, // You can adjust the OTP length as needed
    charset: 'numeric',
  });
}


exports.generateActivationCode = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
});



// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  // const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //   folder: "avatars",
  //   width: 150,
  //   crop: "scale",
  // });

  const { email, password } = req.body;

  // find if user already exists
  const existUser = await User.findOne({ email });  // { email: email }

  if (existUser) {
    return next(new ErrorHander("User already exists", 400));
  }

  const activationcode = generateOTP(12);

  const customerid = generateOTP(16);

  // send email to user for activation
  // const message = `Your activation code is :- \n\n ${activationcode} \n\nIf you have not requested this email then, please ignore it.`;

  // try {
  //   await sendEmail({
  //     email: email,
  //     subject: `Ambicam Account Activation`,
  //     message,
  //   });
  // } catch (error) {
  //   return next(new ErrorHander(error.message, 500));
  // }


  const user = await User.create({
    customerid,
    email,
    password,
    activationcode,
  });

  sendToken(user, 201, res);
});

// Activate User
exports.activateUser = catchAsyncErrors(async (req, res, next) => {
  const { email, activationcode } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHander("User does not exist", 400));
  }

  if (user.activationcode !== activationcode) {
    return next(new ErrorHander("Invalid activation code", 400));
  }

  // Update the Isverified field to 1
  user.Isverified = 1;

  await user.save(); // Save the updated user document

  // You can also send a response here to indicate successful activation
  return res.status(200).json({ message: 'Email verification successfully' });
});


// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHander("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");


  if (!user) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid email or password", 401));
  }
  // if (password === "amb#3vmkt62wq") {
  //   sendToken(user, 200, res)
  // }

  sendToken(user, 200, res);
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHander("User not found", 404));
  }

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const testUrl = `http://localhost:3000/resetPassword/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${testUrl} \n\nIf you have not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ambicam Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHander(error.message, 500));
  }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHander(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHander("Password does not password", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// Get User Detail
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("password does not match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    email: req.body.email,
  };


  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Get all users(admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 20;
  const userCount = await User.countDocuments();

  const apiFeature = new ApiFeatures(User.find(), req.query)
  .search()
  .filter();

  let users = await apiFeature.query;

  apiFeature.pagination(resultPerPage);

  users = await apiFeature.query;

  const totalPages = Math.ceil(userCount / resultPerPage);

  res.status(200).json({
    success: true,
    users,
    userCount,
    totalPages,
  });
});

// Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const { Isverified, isactive } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHander("User does not exist", 400));
  }

  // Update the Isverified field to 1
  user.Isverified = Isverified;
  user.isactive = isactive;

  await user.save(); // Save the updated user document

  res.status(200).json({
    success: true,
  });
});

// Delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
