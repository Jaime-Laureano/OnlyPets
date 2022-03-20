const router = require("express").Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const Person = require("../models/Person.model");
const Shelter = require("../models/Shelter.model");

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({username: username});

  if (!user) {
    res.render("login", {error: "User not found!"});
    return;
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    res.render("login", {error: "Wrong Password!"});
    return;
  }

  req.session.user = user;
  if (user.isShelter) {
    const shelter = await Shelter.findOne({user: user._id});
    req.session.shelter = shelter;
    res.send("Logged");
  } else {
    const person = await Person.findOne({user: user._id});
    req.session.person = person;
    res.redirect("/search");
  }
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", async (req, res) => {
  const { fullName, username, password, address, isShelter } = req.body;
  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  try {
    if (await (await User.find({username: username})).length > 0) {
      res.render("signup", {error: "Username already exists!"});
      return;
    }

    const user = new User({
      fullName: fullName,
      username: username,
      password: hashPassword,
      address: address,
      isShelter: isShelter ? true : false
    });
    await user.save();

    if (user.isShelter) {
      await Shelter.create({user: user._id});
    } else {
      await Person.create({user: user._id});
    }
  } catch (err) {
    res.render("signup", {error: "Mandatory fields not filled!"});
    return;
  }

  res.redirect("/login");
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return next(err);

    res.redirect("/login");
  });
});

module.exports = router;