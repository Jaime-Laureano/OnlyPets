const { Schema, model } = require("mongoose");

const shelterSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pets: []
  }
);

const Shelter = model("Shelter", shelterSchema);

module.exports = Shelter;