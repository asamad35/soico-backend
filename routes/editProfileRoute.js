const express = require("express");
const router = express.Router();

const { multerUploads } = require("../middlewares/multerSingleUpload");
const { isLoggedIn } = require("../middlewares/userMiddleware");
const {
  updateStatus,
  updateName,
  updatePhoto,
} = require("../controllers/userController");

router.route("/update-name").post(isLoggedIn, updateName);
router.route("/update-status").post(isLoggedIn, updateStatus);
router.route("/update-photo").post(isLoggedIn, multerUploads, updatePhoto);

module.exports = router;
