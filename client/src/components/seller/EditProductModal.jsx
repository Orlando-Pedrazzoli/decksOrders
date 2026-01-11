import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { categories } from '../../assets/assets';
import toast from 'react-hot-toast';

// 🎯 CORES PRÉ-DEFINIDAS
const PRESET_COLORS = [
  { name: 'Preto', code: '#000000' },
  { name: 'Branco', code: '#FFFFFF' },
  { name: 'Cinza', code: '#808080' },
  { name: 'Vermelho', code: '#DC2626' },
  { name: 'Azul', code: '#2563EB' },
  { name: 'Azul Marinho', code: '#1E3A5F' },
  { name: 'Verde', code: '#16A34A' },
  { name: 'Amarelo', code: '#EAB308' },
  { name: 'Laranja', code: '#EA580C' },
  { name: 'Rosa', code: '#EC4899' },
  { name: 'Roxo', code: '#9333EA' },
  { name: 'Castanho', code: '#78350F' },
  { name: 'Bege', code: '#D4B896' },
  { name: 'Turquesa', code: '#14B8A6' },
];

const EditProductModal = ({ product, onClose, onUpdate }) => {
  const { axios } = useAppContext();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [stock, setStock] = useState('');
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🆕 SISTEMA DE FAMÍLIA
  const [productFamily, setProductFamily] = useState('');
  const [color, setColor] = useState('');
  const [colorCode, setColorCode] = useState('#000000');
  const [hasColor, setHasColor] = useState(false);

  // Load product data
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(Array.isArray(product.description) ? product.description.join('\n') : product.description || '');
      setCategory(product.category || '');
      setPrice(product.price?.toString() || '');
      setOfferPrice(product.offerPrice?.toString() || '');
      setStock(product.stock?.toString() || '0');
      setExistingImages(product.image || []);
      
      // Carregar dados de família/cor
      setProductFamily(product.productFamily || '');
      setColor(product.color || '');
      setColorCode(product.colorCode || '#000000');
      setHasColor(!!(product.color || product.colorCode));
    }
  }, [product]);

  // 🎯 GERAR SLUG PARA FAMÍLIA
  const generateFamilySlug = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // 🎯 SELECIONAR COR PRÉ-DEFINIDA
  const selectPresetColor = (preset) => {
    setColor(preset.name);
    setColorCode(preset.code);
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeNewFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (existingImages.length === 0 && files.length === 0) {
      toast.error('Adicione pelo menos uma imagem');
      return;
    }

    if (!stock || parseInt(stock) < 0) {
      toast.error('Defina a quantidade em stock');
      return;
    }

    if (hasColor && !color.trim()) {
      toast.error('Defina o nome da cor');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('id', product._id);

      // Add new images
      files.forEach(file => {
        formData.append('images', file);
      });

      const productData = {
        name,
        description: description.split('\n').filter(line => line.trim()),
        category,
        price: Number(price),
        offerPrice: Number(offerPrice),
        stock: parseInt(stock) || 0,
        image: existingImages, // Keep existing images
      };

      // Adicionar dados de família/cor
      if (productFamily.trim()) {
        productData.productFamily = generateFamilySlug(productFamily);
      } else {
        productData.productFamily = null;
      }
      
      if (hasColor && color.trim()) {
        productData.color = color;
        productData.colorCode = colorCode;
        
        // Se tem cor mas não tem família, usar o nome base como família
        if (!productFamily.trim()) {
          const baseName = name.replace(new RegExp(color, 'gi'), '').trim();
          if (baseName) {
            productData.productFamily = generateFamilySlug(baseName);
          }
        }
      } else {
        productData.color = null;
        productData.colorCode = null;
      }

      formData.append('productData', JSON.stringify(productData));

      const { data } = await axios.post('/api/product/update', formData);

      if (data.success) {
        toast.success('Produto atualizado com sucesso!');
        onUpdate && onUpdate(data.product);
        onClose();
      } else {
        toast.error(data.message || 'Erro ao atualizar produto');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar produto');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Editar Produto</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Images */}
          <div>
            <p className="text-base font-medium mb-2">Imagens do Produto</p>
            <div className="flex flex-wrap gap-3">
              {/* Existing Images */}
              {existingImages.map((img, index) => (
                <div key={`existing-${index}`} className="relative">
                  <img
                    src={img}
                    alt={`Product ${index + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {/* New Images */}
              {files.map((file, index) => (
                <div key={`new-${index}`} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`New ${index + 1}`}
                    className="w-20 h-20 object-cover rounded border border-green-400"
                  />
                  <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                    Novo
                  </span>
                  <button
                    type="button"
                    onClick={() => removeNewFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {/* Add Button */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  multiple
                  hidden
                />
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-primary transition-colors">
                  <span className="text-2xl text-gray-400">+</span>
                </div>
              </label>
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Nome do Produto</label>
            <input
              type="text"
              className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Descrição / Especificações</label>
            <textarea
              rows={3}
              className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary resize-none"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Uma especificação por linha"
              required
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Categoria</label>
            <select
              className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              <option value="">Selecionar</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat.path}>
                  {cat.text}
                </option>
              ))}
            </select>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Preço (€)</label>
              <input
                type="number"
                step="0.01"
                className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Preço Venda (€)</label>
              <input
                type="number"
                step="0.01"
                className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary"
                value={offerPrice}
                onChange={e => setOfferPrice(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Stock</label>
              <input
                type="number"
                min="0"
                className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary"
                value={stock}
                onChange={e => setStock(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 🆕 FAMÍLIA / COR */}
          <div className="border-t pt-5">
            <h3 className="text-base font-semibold mb-3">Família de Produtos (Cores)</h3>
            
            {/* Product Family */}
            <div className="flex flex-col gap-1 mb-4">
              <label className="text-sm font-medium">Nome da Família</label>
              <input
                type="text"
                className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary"
                value={productFamily}
                onChange={e => setProductFamily(e.target.value)}
                placeholder="Ex: Deck J-Bay (opcional)"
              />
            </div>

            {/* Toggle Color */}
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="hasColorEdit"
                checked={hasColor}
                onChange={e => setHasColor(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="hasColorEdit" className="text-sm font-medium cursor-pointer">
                Este produto tem uma cor específica
              </label>
            </div>

            {/* Color Fields */}
            {hasColor && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Nome da Cor</label>
                    <input
                      type="text"
                      className="w-full outline-none py-2 px-3 rounded border border-gray-300 mt-1"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      placeholder="Ex: Preto"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Cor</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={colorCode}
                        onChange={e => setColorCode(e.target.value)}
                        className="w-10 h-10 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={colorCode}
                        onChange={e => setColorCode(e.target.value)}
                        className="w-24 outline-none py-2 px-2 rounded border border-gray-300 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Colors */}
                <div>
                  <p className="text-xs font-medium mb-2">Cores Rápidas:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectPresetColor(preset)}
                        className={`w-6 h-6 rounded-full border transition-all hover:scale-110 ${
                          colorCode === preset.code ? 'ring-2 ring-primary ring-offset-1' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: preset.code }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary text-white rounded-md hover:bg-primary-dull transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'A guardar...' : 'Guardar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;