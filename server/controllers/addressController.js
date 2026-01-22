import Address from '../models/Address.js';

// =============================================================================
// Add Address : /api/address/add (ORIGINAL - MANTIDO)
// =============================================================================
export const addAddress = async (req, res) => {
  try {
    const { address, userId } = req.body;

    if (!address || !userId) {
      return res
        .status(400)
        .json({ success: false, message: 'Dados incompletos' });
    }

    // Garante que zipcode é string
    const newAddress = {
      ...address,
      userId,
      zipcode: String(address.zipcode).trim(),
      isGuestAddress: false,
    };

    await Address.create(newAddress);

    res.status(200).json({
      success: true,
      message: 'Endereço adicionado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao adicionar endereço:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar endereço: ' + error.message,
    });
  }
};

// =============================================================================
// Get Address : /api/address/get (ORIGINAL - MANTIDO)
// =============================================================================
export const getAddress = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: 'ID de usuário ausente' });
    }

    const addresses = await Address.find({ userId });

    res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================================================================
// 🆕 Add Guest Address : /api/address/guest (SEM AUTENTICAÇÃO)
// =============================================================================
export const addGuestAddress = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dados da morada necessários' 
      });
    }

    // Validações básicas
    if (!address.email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email é obrigatório' 
      });
    }

    if (!address.firstName || !address.lastName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome completo é obrigatório' 
      });
    }

    if (!address.street || !address.city || !address.zipcode || !address.phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Morada completa é obrigatória' 
      });
    }

    // Criar morada de guest (sem userId)
    const newAddress = await Address.create({
      userId: null,
      isGuestAddress: true,
      firstName: address.firstName,
      lastName: address.lastName,
      email: address.email,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state || '',
      zipcode: String(address.zipcode).trim(),
      country: address.country || 'Portugal',
    });

    console.log('✅ Morada de guest criada:', newAddress._id);

    res.status(200).json({ 
      success: true, 
      addressId: newAddress._id,
      message: 'Morada criada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar morada de guest:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar morada: ' + error.message 
    });
  }
};