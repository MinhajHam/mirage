function checkAdminAuthenticated(req, res, next) {
  // Check if the user is authenticated and has an 'admin' role
  if (req.isAuthenticated() && req.user.role === 'admin' && req.user.status !== 'Blocked') {
    return next(); // Admin is authenticated and not blocked, proceed to the next middleware
  }

  // Check if the user is authenticated but not an admin or is blocked
  if (req.isAuthenticated() && (req.user.role !== 'admin' || req.user.status === 'Blocked')) {
    return res.redirect('/admin/login'); // Redirect non-admin users or blocked admins to the admin login page
  }

  // If the user is not authenticated, redirect to the admin login page
  res.redirect('/admin/login');
}
  
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
    checkAdminAuthenticated,
  };
