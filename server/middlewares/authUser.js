import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  // 1. Get token from multiple possible sources
  let token =
    req.cookies.token || // First try: Standard cookies
    req.headers.authorization?.split(' ')[1] || // Second try: Authorization header
    req.headers['x-mobile-token']; // Third try: Mobile Safari workaround

  // 2. Special debug for Safari
  const isIOS = /iPhone|iPad|iPod/i.test(req.headers['user-agent']);
  if (isIOS && !token) {
    console.warn(
      'Safari detected with no token - checking localStorage fallback'
    );
  }

  // 3. Token verification
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      errorCode: 'NO_TOKEN',
    });
  }

  try {
    // 4. Verify token with enhanced error handling
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // Specify allowed algorithm
      ignoreExpiration: false, // Explicitly check expiration
    });

    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload',
        errorCode: 'INVALID_PAYLOAD',
      });
    }

    // 5. Attach user context
    req.userId = decoded.id;
    req.isMobile = isIOS; // For downstream handlers

    // 6. Special handling for Safari
    if (isIOS) {
      // Refresh token expiry for active sessions
      const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      // Set updated cookie
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain: '.elitesurfing.vercel.app',
        partitioned: true,
        maxAge: 3600000,
      });

      // Also available for client-side
      req.refreshedToken = newToken;
    }

    return next();
  } catch (error) {
    // 7. Detailed error responses
    let message = 'Authentication failed';
    let errorCode = 'AUTH_ERROR';

    if (error.name === 'TokenExpiredError') {
      message = 'Session expired';
      errorCode = 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token format';
      errorCode = 'INVALID_TOKEN';
    }

    console.error(`Auth Error (${errorCode}):`, error.message);

    return res.status(401).json({
      success: false,
      message,
      errorCode,
      requiresReauth: true, // Frontend can use this
    });
  }
};

export default authUser;
