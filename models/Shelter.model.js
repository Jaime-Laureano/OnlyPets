const { Schema, model } = require("mongoose");

const shelterSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pets: [{ type: Schema.Types.ObjectId, ref: "Pet" }]
  }
);

const Shelter = model("Shelter", shelterSchema);

module.exports = Shelter;