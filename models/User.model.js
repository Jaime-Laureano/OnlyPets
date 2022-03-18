const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    isShelter: Boolean
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
