const router = require("express").Router();

const petModel = require("../models/Pet.model");

router.get("/shelter-profile", (req, res) => {
    res.render("shelter-profile");
  });

  router.get("/shelter-edit", (req, res) => {
    res.render("shelter-edit");
  });

router.get("/shelter-add", (req, res) => {
    res.render("shelter-add");
  });

  router.post('/shelter-add', (req, res, next) => {
    const {  } = req.body
    
    Pet.create({ })
    .then( () => res.redirect(''))
    .catch( (err) => res.render('shelter-add'));
  })
  

module.exports = router;