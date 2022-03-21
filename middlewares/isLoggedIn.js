
const isLoggedIn = (req, res, next) => {
    if (!req.session.User) {
      return res.redirect('/login');
    }
    next();
  };
  

  const isLoggedOut = (req, res, next) => {
    if (req.session.User) {
      return res.redirect('/');
    }
    next();
  };
  
  module.exports = {
    isLoggedIn,
    isLoggedOut
  };
  