import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not Authorized: No token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.userId = decoded.id; // Correto para todas as rotas, inclusive GET
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: 'Token verification failed' });
  }
};

export default authUser;
