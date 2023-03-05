const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/userMiddleware");
const multiFileIpload = require("../middlewares/multerMultiUpload");
const {
  sendMessage,
  fetchAllMessages,
  uploadDocMessage,
} = require("../controllers/messageController");

router
  .route("/send-message")
  .post(isLoggedIn, multiFileIpload.array("filesToUpload"), sendMessage);
router.route("/get-file/:filename").get(uploadDocMessage);
router.route("/fetch-all-messages").post(isLoggedIn, fetchAllMessages);

module.exports = router;
