import User from '../models/User.js';

// Update User CartData : /api/cart/update
export const updateCart = async (req, res) => {
  try {
    const { userId, cartItems } = req.body;

    if (!userId) {
      return res.json({ success: false, message: 'User ID is required' });
    }

    if (!cartItems || typeof cartItems !== 'object') {
      return res.json({ success: false, message: 'Invalid cart data' });
    }

    // Find user and update cart
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    // Update cart items
    user.cartItems = cartItems;
    await user.save();

    res.json({
      success: true,
      message: 'Cart Updated',
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.log('Cart update error:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get User Cart : /api/cart/get
export const getCart = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({ success: false, message: 'User ID is required' });
    }

    const user = await User.findById(userId).select('cartItems');

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      cartItems: user.cartItems || {},
    });
  } catch (error) {
    console.log('Get cart error:', error.message);
    res.json({ success: false, message: error.message });
  }
};
