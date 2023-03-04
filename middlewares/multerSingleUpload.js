const multer = require("multer");
const DataUriParser = require("datauri/parser");
const path = require("path");

const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single("profilePic");

const getDataUri = (file) => {
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};

module.exports = { multerUploads, getDataUri };
