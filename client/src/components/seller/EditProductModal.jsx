import React, { useState, useEffect } from 'react';
import { assets, categories } from '../../assets/assets';
import toast from 'react-hot-toast';

// 🎯 CORES PRÉ-DEFINIDAS (SIMPLES)
const PRESET_COLORS = [
  { name: 'Preto', code: '#000000' },
  { name: 'Branco', code: '#FFFFFF' },
  { name: 'Cinza', code: '#6B7280' },
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

// 🆕 CORES DUPLAS PRÉ-DEFINIDAS
const PRESET_DUAL_COLORS = [
  { name: 'Preto/Azul', code1: '#000000', code2: '#2096d7' },
  { name: 'Preto/Cinza', code1: '#000000', code2: '#6a727f' },
  { name: 'Preto/Musgo', code1: '#000000', code2: '#3b6343' },
  { name: 'Preto/Verde', code1: '#000000', code2: '#87be47' },
  { name: 'Preto/Amarelo', code1: '#000000', code2: '#d9c214' },
  { name: 'Preto/Rosa', code1: '#000000', code2: '#d2336e' },
  { name: 'Preto/Branco', code1: '#000000', code2: '#dfdfe1' },
  { name: 'Preto/Vermelho', code1: '#000000', code2: '#dc2333' },
];

// 🆕 Componente para renderizar bolinha de cor (simples ou dupla)
const ColorBall = ({ code1, code2, size = 32, selected = false, onClick, title }) => {
  const isDual = code2 && code2 !== code1;
  const isLight = (code) => {
    if (!code) return false;
    const lightColors = ['#FFFFFF', '#FFF', '#ffffff', '#fff', '#F5F5F5', '#FAFAFA', '#f5f5f5', '#fafafa'];
    if (lightColors.includes(code)) return true;
    const hex = code.replace('#', '');
    if (hex.length !== 6) return false;
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 200;
  };
  
  return (
    <button
      type='button'
      onClick={onClick}
      className={`rounded-full transition-all hover:scale-110 ${
        selected 
          ? 'ring-2 ring-primary ring-offset-2' 
          : 'border-2 border-gray-300'
      }`}
      style={{ width: size, height: size }}
      title={title}
    >
      {isDual ? (
        // Bolinha dividida na diagonal
        <div 
          className='w-full h-full rounded-full overflow-hidden'
          style={{
            background: `linear-gradient(135deg, ${code1} 50%, ${code2} 50%)`,
            border: (isLight(code1) || isLight(code2)) ? '1px solid #d1d5db' : 'none'
          }}
        />
      ) : (
        // Bolinha simples
        <div 
          className='w-full h-full rounded-full'
          style={{ 
            backgroundColor: code1,
            border: isLight(code1) ? '1px solid #d1d5db' : 'none'
          }}
        />
      )}
    </button>
  );
};

const EditProductModal = ({ product, onClose, onSuccess, axios }) => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CAMPOS DE STOCK
  const [stock, setStock] = useState('');

  // CAMPOS DE FAMÍLIA/COR
  const [productFamily, setProductFamily] = useState('');
  const [hasColor, setHasColor] = useState(false);
  const [color, setColor] = useState('');
  const [colorCode, setColorCode] = useState('#000000');
  
  // 🆕 COR DUPLA
  const [isDualColor, setIsDualColor] = useState(false);
  const [colorCode2, setColorCode2] = useState('#2563EB');
  
  const [isMainVariant, setIsMainVariant] = useState(true);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description.join('\n'));
      setCategory(product.category);
      setPrice(product.price.toString());
      setOfferPrice(product.offerPrice.toString());
      
      // Carregar campos de stock
      setStock((product.stock || 0).toString());
      
      // Carregar campos de família/cor
      setProductFamily(product.productFamily || '');
      setIsMainVariant(product.isMainVariant !== false);
      
      if (product.color || product.colorCode) {
        setHasColor(true);
        setColor(product.color || '');
        setColorCode(product.colorCode || '#000000');
        
        // 🆕 Carregar segunda cor se existir
        if (product.colorCode2 && product.colorCode2 !== product.colorCode) {
          setIsDualColor(true);
          setColorCode2(product.colorCode2);
        } else {
          setIsDualColor(false);
          setColorCode2('#2563EB');
        }
      } else {
        setHasColor(false);
        setColor('');
        setColorCode('#000000');
        setIsDualColor(false);
        setColorCode2('#2563EB');
      }
    }
  }, [product]);

  // GERAR SLUG PARA FAMÍLIA
  const generateFamilySlug = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // 🎯 SELECIONAR COR SIMPLES
  const selectPresetColor = (preset) => {
    setColor(preset.name);
    setColorCode(preset.code);
    setIsDualColor(false);
  };

  // 🆕 SELECIONAR COR DUPLA
  const selectPresetDualColor = (preset) => {
    setColor(preset.name);
    setColorCode(preset.code1);
    setColorCode2(preset.code2);
    setIsDualColor(true);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (stock === '' || parseInt(stock) < 0) {
        toast.error('Defina a quantidade em stock');
        setIsSubmitting(false);
        return;
      }

      if (hasColor && !color.trim()) {
        toast.error('Defina o nome da cor');
        setIsSubmitting(false);
        return;
      }

      const productData = {
        name,
        description: description.split('\n').filter(line => line.trim()),
        category,
        price: parseFloat(price),
        offerPrice: parseFloat(offerPrice),
        stock: parseInt(stock) || 0,
        isMainVariant,
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
        
        // 🆕 Adicionar segunda cor se for dual
        if (isDualColor && colorCode2) {
          productData.colorCode2 = colorCode2;
        } else {
          productData.colorCode2 = null;
        }
        
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
        productData.colorCode2 = null;
      }

      const formData = new FormData();
      formData.append('id', product._id);
      formData.append('productData', JSON.stringify(productData));

      // Adicionar apenas as novas imagens
      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          formData.append('images', files[i]);
        }
      }

      const { data } = await axios.post('/api/product/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        toast.success(data.message);
        onSuccess();
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error(error.response?.data?.message || error.message || 'Erro ao atualizar produto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10'>
          <h2 className='text-xl font-bold text-gray-800'>Editar Produto</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 transition-colors'
            disabled={isSubmitting}
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-5'>
          {/* Product Images */}
          <div>
            <p className='text-base font-medium mb-2'>Imagens do Produto</p>
            <p className='text-sm text-gray-600 mb-3'>
              Imagens atuais serão mantidas se não adicionar novas
            </p>

            {/* Current Images Preview */}
            <div className='mb-3 flex flex-wrap gap-2'>
              {product.image.map((img, index) => (
                <div key={index} className='relative'>
                  <img
                    src={img}
                    alt={`Current ${index}`}
                    className='w-20 h-20 object-contain border border-gray-300 rounded-lg p-1'
                  />
                  <div className='absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full'>
                    Atual
                  </div>
                </div>
              ))}
            </div>

            {/* New Images Upload */}
            <div className='flex flex-wrap items-center gap-3'>
              {Array(8).fill('').map((_, index) => (
                <label key={index} htmlFor={`image${index}`}>
                  <input
                    onChange={e => {
                      const updatedFiles = [...files];
                      updatedFiles[index] = e.target.files[0];
                      setFiles(updatedFiles);
                    }}
                    type='file'
                    id={`image${index}`}
                    hidden
                    disabled={isSubmitting}
                  />
                  <div className='relative'>
                    <img
                      className='max-w-24 cursor-pointer border border-gray-300 rounded-lg p-2'
                      src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area}
                      alt='uploadArea'
                      width={100}
                      height={100}
                    />
                    {files[index] && (
                      <div className='absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full'>
                        Nova
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Product Name */}
          <div className='flex flex-col gap-1'>
            <label className='text-base font-medium' htmlFor='product-name'>Nome do Produto</label>
            <input
              onChange={e => setName(e.target.value)}
              value={name}
              id='product-name'
              type='text'
              placeholder='Digite o nome'
              className='outline-none py-2.5 px-3 rounded border border-gray-500/40 focus:border-primary transition-colors'
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Product Description */}
          <div className='flex flex-col gap-1'>
            <label className='text-base font-medium' htmlFor='product-description'>Descrição do Produto</label>
            <textarea
              onChange={e => setDescription(e.target.value)}
              value={description}
              id='product-description'
              rows={4}
              className='outline-none py-2.5 px-3 rounded border border-gray-500/40 focus:border-primary transition-colors resize-none'
              placeholder='Digite a descrição'
              disabled={isSubmitting}
            ></textarea>
          </div>

          {/* Category */}
          <div className='flex flex-col gap-1'>
            <label className='text-base font-medium' htmlFor='category'>Categoria</label>
            <select
              onChange={e => setCategory(e.target.value)}
              value={category}
              id='category'
              className='outline-none py-2.5 px-3 rounded border border-gray-500/40 focus:border-primary transition-colors'
              disabled={isSubmitting}
            >
              <option value=''>Selecione a Categoria</option>
              {categories.map((item, index) => (
                <option key={index} value={item.path}>{item.path}</option>
              ))}
            </select>
          </div>

          {/* Prices */}
          <div className='flex items-center gap-5 flex-wrap'>
            <div className='flex-1 flex flex-col gap-1 min-w-[120px]'>
              <label className='text-base font-medium' htmlFor='product-price'>Preço Original (€)</label>
              <input
                onChange={e => setPrice(e.target.value)}
                value={price}
                id='product-price'
                type='number'
                step='0.01'
                placeholder='0.00'
                className='outline-none py-2.5 px-3 rounded border border-gray-500/40 focus:border-primary transition-colors'
                required
                disabled={isSubmitting}
              />
            </div>
            <div className='flex-1 flex flex-col gap-1 min-w-[120px]'>
              <label className='text-base font-medium' htmlFor='offer-price'>Preço de Venda (€)</label>
              <input
                onChange={e => setOfferPrice(e.target.value)}
                value={offerPrice}
                id='offer-price'
                type='number'
                step='0.01'
                placeholder='0.00'
                className='outline-none py-2.5 px-3 rounded border border-gray-500/40 focus:border-primary transition-colors'
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* STOCK */}
          <div className='flex flex-col gap-1'>
            <label className='text-base font-medium' htmlFor='stock'>Quantidade em Stock</label>
            <input
              onChange={e => setStock(e.target.value)}
              value={stock}
              id='stock'
              type='number'
              min='0'
              placeholder='0'
              className='outline-none py-2.5 px-3 rounded border border-gray-500/40 focus:border-primary transition-colors max-w-[200px]'
              required
              disabled={isSubmitting}
            />
            <p className='text-xs text-gray-500'>Defina 0 para produto esgotado</p>
          </div>

          {/* FAMÍLIA DE PRODUTOS */}
          <div className='border-t border-gray-200 pt-5 mt-5'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4'>Família de Produtos (Variantes de Cor)</h3>

            {/* Nome da Família */}
            <div className='flex flex-col gap-1 mb-4'>
              <label className='text-base font-medium' htmlFor='product-family'>Nome da Família</label>
              <input
                onChange={e => setProductFamily(e.target.value)}
                value={productFamily}
                id='product-family'
                type='text'
                placeholder='Ex: Deck J-Bay (deixe em branco se não aplicável)'
                className='outline-none py-2.5 px-3 rounded border border-gray-500/40 focus:border-primary transition-colors'
                disabled={isSubmitting}
              />
              <p className='text-xs text-gray-500'>Produtos com o mesmo nome de família serão agrupados</p>
            </div>

            {/* Toggle Cor */}
            <div className='flex items-center gap-3 mb-4'>
              <input
                type='checkbox'
                id='hasColor'
                checked={hasColor}
                onChange={e => setHasColor(e.target.checked)}
                className='w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer'
                disabled={isSubmitting}
              />
              <label htmlFor='hasColor' className='text-base font-medium cursor-pointer'>
                Este produto tem uma cor específica
              </label>
            </div>

            {/* Campos de Cor */}
            {hasColor && (
              <div className='bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-200'>
                
                {/* 🆕 Toggle Cor Simples / Dupla */}
                <div className='flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200'>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='colorType'
                      checked={!isDualColor}
                      onChange={() => setIsDualColor(false)}
                      className='w-4 h-4 text-primary focus:ring-primary'
                      disabled={isSubmitting}
                    />
                    <span className='text-sm font-medium'>Cor Única</span>
                    <div className='w-5 h-5 rounded-full bg-primary'></div>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='colorType'
                      checked={isDualColor}
                      onChange={() => setIsDualColor(true)}
                      className='w-4 h-4 text-primary focus:ring-primary'
                      disabled={isSubmitting}
                    />
                    <span className='text-sm font-medium'>Duas Cores</span>
                    <div 
                      className='w-5 h-5 rounded-full'
                      style={{ background: 'linear-gradient(135deg, #2563EB 50%, #000000 50%)' }}
                    ></div>
                  </label>
                </div>

                {/* Nome da Cor */}
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-medium'>Nome da Cor</label>
                  <input
                    type='text'
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    placeholder={isDualColor ? 'Ex: Preto/Azul' : 'Ex: Preto, Azul Marinho'}
                    className='outline-none py-2 px-3 rounded-lg border border-gray-300 focus:border-primary transition-colors'
                    disabled={isSubmitting}
                  />
                </div>

                {/* 🆕 Seletor de Cores - Simples ou Dupla */}
                {!isDualColor ? (
                  // COR ÚNICA
                  <>
                    <div className='flex flex-col gap-1'>
                      <label className='text-sm font-medium'>Código da Cor</label>
                      <div className='flex items-center gap-3'>
                        <input
                          type='color'
                          value={colorCode}
                          onChange={e => setColorCode(e.target.value)}
                          className='w-12 h-10 rounded border border-gray-300 cursor-pointer'
                          disabled={isSubmitting}
                        />
                        <input
                          type='text'
                          value={colorCode}
                          onChange={e => setColorCode(e.target.value)}
                          placeholder='#000000'
                          className='outline-none py-2 px-3 rounded-lg border border-gray-300 focus:border-primary transition-colors flex-1 font-mono'
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* Cores Rápidas - Simples */}
                    <div>
                      <p className='text-sm font-medium mb-2'>Cores Rápidas:</p>
                      <div className='flex flex-wrap gap-2'>
                        {PRESET_COLORS.map((preset, index) => (
                          <ColorBall
                            key={index}
                            code1={preset.code}
                            size={32}
                            selected={colorCode === preset.code && !isDualColor}
                            onClick={() => !isSubmitting && selectPresetColor(preset)}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  // 🆕 DUAS CORES
                  <>
                    <div className='grid grid-cols-2 gap-4'>
                      {/* Cor 1 */}
                      <div className='flex flex-col gap-1'>
                        <label className='text-sm font-medium'>Cor 1 (Esquerda)</label>
                        <div className='flex items-center gap-2'>
                          <input
                            type='color'
                            value={colorCode}
                            onChange={e => setColorCode(e.target.value)}
                            className='w-10 h-10 rounded border border-gray-300 cursor-pointer'
                            disabled={isSubmitting}
                          />
                          <input
                            type='text'
                            value={colorCode}
                            onChange={e => setColorCode(e.target.value)}
                            placeholder='#000000'
                            className='outline-none py-2 px-3 rounded-lg border border-gray-300 focus:border-primary transition-colors flex-1 font-mono text-sm'
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      
                      {/* Cor 2 */}
                      <div className='flex flex-col gap-1'>
                        <label className='text-sm font-medium'>Cor 2 (Direita)</label>
                        <div className='flex items-center gap-2'>
                          <input
                            type='color'
                            value={colorCode2}
                            onChange={e => setColorCode2(e.target.value)}
                            className='w-10 h-10 rounded border border-gray-300 cursor-pointer'
                            disabled={isSubmitting}
                          />
                          <input
                            type='text'
                            value={colorCode2}
                            onChange={e => setColorCode2(e.target.value)}
                            placeholder='#2563EB'
                            className='outline-none py-2 px-3 rounded-lg border border-gray-300 focus:border-primary transition-colors flex-1 font-mono text-sm'
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cores Rápidas - Duplas */}
                    <div>
                      <p className='text-sm font-medium mb-2'>Combinações Rápidas:</p>
                      <div className='flex flex-wrap gap-2'>
                        {PRESET_DUAL_COLORS.map((preset, index) => (
                          <ColorBall
                            key={index}
                            code1={preset.code1}
                            code2={preset.code2}
                            size={32}
                            selected={isDualColor && colorCode === preset.code1 && colorCode2 === preset.code2}
                            onClick={() => !isSubmitting && selectPresetDualColor(preset)}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Preview da Cor */}
                {color && (
                  <div className='flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200'>
                    <ColorBall 
                      code1={colorCode} 
                      code2={isDualColor ? colorCode2 : null} 
                      size={40}
                    />
                    <div>
                      <p className='font-medium'>{color}</p>
                      <p className='text-xs text-gray-500 font-mono'>
                        {isDualColor ? `${colorCode} / ${colorCode2}` : colorCode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Produto Principal */}
            <div className='flex items-center gap-3 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200'>
              <input
                type='checkbox'
                id='isMainVariant'
                checked={isMainVariant}
                onChange={e => setIsMainVariant(e.target.checked)}
                className='w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer'
                disabled={isSubmitting}
              />
              <div>
                <label htmlFor='isMainVariant' className='text-base font-medium cursor-pointer'>
                  Produto Principal da Família
                </label>
                <p className='text-xs text-gray-600 mt-0.5'>
                  Se marcado, este produto aparece na listagem. Apenas um por família deve ser principal.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center gap-3 pt-4 border-t border-gray-200'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300 transition-colors'
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type='submit'
              className='flex-1 px-6 py-2.5 bg-primary text-white font-medium rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className='animate-spin h-5 w-5 text-white' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                  </svg>
                  Atualizando...
                </>
              ) : (
                'Atualizar Produto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;