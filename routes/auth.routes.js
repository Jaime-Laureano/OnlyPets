const router = require("express").Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");
const Person = require("../models/Person.model");
const Shelter = require("../models/Shelter.model");

router.get("/login", (req, res) => {
  res.render("login", {logout: "logout"});
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({username: username});
  
    if (!user) {
      res.render("login", {error: "User not found!", logout: "logout"});
      return;
    }
  
    const checkPassword = await bcrypt.compare(password, user.password);
  
    if (!checkPassword) {
      res.render("login", {error: "Wrong Password!", logout: "logout"});
      return;
    }
  
    req.session.user = user;
    if (user.isShelter) {
      req.session.role = "shelter";
      res.redirect("/shelter-pets");
    } else {
      req.session.role = "person";
      res.redirect("/search");
    }
  } catch (error) {
    console.error(error);
    res.render("error");
  }
});

router.get("/signup", (req, res) => {
  res.render("signup", {logout: "logout"});
});

router.post("/signup", async (req, res) => {
  const { fullName, username, password, address, isShelter } = req.body;
  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  try {
    if (await (await User.find({username: username})).length > 0) {
      res.render("signup", {error: "Username already exists!", logout: "logout"});
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
    res.render("signup", {error: "Mandatory fields not filled!", logout: "logout"});
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