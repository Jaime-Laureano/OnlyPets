module.exports = (req, res, next) => {

    if (!req.session.role === 'shelter') {
      return res.redirect("/search");
    }
    
    next();
  };