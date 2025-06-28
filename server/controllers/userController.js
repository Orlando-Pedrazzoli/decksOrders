import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Função para determinar as opções de cookie baseado no environment
const getCookieOptions = req => {
  const isProduction = process.env.NODE_ENV === 'production';
  const origin = req.headers.origin;

  console.log('=== COOKIE CONFIG DEBUG ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Origin:', origin);
  console.log('Is Production:', isProduction);

  // Configuração base
  const baseOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  };

  if (isProduction) {
    // Em produção, configurações mais específicas
    return {
      ...baseOptions,
      secure: true,
      sameSite: 'none',
      domain: '.elitesurfing.pt', // Permite cookies em subdomínios
    };
  } else {
    // Em desenvolvimento
    return {
      ...baseOptions,
      secure: false,
      sameSite: 'lax',
    };
  }
};

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

    const cookieOptions = getCookieOptions(req);

    // 🔍 LOGS DE DEBUG - REGISTER
    console.log('=== REGISTER DEBUG ===');
    console.log('Request origin:', req.headers.origin);
    console.log('Request host:', req.headers.host);
    console.log('User-Agent:', req.headers['user-agent']);
    console.log('Cookie options:', cookieOptions);
    console.log('Token being set:', token.substring(0, 20) + '...');
    console.log('User created:', {
      id: user._id,
      email: user.email,
      name: user.name,
    });
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

    const cookieOptions = getCookieOptions(req);

    // 🔍 LOGS DE DEBUG - LOGIN
    console.log('=== LOGIN DEBUG ===');
    console.log('Request origin:', req.headers.origin);
    console.log('Request host:', req.headers.host);
    console.log('User-Agent:', req.headers['user-agent']);
    console.log('Cookie options:', cookieOptions);
    console.log('Token being set:', token.substring(0, 20) + '...');
    console.log('Existing cookies:', req.cookies);
    console.log('User found:', {
      id: user._id,
      email: user.email,
      name: user.name,
    });
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

    console.log('=== IS-AUTH DEBUG ===');
    console.log('UserId from token:', userId);
    console.log('Cookies received:', req.cookies);
    console.log('Origin:', req.headers.origin);
    console.log('=====================');

    const user = await User.findById(userId).select('-password');

    if (!user) {
      console.log('User not found in database for ID:', userId);
      return res.json({ success: false, message: 'User not found' });
    }

    console.log('User found:', {
      id: user._id,
      email: user.email,
      name: user.name,
    });

    return res.json({ success: true, user });
  } catch (error) {
    console.log('IsAuth error:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// Logout User : /api/user/logout
export const logout = async (req, res) => {
  try {
    const cookieOptions = getCookieOptions(req);

    // 🔍 LOGS DE DEBUG - LOGOUT
    console.log('=== LOGOUT DEBUG ===');
    console.log('Request origin:', req.headers.origin);
    console.log('Cookies before logout:', req.cookies);
    console.log('Cookie clear options:', cookieOptions);
    console.log('=====================');

    // Limpar o cookie com as mesmas opções usadas para definir
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
