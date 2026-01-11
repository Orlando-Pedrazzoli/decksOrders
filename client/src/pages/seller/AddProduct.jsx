import React, { useState } from 'react';
import { assets, categories } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

// 🎯 CORES PRÉ-DEFINIDAS COMUNS
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

const AddProduct = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  
  // 🆕 STOCK
  const [stock, setStock] = useState('');
  
  // 🆕 SISTEMA DE FAMÍLIA DE PRODUTOS
  const [productFamily, setProductFamily] = useState('');
  const [color, setColor] = useState('');
  const [colorCode, setColorCode] = useState('#000000');
  const [hasColor, setHasColor] = useState(false);

  const { axios } = useAppContext();

  // 🎯 SELECIONAR COR PRÉ-DEFINIDA
  const selectPresetColor = (preset) => {
    setColor(preset.name);
    setColorCode(preset.code);
  };

  // 🎯 GERAR SLUG PARA FAMÍLIA
  const generateFamilySlug = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const onSubmitHandler = async event => {
    try {
      event.preventDefault();

      if (files.length === 0) {
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

      const formData = new FormData();
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
      };

      // Adicionar dados de família/cor se definidos
      if (productFamily.trim()) {
        productData.productFamily = generateFamilySlug(productFamily);
      }
      
      if (hasColor && color.trim()) {
        productData.color = color;
        productData.colorCode = colorCode;
        
        // Se tem cor mas não tem família, usar o nome base como família
        if (!productFamily.trim()) {
          // Extrair nome base (sem a cor)
          const baseName = name.replace(new RegExp(color, 'gi'), '').trim();
          if (baseName) {
            productData.productFamily = generateFamilySlug(baseName);
          }
        }
      }

      formData.append('productData', JSON.stringify(productData));

      const { data } = await axios.post('/api/product/add', formData);

      if (data.success) {
        toast.success('Produto adicionado com sucesso!');
        // Reset form
        setFiles([]);
        setName('');
        setDescription('');
        setCategory('');
        setPrice('');
        setOfferPrice('');
        setStock('');
        setProductFamily('');
        setColor('');
        setColorCode('#000000');
        setHasColor(false);
      } else {
        toast.error(data.message || 'Erro ao adicionar produto');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error.response?.data?.message || 'Erro ao adicionar produto');
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  // Remove a file
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <form onSubmit={onSubmitHandler} className="md:p-10 p-4 space-y-5 max-w-lg">
        <h2 className="text-2xl font-semibold mb-6">Adicionar Produto</h2>

        {/* Images */}
        <div>
          <p className="text-base font-medium">Imagens do Produto</p>
          <div className="flex flex-wrap gap-3 mt-2">
            {files.map((file, index) => (
              <div key={index} className="relative">
                <img
                  className="max-w-24 h-24 object-cover rounded border"
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            <label htmlFor="image-upload" className="cursor-pointer">
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                multiple
                hidden
              />
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-primary transition-colors">
                <img src={assets.upload_area} alt="Upload" className="w-10 h-10 opacity-50" />
              </div>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {files.length} imagem(ns) selecionada(s)
          </p>
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium">Nome do Produto</label>
          <input
            type="text"
            placeholder="Ex: Deck J-Bay Preto"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium">Descrição / Especificações</label>
          <textarea
            rows={4}
            placeholder="Escreva cada especificação numa linha separada"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500">Cada linha será um item da lista</p>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium">Categoria</label>
          <select
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
          >
            <option value="">Selecionar Categoria</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat.path}>
                {cat.text}
              </option>
            ))}
          </select>
        </div>

        {/* Price and Offer Price */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-base font-medium">Preço Original (€)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-base font-medium">Preço de Venda (€)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              value={offerPrice}
              onChange={e => setOfferPrice(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Stock */}
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium">Quantidade em Stock</label>
          <input
            type="number"
            min="0"
            placeholder="0"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            value={stock}
            onChange={e => setStock(e.target.value)}
            required
          />
        </div>

        {/* 🆕 SISTEMA DE FAMÍLIA/COR */}
        <div className="border-t border-gray-200 pt-5 mt-5">
          <h3 className="text-lg font-semibold mb-4">Família de Produtos (Cores)</h3>
          <p className="text-sm text-gray-600 mb-4">
            Se este produto faz parte de uma família com várias cores (ex: Deck J-Bay em Preto, Azul, Vermelho), 
            defina a família e a cor. Produtos da mesma família mostram bolinhas de cores para trocar entre eles.
          </p>

          {/* Product Family */}
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-base font-medium">Nome da Família</label>
            <input
              type="text"
              placeholder="Ex: Deck J-Bay (deixe em branco se não aplicável)"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              value={productFamily}
              onChange={e => setProductFamily(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Produtos com o mesmo nome de família serão agrupados
            </p>
          </div>

          {/* Toggle Color */}
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="hasColor"
              checked={hasColor}
              onChange={e => setHasColor(e.target.checked)}
              className="w-4 h-4 text-primary"
            />
            <label htmlFor="hasColor" className="text-base font-medium cursor-pointer">
              Este produto tem uma cor específica
            </label>
          </div>

          {/* Color Fields */}
          {hasColor && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Nome da Cor</label>
                <input
                  type="text"
                  placeholder="Ex: Preto, Azul Marinho"
                  className="outline-none py-2 px-3 rounded border border-gray-300"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Código da Cor</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colorCode}
                    onChange={e => setColorCode(e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colorCode}
                    onChange={e => setColorCode(e.target.value)}
                    className="outline-none py-2 px-3 rounded border border-gray-300 flex-1 font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Preset Colors */}
              <div>
                <p className="text-sm font-medium mb-2">Cores Rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectPresetColor(preset)}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        colorCode === preset.code 
                          ? 'ring-2 ring-primary ring-offset-2' 
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: preset.code }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              {color && (
                <div className="flex items-center gap-3 p-3 bg-white rounded border">
                  <div
                    className="w-10 h-10 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: colorCode }}
                  />
                  <div>
                    <p className="font-medium">{color}</p>
                    <p className="text-xs text-gray-500 font-mono">{colorCode}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3.5 bg-primary text-white font-medium rounded-md hover:bg-primary-dull transition-colors"
        >
          Adicionar Produto
        </button>
      </form>
    </div>
  );
};

export default AddProduct;