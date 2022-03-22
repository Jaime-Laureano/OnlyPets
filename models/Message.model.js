const { Schema, model } = require("mongoose");

const messageSchema = new Schema(
  {
    message: { type: String, required: true },
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true }
  }
);

const Message = model("Message", messageSchema);

module.exports = Message;