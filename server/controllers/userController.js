import User from '../models/User.js';
import Order from '../models/Order.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ✅ MOBILE-FRIENDLY: Configuração de cookie SEM domain
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
});

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

    res.cookie('token', token, getCookieOptions());

    return res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        cartItems: user.cartItems || {},
      },
      token,
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

    res.cookie('token', token, getCookieOptions());

    return res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        cartItems: user.cartItems || {},
      },
      token,
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
    res.clearCookie('token', getCookieOptions());
    return res.json({ success: true, message: 'Logged Out' });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// =============================================================================
// 🆕 CONVERT GUEST TO USER - Criar conta após compra como guest
// =============================================================================
export const convertGuestToUser = async (req, res) => {
  try {
    const { email, password, name, orderId } = req.body;

    // Validações
    if (!email || !password) {
      return res.json({ 
        success: false, 
        message: 'Email e password são obrigatórios' 
      });
    }

    if (password.length < 6) {
      return res.json({ 
        success: false, 
        message: 'Password deve ter pelo menos 6 caracteres' 
      });
    }

    // Verificar se já existe user com este email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ 
        success: false, 
        message: 'Já existe uma conta com este email. Por favor, faça login.',
        existingAccount: true
      });
    }

    // Buscar nome do pedido se não foi fornecido
    let userName = name;
    if (!userName && orderId) {
      const order = await Order.findById(orderId);
      if (order && order.guestName) {
        userName = order.guestName;
      }
    }

    // Se ainda não tem nome, usar parte do email
    if (!userName) {
      userName = email.split('@')[0];
    }

    // Criar user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: userName,
      email: email,
      password: hashedPassword,
      cartItems: {},
    });

    console.log('✅ Nova conta criada a partir de guest:', newUser._id);

    // 🆕 Associar TODOS os pedidos de guest com este email ao novo userId
    const updateResult = await Order.updateMany(
      { 
        guestEmail: email, 
        isGuestOrder: true 
      },
      { 
        $set: { 
          userId: newUser._id.toString(),
          isGuestOrder: false 
        }
      }
    );

    console.log(`✅ ${updateResult.modifiedCount} pedido(s) associado(s) à nova conta`);

    // Gerar token de autenticação
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, getCookieOptions());

    return res.json({
      success: true,
      message: 'Conta criada com sucesso!',
      user: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        cartItems: newUser.cartItems || {},
      },
      token,
      ordersLinked: updateResult.modifiedCount,
    });

  } catch (error) {
    console.error('❌ Erro ao converter guest para user:', error);
    res.json({ success: false, message: error.message });
  }
};

// =============================================================================
// 🆕 CHECK IF EMAIL EXISTS (para validação no frontend)
// =============================================================================
export const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: 'Email é obrigatório' });
    }

    const existingUser = await User.findOne({ email });

    return res.json({
      success: true,
      exists: !!existingUser,
    });

  } catch (error) {
    console.error('❌ Erro ao verificar email:', error);
    res.json({ success: false, message: error.message });
  }
};