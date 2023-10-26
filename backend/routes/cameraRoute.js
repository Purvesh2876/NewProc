const express = require("express");
const {getsetting, setsetting} = require("../controllers/cameraController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/camera/get").post(getsetting);

router.route("/camera/set").post(setsetting);


module.exports = router;
