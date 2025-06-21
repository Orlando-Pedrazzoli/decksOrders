import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Enhanced cookie options for cross-domain and Safari compatibility
const getCookieOptions = req => ({
  httpOnly: true,
  secure: true, // Must be true for Vercel
  sameSite: 'none', // Required for cross-site
  domain: '.elitesurfing.vercel.app', // Leading dot for subdomains
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  partitioned: true, // Critical for Safari ITP
});

// Register User : /api/user/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing Details' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Set cookie with enhanced options
    res.cookie('token', token, getCookieOptions(req));

    // Mobile Safari workaround - also return token in response
    const isIOS = /iPhone|iPad|iPod/i.test(req.headers['user-agent']);
    const responseData = {
      success: true,
      user: { email: user.email, name: user.name },
      ...(isIOS && { token }), // Only include token for iOS
    };

    return res.status(201).json(responseData);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Registration failed',
    });
  }
};

// Login User : /api/user/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials', // Generic for security
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Set secure cookie
    res.cookie('token', token, getCookieOptions(req));

    // Prepare response with conditional mobile token
    const isIOS = /iPhone|iPad|iPod/i.test(req.headers['user-agent']);
    const responseData = {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      ...(isIOS && { token }), // Include token for iOS
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// Check Auth : /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Refresh token for mobile clients
    const isIOS = /iPhone|iPad|iPod/i.test(req.headers['user-agent']);
    if (isIOS) {
      const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });
      res.cookie('token', newToken, getCookieOptions(req));
      return res.status(200).json({
        success: true,
        user,
        token: newToken,
      });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication check failed',
    });
  }
};

// Logout User : /api/user/logout
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', getCookieOptions(req));

    // Additional mobile cleanup
    const isIOS = /iPhone|iPad|iPod/i.test(req.headers['user-agent']);
    const response = {
      success: true,
      message: 'Logged out successfully',
      ...(isIOS && { clearToken: true }), // Signal client to clear storage
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};
