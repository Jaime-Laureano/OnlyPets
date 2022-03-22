const router = require("express").Router();
const mongoose = require("mongoose");
const fileUploader = require('../config/cloudinary.config');
const Shelter = require("../models/Shelter.model");
const Person = require("../models/Person.model");
const Pet = require("../models/Pet.model");

router.get("/shelter-pets", async (req, res) => {
  const shelter = await Shelter.findOne({user: req.session.user._id});
  shelter.populate("pets");
  const pets = shelter.pets;
  res.render("shelter-pets", {pets});
});

router.get("/pet/add", (req, res) => {
  res.render("pet-add");
});

router.post('/pet/add', fileUploader.single('pet-image'), async (req, res) => {
  const { name, specieDog, specieCat, breed, age, size, weight, male, female, vaccinated, neutered } = req.body;
  const imageUrl = req.file.path;
  const shelter = await Shelter.findOne({user: req.session.user._id});

  const pet = new Pet({
    imageUrl: imageUrl,
    name: name,
    specie: specieDog ? "dog" : "cat",
    breed: breed,
    age: age,
    size: size,
    weight: weight,
    sex: male ? "male" : "female",
    vaccinated: vaccinated ? true : false,
    neutered: neutered ? true : false
  });
  await pet.save();

  shelter.pets.push(pet._id);
  await shelter.save();

  res.redirect("/shelter-pets");
});

router.get("/pet/edit/:id", async (req, res) => {
  const petId = mongoose.Types.ObjectId(req.params.id);
  const pet = await Pet.findById(petId);

  let options = {pet};
  if (pet.vaccinated) options.vaccinatedChecked = true;
  if (pet.neutered) options.neuteredChecked = true;
  pet.specie === "dog" ? options.specieDog = true : options.specieCat = true;
  pet.sex === "male" ? options.male = true : options.female = true;

  res.render("pet-edit", options);
});

router.post("/pet/edit/:id", fileUploader.single('pet-image'), async (req, res) => {
  const { name, specieDog, specieCat, breed, age, size, weight, male, female, vaccinated, neutered } = req.body;
  const petId = mongoose.Types.ObjectId(req.params.id);
  const pet = await Pet.findById(petId);
  
  if (req.file) {
    pet.imageUrl = req.file.path;
  } else {
    pet.imageUrl = existingImage;
  }

  pet.name = name;
  pet.specie = specieDog ? "dog" : "cat";
  pet.breed = breed;
  pet.age = age;
  pet.size = size;
  pet.weight = weight;
  pet.sex = male ? "male" : "female";
  pet.vaccinated = vaccinated ? true : false;
  pet.neutered = neutered ? true : false;
  await pet.save();

  res.redirect("/shelter-pets");
});

router.get("/pet/delete/:id", async (req, res) => {
  const petId = mongoose.Types.ObjectId(req.params.id);
  const petLists = await Person.find({petList: petId});

  petLists.forEach(async (petList) => {
    petList.splice(petList.indexOf(petId), 1);
    await petList.save();
  });

  const shelter = await Shelter.findOne({user: req.session.user._id});
  shelter.pets.splice(shelter.pets.indexOf(petId), 1);
  shelter.save();

  await Pet.findByIdAndDelete(petId);

  res.redirect("/shelter-pets");
});

module.exports = router;