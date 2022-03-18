const { Schema, model } = require("mongoose");

const personSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    petList: [{ type: Schema.Types.ObjectId, ref: "Pet" }]
  }
);

const Person = model("Person", personSchema);

module.exports = Person;