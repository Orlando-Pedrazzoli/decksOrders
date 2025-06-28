// middlewares/authUser.js (UPDATED)
import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  let token;

  // 1. Check for token in cookies (for desktop/browser-managed cookies)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2. Fallback: Check for token in Authorization header (for mobile/iOS interceptor)
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log('✅ Token found in Authorization header (mobile)');
  }

  console.log('=== AUTH USER MIDDLEWARE DEBUG ===');
  console.log('All cookies:', req.cookies);
  console.log(
    'Token (resolved):',
    token ? token.substring(0, 20) + '...' : 'NO TOKEN'
  );
  console.log('Request origin:', req.headers.origin);
  console.log('Request host:', req.headers.host);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('=====================================');

  if (!token) {
    console.log('❌ No token found (neither cookies nor Authorization header)');
    return res
      .status(401)
      .json({ success: false, message: 'Not Authorized - No Token' });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully:', {
      id: tokenDecode.id,
      exp: new Date(tokenDecode.exp * 1000),
    });

    if (tokenDecode.id) {
      req.body.userId = tokenDecode.id; // Continue to set userId in req.body for compatibility with isAuth
      console.log('✅ User ID added to request:', tokenDecode.id);
      next();
    } else {
      console.log('❌ No user ID in token');
      return res
        .status(401)
        .json({ success: false, message: 'Not Authorized - Invalid Token' });
    }
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);

    // Clear the cookie/token on client side if verification fails
    // Note: server-side clearing of cookie is less effective for `Bearer` token in header.
    // Client-side `AppContext` interceptor will handle clearing localStorage for mobile.

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token Expired' });
    }

    return res
      .status(401)
      .json({ success: false, message: 'Not Authorized - Invalid Token' });
  }
};

export default authUser;
