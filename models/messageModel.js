const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserSchema",
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSchema",
    },
    content: {
      type: String,
      trim: true,
    },
    replyMessage: {
      uuid: String,
      content: String,
      sendOrReceived: String,
      senderName: String,

      image: Boolean,
      parentUuid: String,
      docName: String,
      compressedImageBase64: String,
      isImageLocal: String,
    },
    files: {
      type: [
        {
          isImage: { type: Boolean, default: false },
          name: { type: String },
          url: { type: String },
          compressedImageBase64: { type: String },
          uuid: { type: String, required: true },
        },
      ],
      default: [],
    },
    uuid: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MessageSchema", messageSchema);
