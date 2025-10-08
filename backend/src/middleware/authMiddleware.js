// Session-based authentication middleware
export default function authMiddleware(req, res, next) {
  // Check if user is logged in via session
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Add user info to request object for downstream routes
  req.user = {
    id: req.session.user.id,
    role: req.session.user.role,
    username: req.session.user.username,
    email: req.session.user.email
  };
  
  next();
}
