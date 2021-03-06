const router = require("express").Router();
const mongoose = require("mongoose");
const axios = require("axios");
const Pet = require("../models/Pet.model");
const Person = require("../models/Person.model");
const Shelter = require("../models/Shelter.model");
const Message = require("../models/Message.model");
const isLoggedIn = require("../middlewares/isLoggedIn");
const isPerson = require("../middlewares/isPerson");

router.use(isLoggedIn);

router.get("/search", isPerson, (req, res) => {
    res.render("search", {person: "person"});
});

router.post("/search", isPerson, async (req, res) => {
    try {
        const { dog, cat } = req.body;
        let speciesFilter = {};
    
        if ((dog) && (!cat)) {
            speciesFilter = {species: "dog"};
        } else if ((!dog) && (cat)) {
            speciesFilter = {species: "cat"};
        } else {
            speciesFilter = { $or: [{species: "dog"}, {species: "cat"}]};
        }
        const pets = await Pet.find(speciesFilter);
    
        res.render("search-results", {pets, person: "person"});
    } catch (error) {
        console.error(error);
        res.render("error");
    }
});

router.get("/pet-list", isPerson, async (req, res) => {
    try {
        const person = await Person.findOne({user: req.session.user._id});
        await person.populate("petList");

        const pets = person.petList;

        res.render("pet-list", {pets, person: "person"});   
    } catch (error) {
        console.error(error);
        res.render("error");
    }
});

router.get("/pet/details/:id", isPerson, async (req, res) => {
    try {
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
    
        const petShelter = await Shelter.findOne({pets: petId});
        await petShelter.populate("user");
    
        res.render("pet-details", {pet, petShelter, api_key, googleApiAddress: petShelter.user.address,
                                   messages: filteredMessages, person: "person"});
    } catch (error) {
        console.error(error);
        res.render("error");
    }
});

router.get("/pet-list/add/:id", isPerson, async (req, res) => {
    try {
        const petId = mongoose.Types.ObjectId(req.params.id);

        const person = await Person.findOne({user: req.session.user._id});
    
        if (!person.petList.includes(petId)) {
            person.petList.push(petId);
            await person.save();
        }
    
        res.redirect("/search");
    } catch (error) {
        console.error(error);
        res.render("error");
    }
});

router.get("/pet-list/remove/:id", isPerson, async (req, res) => {
    try {
        const petId = mongoose.Types.ObjectId(req.params.id);

        const person = await Person.findOneAndUpdate({user: req.session.user._id}, {$pull: {petList: {$in: [petId]}}});
    
        res.redirect("/pet-list");
    } catch (error) {
        console.error(error);
        res.render("error");
    }
});

router.post("/message-send/:id", isPerson, async (req, res) => {
    try {
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
    } catch (error) {
        console.error(error);
        res.render("error");
    }
});

router.get("/breed-info/:id", async (req, res) => {
    try {
        const petId = mongoose.Types.ObjectId(req.params.id);

        const pet = await Pet.findById(petId);
    
        const responseInfo = await petApiInfoRequest(pet.species, pet.breed);
        let responseImage = {data: {url: ""}};
        if (responseInfo.data[0]) {
            if (responseInfo.data[0].reference_image_id) {
                responseImage = await petApiImageRequest(pet.species, responseInfo.data[0].reference_image_id);
            }
            if (req.session.role === "person") {
                res.render("breed-info", {breed: responseInfo.data[0], image: responseImage.data.url, person: "person"});
            } else {
                res.render("breed-info", {breed: responseInfo.data[0], image: responseImage.data.url, shelter: "shelter"});
            }
        } else {
            if (req.session.role === "person") {
                res.render("breed-info", {image: "/images/catdog.jpg", notFound: "not found", person: "person"});
            } else {
                res.render("breed-info", {image: "/images/catdog.jpg", notFound: "not found", shelter: "shelter"});
            }
        }
    } catch (error) {
        console.error(error);
        res.render("error");
    }
});

function petApiInfoRequest(species, breed) {
    let apiKey;
    let apiUrl;
    switch (species) {
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

function petApiImageRequest(species, image_id) {
    let apiKey;
    let apiUrl;
    switch (species) {
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