const bigPromise = require("../middlewares/bigPromise");
const messageSchema = require("../models/messageModel");
const chatSchema = require("../models/chatModel");
var crypto = require("crypto");

const grid = require("gridfs-stream");
const mongoose = require("mongoose");

let gfs, gridfsBucket;
const conn = mongoose.connection;
conn.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "docsss",
  });
  gfs = grid(conn.db, mongoose.mongo);
  gfs.collection("docsss");
});

exports.sendMessage = bigPromise(async (req, res) => {
  let { content, chatID, uuid, uuids, replyMessage, compressedImageArr } =
    req.body;

  console.log(compressedImageArr, "dqqqqqqqqqqqqqqqqqq");

  if (!content && !req.files) throw new Error("Cannot send empty message");
  if (!chatID) throw new Error("Chat ID not found");

  let filesName;

  if (req.files)
    filesName = req.files.map((el, idx) => {
      console.log(el, "lllllllllllllssss");
      return {
        name: el.originalname,
        uuid: uuids.split(",")[idx],
        url:
          (process.env.PROD === "false"
            ? process.env.LOCAL_SERVER_URL
            : process.env.REMOTE_SERVER_URL) +
          "message/get-file/" +
          el.filename,
        compressedImageBase64:
          idx === 0
            ? compressedImageArr.split(",data:image/")[idx]
            : "data:image/" + compressedImageArr.split(",data:image/")[idx],
        isImage: el.contentType.includes("image"),
      };
    });

  const messageObj = {
    content,
    sender: req.user._id,
    chat: chatID,
    uuid: uuid,
  };
  if (replyMessage.uuid) {
    messageObj.replyMessage = replyMessage;
  }
  if (filesName) {
    messageObj.files = filesName;
  }

  const message = await messageSchema.create(messageObj);

  await chatSchema.findByIdAndUpdate(chatID, { latestMessage: message });
  res.json({ data: message });
});

exports.uploadDocMessage = bigPromise(async (req, res) => {
  const file = await gfs.files.findOne({ filename: req.params.filename });
  const readStream = gridfsBucket.openDownloadStream(file._id);
  readStream.pipe(res);
});

exports.fetchAllMessages = bigPromise(async (req, res) => {
  const { chatID } = req.body;
  console.log({ chatID });

  // update unread mssg count to 0 if unread user matches with the logged user
  const chat = await chatSchema.findOne({ _id: chatID });

  if (
    chat &&
    chat.unreadUser &&
    req.user._id.toString() === chat?.unreadUser.toString()
  ) {
    chat.unreadCount = 0;
    chat.save();
  }

  if (!chatID) throw new Error("Chat ID not found");

  const findQuery = { chat: chatID };
  const allMessages = await messageSchema
    .find(findQuery)
    .sort({ updatedAt: "asc" })
    .populate("sender");

  res.json({ data: allMessages });
});
