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

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        cartItems: user.cartItems || {},
      },
      token, // Also send token for localStorage storage
    });
  } catch (error) {
    console.log(error.message);
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

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true apenas em produção
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' para produção
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      domain:
        process.env.NODE_ENV === 'production' ? '.elitesurfing.pt' : undefined, // permite subdomínios
    });

    return res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        cartItems: user.cartItems || {},
      },
      token, // Also send token for localStorage storage
    });
  } catch (error) {
    console.log(error.message);
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

    return res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        cartItems: user.cartItems || {},
      },
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Logout User : /api/user/logout
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain:
        process.env.NODE_ENV === 'production' ? '.elitesurfing.pt' : undefined,
    });
    return res.json({ success: true, message: 'Logged Out' });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
