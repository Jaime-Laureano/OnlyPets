const router = require("express").Router();
const mongoose = require("mongoose");
const fileUploader = require('../config/cloudinary.config');
const Shelter = require("../models/Shelter.model");
const Person = require("../models/Person.model");
const Pet = require("../models/Pet.model");
const User = require("../models/User.model");
const Message = require("../models/Message.model");

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

  await pet.populate({ 
    path: "messages",
    populate: { path: "from"}
  });

  const userMessages = pet.messages.reduce((newArray, message) => {
    if ((!newArray.some(messageUser => messageUser.username === message.from.username)) &&
        (message.from.username !== req.session.user.username)) {
      newArray.push({petId: pet._id, username: message.from.username});
    }
    return newArray;
  }, []);

  options.messages = userMessages;

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

router.get("/view-messages/:idPet/:username", async (req, res) => {
  const petId = mongoose.Types.ObjectId(req.params.idPet);

  const pet = await Pet.findById(petId);
  await pet.populate({ 
      path: "messages",
      populate: { path: "from"}
  });

  const user = await User.findOne({username: req.params.username});
  const filteredMessages = pet.messages.filter((message) => {
      if ((message.from.equals(user._id)) || (message.to.equals(user._id))) return true
      return false;
  });

  res.render("view-messages", {pet, messages: filteredMessages});
});

router.post("/message-send/:idPet/:idUserPerson", async (req, res) => {
  const { messageText } = req.body;
  const petId = mongoose.Types.ObjectId(req.params.idPet);
  const userPersonId = mongoose.Types.ObjectId(req.params.idUserPerson);
  const userShelterId = req.session.user._id;

  const message = await Message.create({message: messageText, from: userShelterId, to: userPersonId});
  const pet = await Pet.findById(petId);

  pet.messages.push(message._id);
  await pet.save();

  res.redirect("/pet/edit/" + petId);
});

module.exports = router;