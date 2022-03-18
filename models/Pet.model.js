const { Schema, model } = require("mongoose");

const petSchema = new Schema({
  name: { type: String, required: true },
  species: { type: String, enum: ["cat", "dog"], required: true },
  age: { type: Number, min: 0, max: 30, required: true },
  size: { type: Number, required: true },
  weight: { type: Number, min: 0, max: 30, reuqired: true },
  sex: { type: String, enum: ["male", "female"] },
  vaccinated: Boolean,
});

const Pet = model("Pet", petSchema);

module.exports = Pet;
