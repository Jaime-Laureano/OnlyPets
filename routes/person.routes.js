const router = require("express").Router();
const mongoose = require("mongoose");
const axios = require("axios");
const Pet = require("../models/Pet.model");
const Person = require("../models/Person.model");
const Shelter = require("../models/Shelter.model");
const Message = require("../models/Message.model");

router.get("/search", (req, res) => {
    res.render("search");
});

router.post("/search", async (req, res) => {
    const { dog, cat } = req.body;
    let specieFilter = {};

    if ((dog) && (!cat)) {
        specieFilter = {specie: "dog"};
    } else if ((!dog) && (cat)) {
        specieFilter = {specie: "cat"};
    } else {
        specieFilter = { $or: [{specie: "dog"}, {specie: "cat"}]};
    }
    const pets = await Pet.find(specieFilter);

    res.render("search-results", {pets});
});

router.get("/pet-list", async (req, res) => {
    const person = await Person.findOne({user: req.session.user._id});
    person.populate("petList");

    const pets = person.petList;

    res.render("pet-list", {pets});
});

router.get("/pet/details/:id", async (req, res) => {
    const api_key = process.env.API_KEY;
    const petId = mongoose.Types.ObjectId(req.params.id);

    const pet = await Pet.findById(petId);
    await pet.populate({ 
        path: "messages",
        populate: { path: "from"}
    });

    const userId = mongoose.Types.ObjectId(req.session.user._id);
    const filteredMessages = pet.messages.filter((message) => {
        if ((message.from.equals(userId)) || (message.to.equals(userId))) return true
        return false;
    });

    const shelter = await Shelter.findOne({pets: petId});
    await shelter.populate("user");

    res.render("pet-details", {pet, shelter, api_key, googleApiAddress: shelter.user.address,
                               messages: filteredMessages});
});

router.get("/pet-list/add/:id", async (req, res) => {
    const petId = mongoose.Types.ObjectId(req.params.id);

    const person = await Person.findOne({user: req.session.user._id});

    if (!person.petList.includes(petId)) {
        person.petList.push(petId);
        await person.save();
    }

    res.redirect("/search");
});

router.get("/pet-list/remove/:id", async (req, res) => {
    const petId = mongoose.Types.ObjectId(req.params.id);

    const person = await Person.findOneAndUpdate({user: req.session.user._id}, {$pull: {petList: {$in: [petId]}}});

    res.redirect("/pet-list");
});

router.post("/message-send/:id", async (req, res) => {
    const { messageText } = req.body;
    const petId = mongoose.Types.ObjectId(req.params.id);
    const userPersonId = req.session.user._id;

    const shelter = await Shelter.findOne({pets: petId});
    const userShelterId = shelter.user;

    const message = await Message.create({message: messageText, from: userPersonId, to: userShelterId});
    const pet = await Pet.findById(petId);

    pet.messages.push(message._id);
    await pet.save();

    res.redirect("/pet/details/" + petId);
});

router.get("/breed-info/:id", async (req, res) => {
    const petId = mongoose.Types.ObjectId(req.params.id);

    const pet = await Pet.findById(petId);

    const responseInfo = await petApiInfoRequest(pet.specie, pet.breed);
    const responseImage = await petApiImageRequest(pet.specie, responseInfo.data[0].reference_image_id);

    res.render("breed-info", {breed: responseInfo.data[0], image: responseImage.data.url});
});

function petApiInfoRequest(specie, breed) {
    let apiKey;
    let apiUrl;
    switch (specie) {
        case "cat":
            apiKey = process.env.CATAPI_KEY;
            apiUrl = 'https://api.thecatapi.com/v1/breeds/search';
            break;
        case "dog":
            apiKey = process.env.DOGAPI_KEY;
            apiUrl = 'https://api.thedogapi.com/v1/breeds/search';
    }
    axios.defaults.headers.common['x-api-key'] = apiKey;
    return axios.get(apiUrl, { params: { q: breed} });
}

function petApiImageRequest(specie, image_id) {
    let apiKey;
    let apiUrl;
    switch (specie) {
        case "cat":
            apiKey = process.env.CATAPI_KEY;
            apiUrl = 'https://api.thecatapi.com/v1/images/' + image_id;
            break;
        case "dog":
            apiKey = process.env.DOGAPI_KEY;
            apiUrl = 'https://api.thedogapi.com/v1/images/' + image_id;
    }
    axios.defaults.headers.common['x-api-key'] = apiKey;
    return axios.get(apiUrl);
}

module.exports = router;