import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register User : /api/user/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: 'Missing Details' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      // domain: process.env.NODE_ENV === 'production' ? '.elitesurfing.pt' : undefined,
    };

    // 🔍 LOGS DE DEBUG - REGISTER
    console.log('=== REGISTER DEBUG ===');
    console.log('Request origin:', req.headers.origin);
    console.log('User-Agent:', req.headers['user-agent']);
    console.log('Cookie options:', cookieOptions);
    console.log('Token being set:', token.substring(0, 20) + '...');
    console.log('=======================');

    res.cookie('token', token, cookieOptions);

    return res.json({
      success: true,
      user: { email: user.email, name: user.name, id: user._id },
    });
  } catch (error) {
    console.log('Register error:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// Login User : /api/user/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.json({
        success: false,
        message: 'Email and password are required',
      });

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.json({ success: false, message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      // domain: process.env.NODE_ENV === 'production' ? '.elitesurfing.pt' : undefined,
    };

    // 🔍 LOGS DE DEBUG - LOGIN
    console.log('=== LOGIN DEBUG ===');
    console.log('Request origin:', req.headers.origin);
    console.log('User-Agent:', req.headers['user-agent']);
    console.log('Cookie options:', cookieOptions);
    console.log('Token being set:', token.substring(0, 20) + '...');
    console.log('Existing cookies:', req.cookies);
    console.log('====================');

    res.cookie('token', token, cookieOptions);

    return res.json({
      success: true,
      user: { email: user.email, name: user.name, id: user._id },
    });
  } catch (error) {
    console.log('Login error:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// Check Auth : /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Logout User : /api/user/logout
export const logout = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      // domain: process.env.NODE_ENV === 'production' ? '.elitesurfing.pt' : undefined,
    };

    // 🔍 LOGS DE DEBUG - LOGOUT
    console.log('=== LOGOUT DEBUG ===');
    console.log('Request origin:', req.headers.origin);
    console.log('Cookies before logout:', req.cookies);
    console.log('Cookie clear options:', cookieOptions);
    console.log('=====================');

    res.clearCookie('token', {
      ...cookieOptions,
      expires: new Date(0), // força a remoção
    });

    return res.json({ success: true, message: 'Logged Out' });
  } catch (error) {
    console.log('Logout error:', error.message);
    res.json({ success: false, message: error.message });
  }
};
