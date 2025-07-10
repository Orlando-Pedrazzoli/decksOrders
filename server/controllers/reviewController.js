import Review from '../models/Review.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// Criar review - POST /api/reviews/create
export const createReview = async (req, res) => {
  try {
    const { orderId, productId, rating, title, comment } = req.body;
    const { userId } = req.body; // Vem do middleware de auth

    console.log('📧 Dados recebidos para criar review:', {
      userId,
      orderId,
      productId,
      rating,
      title,
      comment,
    });

    // Validações
    if (!orderId || !productId || !rating || !title || !comment) {
      return res.json({
        success: false,
        message: 'Todos os campos são obrigatórios',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.json({
        success: false,
        message: 'Rating deve ser entre 1 e 5',
      });
    }

    // Verificar se o pedido existe e pertence ao usuário
    const order = await Order.findOne({
      _id: orderId,
      userId: userId,
      $or: [{ paymentType: 'COD' }, { isPaid: true }],
    });

    if (!order) {
      console.log(
        '❌ Pedido não encontrado para userId:',
        userId,
        'orderId:',
        orderId
      );
      return res.json({
        success: false,
        message: 'Pedido não encontrado ou não autorizado',
      });
    }

    // Verificar se o produto estava no pedido
    const productInOrder = order.items.find(
      item => item.product.toString() === productId
    );
    if (!productInOrder) {
      return res.json({
        success: false,
        message: 'Produto não encontrado neste pedido',
      });
    }

    // Verificar se já existe review para este produto neste pedido
    const existingReview = await Review.findOne({ userId, orderId, productId });
    if (existingReview) {
      return res.json({
        success: false,
        message: 'Já existe um review para este produto',
      });
    }

    // Buscar dados do usuário
    const user = await User.findById(userId).select('name');
    if (!user) {
      return res.json({ success: false, message: 'Usuário não encontrado' });
    }

    // Criar review
    const newReview = await Review.create({
      userId,
      orderId,
      productId,
      rating: parseInt(rating),
      title: title.trim(),
      comment: comment.trim(),
      userName: user.name,
      userLocation: 'Portugal', // Pode ser dinâmico no futuro
      isVerifiedPurchase: true,
      isApproved: true,
    });

    console.log('✅ Review criado:', newReview._id);

    res.json({
      success: true,
      message: 'Review criado com sucesso!',
      reviewId: newReview._id,
    });
  } catch (error) {
    console.error('❌ Erro ao criar review:', error);
    res.json({ success: false, message: error.message });
  }
};

// Buscar reviews de um produto - GET /api/reviews/product/:productId
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({
      productId,
      isApproved: true,
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalReviews = await Review.countDocuments({
      productId,
      isApproved: true,
    });

    // Calcular estatísticas
    const stats = await Review.aggregate([
      { $match: { productId, isApproved: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating',
          },
        },
      },
    ]);

    const ratingStats = stats[0] || { averageRating: 0, totalReviews: 0 };

    // Distribuição por estrelas
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (ratingStats.ratingDistribution) {
      ratingStats.ratingDistribution.forEach(rating => {
        distribution[rating]++;
      });
    }

    res.json({
      success: true,
      reviews,
      stats: {
        averageRating: Math.round(ratingStats.averageRating * 10) / 10,
        totalReviews: ratingStats.totalReviews,
        distribution,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / limit),
        hasMore: page * limit < totalReviews,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao buscar reviews:', error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ CORREÇÃO PRINCIPAL: Buscar pedidos do usuário elegíveis para review
export const getEligibleOrders = async (req, res) => {
  try {
    const { userId } = req.body; // Vem do middleware authUser

    console.log('📧 Buscando pedidos elegíveis para userId:', userId);

    if (!userId) {
      return res.json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    // ✅ CORREÇÃO: Buscar pedidos do usuário (pagos ou COD) com populate correto
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: 'COD' }, { isPaid: true }],
    })
      .populate({
        path: 'items.product',
        select: 'name image category',
      })
      .sort({ createdAt: -1 });

    console.log('📧 Pedidos encontrados:', orders.length);

    // ✅ VERIFICAÇÃO ADICIONAL: Log da estrutura dos pedidos
    if (orders.length > 0) {
      console.log('📧 Estrutura do primeiro pedido:', {
        id: orders[0]._id,
        items: orders[0].items.map(item => ({
          product: item.product
            ? {
                id: item.product._id,
                name: item.product.name,
                populated: true,
              }
            : {
                id: item.product,
                populated: false,
              },
          quantity: item.quantity,
        })),
      });
    }

    // Buscar reviews já feitos pelo usuário
    const existingReviews = await Review.find({ userId }).select(
      'orderId productId'
    );
    const reviewedItems = new Set(
      existingReviews.map(review => `${review.orderId}-${review.productId}`)
    );

    console.log('📧 Reviews já existentes:', existingReviews.length);

    // ✅ CORREÇÃO: Filtrar produtos elegíveis para review
    const eligibleProducts = [];

    orders.forEach(order => {
      order.items.forEach(item => {
        // ✅ VERIFICAÇÃO MELHORADA: Certificar que o produto existe e foi populado
        if (item.product) {
          // Se o produto foi populado (é um objeto com _id, name, etc.)
          if (typeof item.product === 'object' && item.product._id) {
            const key = `${order._id}-${item.product._id}`;
            if (!reviewedItems.has(key)) {
              eligibleProducts.push({
                orderId: order._id,
                orderDate: order.createdAt,
                product: {
                  _id: item.product._id,
                  name: item.product.name,
                  image: item.product.image,
                  category: item.product.category,
                },
                quantity: item.quantity,
                canReview: true,
              });
            }
          }
          // Se o produto não foi populado (é apenas um ObjectId string)
          else if (typeof item.product === 'string') {
            console.log('⚠️ Produto não populado (ObjectId):', item.product);
            // Podemos tentar buscar o produto manualmente
            // Mas isso indica que o populate não funcionou
          }
        } else {
          console.log('⚠️ Produto ausente no item:', item);
        }
      });
    });

    console.log('📧 Produtos elegíveis para review:', eligibleProducts.length);

    // ✅ DEBUG: Log dos produtos encontrados
    if (eligibleProducts.length > 0) {
      console.log('📧 Primeiro produto elegível:', eligibleProducts[0]);
    }

    res.json({
      success: true,
      eligibleProducts,
      totalEligible: eligibleProducts.length,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos elegíveis:', error);
    res.json({ success: false, message: error.message });
  }
};

// Buscar reviews do usuário - POST /api/reviews/my-reviews
export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.body;

    const reviews = await Review.find({ userId })
      .populate('productId', 'name image category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar reviews do usuário:', error);
    res.json({ success: false, message: error.message });
  }
};

// Buscar reviews recentes para o carousel - GET /api/reviews/recent
export const getRecentReviews = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const reviews = await Review.find({
      isApproved: true,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('productId', 'name category')
      .select(
        'userName userLocation rating title comment createdAt isVerifiedPurchase'
      );

    res.json({
      success: true,
      reviews,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar reviews recentes:', error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ FUNÇÃO DE DEBUG - TEMPORÁRIA (remover em produção)
export const debugOrders = async (req, res) => {
  try {
    const { userId } = req.body;

    console.log('🔍 DEBUG: Analisando pedidos para userId:', userId);

    // 1. Buscar pedidos sem populate
    const ordersRaw = await Order.find({
      userId,
      $or: [{ paymentType: 'COD' }, { isPaid: true }],
    }).limit(3);

    console.log('📦 Pedidos raw:', ordersRaw.length);

    // 2. Buscar com populate
    const ordersPopulated = await Order.find({
      userId,
      $or: [{ paymentType: 'COD' }, { isPaid: true }],
    })
      .populate({
        path: 'items.product',
        select: 'name image category',
      })
      .limit(3);

    console.log('📦 Pedidos populated:', ordersPopulated.length);

    // 3. Verificar se há diferença
    const analysis = {
      totalOrders: ordersRaw.length,
      populateWorking:
        ordersPopulated.length > 0 &&
        ordersPopulated[0].items.length > 0 &&
        typeof ordersPopulated[0].items[0].product === 'object',
      firstOrderRaw: ordersRaw[0]
        ? {
            id: ordersRaw[0]._id,
            itemsCount: ordersRaw[0].items.length,
            firstItem: ordersRaw[0].items[0],
          }
        : null,
      firstOrderPopulated: ordersPopulated[0]
        ? {
            id: ordersPopulated[0]._id,
            itemsCount: ordersPopulated[0].items.length,
            firstItem: ordersPopulated[0].items[0],
          }
        : null,
    };

    res.json({
      success: true,
      debug: analysis,
    });
  } catch (error) {
    console.error('❌ Erro no debug:', error);
    res.json({
      success: false,
      error: error.message,
    });
  }
};
