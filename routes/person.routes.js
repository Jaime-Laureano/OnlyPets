const router = require("express").Router();
const mongoose = require("mongoose");
const Pet = require("../models/Pet.model");
const Person = require("../models/Person.model");
const Shelter = require("../models/Shelter.model");

router.get("/search", (req, res) => {
    res.render("search");
});

router.post("/search", async (req, res) => {
    const { dog, cat } = req.body;
    const specieFilter = {};
    if ((dog) && (!cat)) {
        specieFilter = {species: "dog"};
    } else if ((!dog) && (cat)) {
        specieFilter = {species: "cat"};
    } else {
        specieFilter = { $or: [{species: "dog"}, {species: "cat"}]};
    }
    const pets = await Pet.find(specieFilter);

    res.render("search-results", {pets});
});

router.get("/pet-list", async (req, res) => {
    const person = await Person.findOne({user: req.session.user._id});
    const pets = person.petList;
    res.render("pet-list", {pets});
});

router.get("/pet/details/:id", async (req, res) => {
    const petId = mongoose.Types.ObjectId(req.params.id);
    const pet = await Pet.findById(petId);
    const shelter = await Shelter.findOne({pets: petId});
    res.render("pet-details", {pet, shelter});
});

router.get("/pet-list/add/:id", async (req, res) => {
    const petId = mongoose.Types.ObjectId(req.params.id);
    const person = await Person.findOneAndUpdate({user: req.session.user._id}, {$push: {petList: petId}});
    res.redirect("/search");
});

router.get("/pet-list/remove/:id", async (req, res) => {
    const petId = mongoose.Types.ObjectId(req.params.id);
    const person = await Person.findOneAndUpdate({user: req.session.user._id}, {$pull: {petList: {$in: [petId]}}});
    res.redirect("/pet-list");
});

module.exports = router;