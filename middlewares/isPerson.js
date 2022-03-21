module.exports = (req, res, next) => {
  if (req.session.role !== 'person') {
    return res.redirect("/shelter-pets");
  }
  next();
};