import Address from '../models/Address.js';

// Add Address : /api/address/add
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

// Get Address : /api/address/get
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
