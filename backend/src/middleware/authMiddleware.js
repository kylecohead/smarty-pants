// Session-based authentication middleware
export default function authMiddleware(req, res, next) {
  // Debug logging
  console.log("🔐 Auth middleware - Session ID:", req.sessionID);
  console.log("🔐 Auth middleware - Session data:", req.session);
  console.log("🔐 Auth middleware - User:", req.session?.user);
  
  // Check if user is logged in via session
  if (!req.session || !req.session.user) {
    console.log("❌ Auth failed - No session or user");
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Add user info to request object for downstream routes
  req.user = {
    id: req.session.user.id,
    role: req.session.user.role,
    username: req.session.user.username,
    email: req.session.user.email
  };
  
  console.log("✅ Auth successful for user:", req.user.username);
  next();
}
