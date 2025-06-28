import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  const { token } = req.cookies;

  console.log('=== AUTH USER MIDDLEWARE DEBUG ===');
  console.log('All cookies:', req.cookies);
  console.log(
    'Token from cookies:',
    token ? token.substring(0, 20) + '...' : 'NO TOKEN'
  );
  console.log('Request origin:', req.headers.origin);
  console.log('Request host:', req.headers.host);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('=====================================');

  if (!token) {
    console.log('❌ No token found in cookies');
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
      req.body.userId = tokenDecode.id;
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

    // Se o token expirou, retornar erro específico
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token Expired' });
    }

    return res
      .status(401)
      .json({ success: false, message: 'Not Authorized - Invalid Token' });
  }
};

export default authUser;
