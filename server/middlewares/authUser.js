import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  let token = null;

  // First, try to get token from cookie (HTTP-only, more secure)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no cookie token, try Authorization header (for localStorage token)
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }

  if (!token) {
    return res.json({ success: false, message: 'Not Authorized' });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      req.body.userId = tokenDecode.id;
      next();
    } else {
      return res.json({ success: false, message: 'Not Authorized' });
    }
  } catch (error) {
    console.log('Token verification error:', error.message);
    return res.json({ success: false, message: 'Not Authorized' });
  }
};

export default authUser;
