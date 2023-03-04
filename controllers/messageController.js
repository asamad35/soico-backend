const bigPromise = require("../middlewares/bigPromise");
const messageSchema = require("../models/messageModel");
const chatSchema = require("../models/chatModel");

exports.sendMessage = bigPromise(async (req, res) => {
  const { content, chatID } = req.body;
  console.log(req.files, "kkkkkkkkkkkkkkkkkkkaaaakkkkkkkkk");

  if (!content && !req.files) throw new Error("Cannot send empty message");
  if (!chatID) throw new Error("Chat ID not found");

  let filesName;

  if (req.files) filesName = req.files.map((el) => el.filename);

  const messageObj = {
    content,
    sender: req.user._id,
    chat: chatID,
  };
  if (filesName) {
    messageObj.files = filesName;
  }

  const message = await messageSchema.create(messageObj);

  await chatSchema.findByIdAndUpdate(chatID, { latestMessage: message });
  res.json({ data: message });
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
