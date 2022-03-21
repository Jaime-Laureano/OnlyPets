const router = require("express").Router();
const Shelter = require("../models/Shelter.model");
const Pet = require("../models/Pet.model");

router.get("/shelter-pets", async (req, res) => {
  const shelter = await Shelter.findOne({user: req.session.user._id});
  shelter.populate("pets");
  const pets = shelter.pets;
  res.render("shelter-pets", {pets});
});

router.get("/pet-add", (req, res) => {
  res.render("pet-add");
});

router.post('/pet-add', async (req, res) => {
  const {  } = req.body

  await Pet.create({ });
});

router.get("/pet-edit", (req, res) => {
  res.render("pet-edit");
});

router.post("/pet-edit", (req, res) => {
  res.render("pet-edit");
});

module.exports = router;