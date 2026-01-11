import React, { useState, useEffect } from 'react';
import { assets, categories } from '../../assets/assets';
import toast from 'react-hot-toast';

// Cores pré-definidas
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

const EditProductModal = ({ product, onClose, onSuccess, axios }) => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🆕 STOCK
  const [stock, setStock] = useState('');
  
  // 🆕 VARIANTES
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    color: '',
    colorCode: '#000000',
    stock: '',
  });
  const [editingVariant, setEditingVariant] = useState(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description.join('\n'));
      setCategory(product.category);
      setPrice(product.price.toString());
      setOfferPrice(product.offerPrice.toString());
      setStock((product.stock || 0).toString());
      
      // Carregar variantes
      if (product.variants && product.variants.length > 0) {
        setHasVariants(true);
        setVariants(product.variants.map(v => ({
          ...v,
          id: v._id || Date.now() + Math.random(),
        })));
      } else {
        setHasVariants(false);
        setVariants([]);
      }
    }
  }, [product]);

  // Adicionar variante
  const addVariant = () => {
    if (!newVariant.color.trim()) {
      toast.error('Nome da cor é obrigatório');
      return;
    }
    
    if (variants.some(v => v.color.toLowerCase() === newVariant.color.toLowerCase())) {
      toast.error('Já existe uma variante com esta cor');
      return;
    }
    
    setVariants([...variants, {
      ...newVariant,
      stock: parseInt(newVariant.stock) || 0,
      id: Date.now(),
      images: [],
    }]);
    
    setNewVariant({ color: '', colorCode: '#000000', stock: '' });
    setShowVariantForm(false);
    toast.success('Variante adicionada!');
  };

  // Remover variante
  const removeVariant = (id) => {
    setVariants(variants.filter(v => v.id !== id && v._id !== id));
    toast.success('Variante removida');
  };

  // Atualizar stock de uma variante
  const updateVariantStock = (id, newStock) => {
    setVariants(variants.map(v => 
      (v.id === id || v._id === id) 
        ? { ...v, stock: parseInt(newStock) || 0 } 
        : v
    ));
  };

  // Selecionar cor pré-definida
  const selectPresetColor = (preset) => {
    setNewVariant({
      ...newVariant,
      color: preset.name,
      colorCode: preset.code,
    });
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Validações
      if (!hasVariants && stock === '') {
        toast.error('Defina a quantidade em stock');
        setIsSubmitting(false);
        return;
      }

      if (hasVariants && variants.length === 0) {
        toast.error('Adicione pelo menos uma variante de cor');
        setIsSubmitting(false);
        return;
      }

      const productData = {
        name,
        description: description.split('\n'),
        category,
        price: parseFloat(price),
        offerPrice: parseFloat(offerPrice),
        stock: hasVariants ? 0 : parseInt(stock),
        variants: hasVariants ? variants.map(v => ({
          _id: v._id, // Manter ID se existir
          color: v.color,
          colorCode: v.colorCode,
          stock: parseInt(v.stock) || 0,
          images: v.images || [],
        })) : [],
      };

      const formData = new FormData();
      formData.append('id', product._id);
      formData.append('productData', JSON.stringify(productData));

      // Adicionar novas imagens
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
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
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
          {/* Imagens */}
          <div>
            <p className='text-base font-medium mb-2'>Imagens do Produto</p>
            <p className='text-sm text-gray-600 mb-3'>
              Imagens atuais serão mantidas se não adicionar novas
            </p>

            {/* Imagens atuais */}
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

            {/* Upload novas imagens */}
            <div className='flex flex-wrap items-center gap-3'>
              {Array(8)
                .fill('')
                .map((_, index) => (
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
                      accept='image/*'
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

          {/* Nome */}
          <div className='flex flex-col gap-1'>
            <label className='text-base font-medium' htmlFor='product-name'>
              Nome do Produto
            </label>
            <input
              onChange={e => setName(e.target.value)}
              value={name}
              id='product-name'
              type='text'
              placeholder='Digite o nome'
              className='outline-none py-2.5 px-3 rounded border border-gray-500/40'
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Descrição */}
          <div className='flex flex-col gap-1'>
            <label className='text-base font-medium' htmlFor='product-description'>
              Descrição do Produto
            </label>
            <textarea
              onChange={e => setDescription(e.target.value)}
              value={description}
              id='product-description'
              rows={4}
              className='outline-none py-2.5 px-3 rounded border border-gray-500/40 resize-none'
              placeholder='Digite a descrição'
              disabled={isSubmitting}
            ></textarea>
          </div>

          {/* Categoria */}
          <div className='flex flex-col gap-1'>
            <label className='text-base font-medium' htmlFor='category'>
              Categoria
            </label>
            <select
              onChange={e => setCategory(e.target.value)}
              value={category}
              id='category'
              className='outline-none py-2.5 px-3 rounded border border-gray-500/40'
              disabled={isSubmitting}
            >
              <option value=''>Selecione a Categoria</option>
              {categories.map((item, index) => (
                <option key={index} value={item.path}>
                  {item.path}
                </option>
              ))}
            </select>
          </div>

          {/* Preços */}
          <div className='flex items-center gap-5 flex-wrap'>
            <div className='flex-1 flex flex-col gap-1 min-w-[120px]'>
              <label className='text-base font-medium' htmlFor='product-price'>
                Preço Original (€)
              </label>
              <input
                onChange={e => setPrice(e.target.value)}
                value={price}
                id='product-price'
                type='number'
                step='0.01'
                placeholder='0.00'
                className='outline-none py-2.5 px-3 rounded border border-gray-500/40'
                required
                disabled={isSubmitting}
              />
            </div>
            <div className='flex-1 flex flex-col gap-1 min-w-[120px]'>
              <label className='text-base font-medium' htmlFor='offer-price'>
                Preço de Venda (€)
              </label>
              <input
                onChange={e => setOfferPrice(e.target.value)}
                value={offerPrice}
                id='offer-price'
                type='number'
                step='0.01'
                placeholder='0.00'
                className='outline-none py-2.5 px-3 rounded border border-gray-500/40'
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Toggle Variantes */}
          <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-base font-medium'>Variantes de Cor</p>
                <p className='text-sm text-gray-500'>Este produto tem variações de cor?</p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={hasVariants}
                  onChange={e => setHasVariants(e.target.checked)}
                  className='sr-only peer'
                  disabled={isSubmitting}
                />
                <div className='w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-primary transition-colors'>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hasVariants ? 'translate-x-5' : ''}`}></div>
                </div>
              </label>
            </div>
          </div>

          {/* 🆕 STOCK (se não tem variantes) */}
          {!hasVariants && (
            <div className='flex flex-col gap-1'>
              <label className='text-base font-medium' htmlFor='stock'>
                Quantidade em Stock
              </label>
              <input
                onChange={e => setStock(e.target.value)}
                value={stock}
                id='stock'
                type='number'
                min='0'
                placeholder='0'
                className='outline-none py-2.5 px-3 rounded border border-gray-500/40'
                disabled={isSubmitting}
              />
              <p className='text-xs text-gray-500'>Defina 0 se o produto estiver esgotado</p>
            </div>
          )}

          {/* 🆕 GESTÃO DE VARIANTES */}
          {hasVariants && (
            <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
              <p className='text-base font-medium mb-3'>Variantes de Cor</p>
              
              {/* Lista de variantes */}
              {variants.length > 0 && (
                <div className='space-y-2 mb-4'>
                  {variants.map((variant) => (
                    <div 
                      key={variant.id || variant._id}
                      className='flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200'
                    >
                      <div className='flex items-center gap-3'>
                        <div 
                          className='w-8 h-8 rounded-full border-2 border-gray-300'
                          style={{ backgroundColor: variant.colorCode }}
                        />
                        <div>
                          <p className='font-medium text-sm'>{variant.color}</p>
                          <p className='text-xs text-gray-500'>{variant.colorCode}</p>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        {/* Input de stock editável */}
                        <div className='flex items-center gap-1'>
                          <span className='text-xs text-gray-500'>Stock:</span>
                          <input
                            type='number'
                            min='0'
                            value={variant.stock}
                            onChange={e => updateVariantStock(variant.id || variant._id, e.target.value)}
                            className='w-16 py-1 px-2 text-sm border border-gray-300 rounded text-center'
                            disabled={isSubmitting}
                          />
                        </div>
                        <button
                          type='button'
                          onClick={() => removeVariant(variant.id || variant._id)}
                          className='text-red-500 hover:text-red-700 p-1'
                          disabled={isSubmitting}
                        >
                          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulário de nova variante */}
              {showVariantForm ? (
                <div className='bg-white p-4 rounded-lg border border-gray-200 space-y-3'>
                  <p className='font-medium text-sm'>Nova Variante</p>
                  
                  {/* Cores pré-definidas */}
                  <div>
                    <p className='text-xs text-gray-500 mb-2'>Cores rápidas:</p>
                    <div className='flex flex-wrap gap-2'>
                      {PRESET_COLORS.map((preset) => (
                        <button
                          key={preset.code}
                          type='button'
                          onClick={() => selectPresetColor(preset)}
                          title={preset.name}
                          className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                            newVariant.colorCode === preset.code ? 'ring-2 ring-offset-1 ring-primary' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: preset.code }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Nome da cor */}
                  <div>
                    <label className='text-xs font-medium'>Nome da Cor</label>
                    <input
                      type='text'
                      value={newVariant.color}
                      onChange={e => setNewVariant({ ...newVariant, color: e.target.value })}
                      placeholder='Ex: Azul Marinho'
                      className='w-full mt-1 py-2 px-3 rounded border border-gray-300 text-sm'
                    />
                  </div>

                  {/* Color picker e stock */}
                  <div className='flex items-center gap-3'>
                    <div>
                      <label className='text-xs font-medium'>Código da Cor</label>
                      <div className='flex items-center gap-2 mt-1'>
                        <input
                          type='color'
                          value={newVariant.colorCode}
                          onChange={e => setNewVariant({ ...newVariant, colorCode: e.target.value })}
                          className='w-10 h-10 rounded cursor-pointer'
                        />
                        <input
                          type='text'
                          value={newVariant.colorCode}
                          onChange={e => setNewVariant({ ...newVariant, colorCode: e.target.value })}
                          className='w-24 py-2 px-3 rounded border border-gray-300 text-sm font-mono'
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className='text-xs font-medium'>Stock</label>
                      <input
                        type='number'
                        min='0'
                        value={newVariant.stock}
                        onChange={e => setNewVariant({ ...newVariant, stock: e.target.value })}
                        placeholder='0'
                        className='w-20 mt-1 py-2 px-3 rounded border border-gray-300 text-sm'
                      />
                    </div>
                  </div>

                  {/* Botões */}
                  <div className='flex gap-2'>
                    <button
                      type='button'
                      onClick={addVariant}
                      className='flex-1 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary/90'
                    >
                      Adicionar
                    </button>
                    <button
                      type='button'
                      onClick={() => setShowVariantForm(false)}
                      className='flex-1 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300'
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type='button'
                  onClick={() => setShowVariantForm(true)}
                  disabled={isSubmitting}
                  className='w-full py-2.5 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                  </svg>
                  Adicionar Variante de Cor
                </button>
              )}

              {/* Stock total */}
              {variants.length > 0 && (
                <div className='mt-3 p-2 bg-green-50 rounded text-sm text-green-700'>
                  <strong>Stock Total:</strong> {variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)} unidades
                </div>
              )}
            </div>
          )}

          {/* Botões de ação */}
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