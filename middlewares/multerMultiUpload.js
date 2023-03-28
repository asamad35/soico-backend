const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

const storage = new GridFsStorage({
  url: process.env.DB_URL,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (request, file) => {
    console.log({ file }, "ababababab");
    return {
      bucketName: "docsss",
      filename: `${Date.now()}-file-${file.originalname}`,
    };
  },
});

module.exports = multer({ storage });
