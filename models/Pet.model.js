const { Schema, model } = require("mongoose");

const petSchema = new Schema({
  name: { type: String, required: true },
  species: { type: String, enum: ["cat", "dog"], required: true },
  breed: { type: String, required: true },
  age: { type: Number, min: 0, max: 30, required: true },
  size: { type: Number, required: true },
  weight: { type: Number, min: 0, max: 30, required: true },
  sex: { type: String, enum: ["male", "female"] },
  vaccinated: Boolean,
  neutered: Boolean,
  imageUrl: { type: String, required: true },
  messages: [{ type: Schema.Types.ObjectId, ref: "Message" }]
});

const Pet = model("Pet", petSchema);

module.exports = Pet;
