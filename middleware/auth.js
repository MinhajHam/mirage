function blockUserMiddleware(req, res, next) {
    if (req.user && req.user.role === 'Blocked') {
      return res.status(403).send('Access is restricted. You are blocked.');
    }
    next();
  };
  
  function checkAuthenticated(req, res, next) {

    if(!req.isAuthenticated()) {
      req.session.authCart = 'closed';
    }

    // Check if the user is authenticated and not blocked
    if (req.isAuthenticated() && req.user.status !== 'Blocked') {
      req.session.authCart = 'open';
      return next(); // User is authenticated and not blocked, proceed to the next middleware
    }
  
    // Check if the user is authenticated but blocked
    if (req.isAuthenticated() && req.user.status === 'Blocked') {
      return res.redirect('/blocked'); // Redirect blocked users to a blocked page
    }
  
    // If the user is not authenticated, set the authCart status and redirect to the login page
    res.redirect('/login');
  }


  module.exports = {
    checkAuthenticated,
    blockUserMiddleware,
  };
