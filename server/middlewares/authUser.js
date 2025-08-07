import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  try {
    // ✅ CORREÇÃO: Verificar múltiplas fontes de token
    let token = null;

    // 1. Primeiro, tentar pegar token dos cookies (prioridade)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('✅ Token encontrado nos cookies');
    }

    // 2. Se não encontrou nos cookies, tentar no header Authorization
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
      console.log('✅ Token encontrado no header Authorization');
    }

    // 3. Última tentativa: header x-auth-token (caso use outro padrão)
    else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
      console.log('✅ Token encontrado no header x-auth-token');
    }

    // Se nenhum token foi encontrado
    if (!token) {
      console.log('❌ Nenhum token encontrado');
      console.log('🔍 Cookies disponíveis:', Object.keys(req.cookies || {}));
      console.log('🔍 Headers de auth:', {
        authorization: req.headers.authorization ? 'presente' : 'ausente',
        'x-auth-token': req.headers['x-auth-token'] ? 'presente' : 'ausente',
      });

      return res.status(401).json({
        success: false,
        message: 'Token não encontrado. Por favor, faça login.',
      });
    }

    // ✅ Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      console.log('❌ Token inválido - sem ID de usuário');
      return res.status(401).json({
        success: false,
        message: 'Token inválido. Por favor, faça login novamente.',
      });
    }

    // ✅ CORREÇÃO CRÍTICA: NÃO SOBRESCREVER req.body
    // Adicionar user ao req ao invés de modificar body
    req.user = {
      id: decoded.id,
      // outros campos do token se necessário
    };

    // ✅ OPCIONAL: Se o userId não vier no body, usar o do token
    if (!req.body.userId) {
      req.body.userId = decoded.id;
    }

    console.log('✅ Usuário autenticado com sucesso:', decoded.id);
    console.log('🔍 Body preservado:', Object.keys(req.body));

    next();
  } catch (error) {
    console.error('❌ Erro de autenticação:', error.message);

    // ✅ TRATAMENTO ESPECÍFICO DE ERROS JWT
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Por favor, faça login novamente.',
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido. Por favor, faça login novamente.',
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Erro interno de autenticação.',
      });
    }
  }
};

export default authUser;
