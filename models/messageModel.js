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
    files: {
      type: [
        {
          isImage: { type: Boolean, default: false, require: true },
          name: { type: String, require: true },
          url: { type: String, unique: true, require: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MessageSchema", messageSchema);
