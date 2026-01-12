import React, { useState } from 'react';
import { assets, categories } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

// 🎯 CORES PRÉ-DEFINIDAS
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

const AddProduct = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  
  // 🆕 STOCK
  const [stock, setStock] = useState('');
  
  // 🆕 SISTEMA DE FAMÍLIA/COR
  const [productFamily, setProductFamily] = useState('');
  const [hasColor, setHasColor] = useState(false);
  const [color, setColor] = useState('');
  const [colorCode, setColorCode] = useState('#000000');
  const [isMainVariant, setIsMainVariant] = useState(true);

  const { axios } = useAppContext();

  // 🎯 GERAR SLUG PARA FAMÍLIA
  const generateFamilySlug = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-')     // Substitui caracteres especiais
      .replace(/(^-|-$)/g, '');         // Remove hífens nas pontas
  };

  // 🎯 SELECIONAR COR PRÉ-DEFINIDA
  const selectPresetColor = (preset) => {
    setColor(preset.name);
    setColorCode(preset.code);
  };

  const onSubmitHandler = async event => {
    try {
      event.preventDefault();

      if (files.length === 0) {
        toast.error('Adicione pelo menos uma imagem');
        return;
      }

      if (stock === '' || parseInt(stock) < 0) {
        toast.error('Defina a quantidade em stock');
        return;
      }

      if (hasColor && !color.trim()) {
        toast.error('Defina o nome da cor');
        return;
      }

      const productData = {
        name,
        description: description.split('\n').filter(line => line.trim()),
        category,
        price: Number(price),
        offerPrice: Number(offerPrice),
        stock: parseInt(stock) || 0,
        isMainVariant,
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
          const baseName = name.replace(new RegExp(color, 'gi'), '').trim();
          if (baseName) {
            productData.productFamily = generateFamilySlug(baseName);
          }
        }
      }

      const formData = new FormData();
      formData.append('productData', JSON.stringify(productData));
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }

      const { data } = await axios.post('/api/product/add', formData);

      if (data.success) {
        toast.success('Produto adicionado com sucesso!');
        // Reset form
        setName('');
        setDescription('');
        setCategory('');
        setPrice('');
        setOfferPrice('');
        setStock('');
        setFiles([]);
        setProductFamily('');
        setHasColor(false);
        setColor('');
        setColorCode('#000000');
        setIsMainVariant(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between'>
      <form onSubmit={onSubmitHandler} className='md:p-10 p-4 space-y-5 max-w-2xl'>
        
        <h2 className='text-2xl font-bold text-gray-800 mb-6'>Adicionar Produto</h2>

        {/* Imagens */}
        <div>
          <p className='text-base font-medium mb-2'>Imagens do Produto</p>
          <div className='flex flex-wrap items-center gap-3'>
            {Array(8)
              .fill('')
              .map((_, index) => (
                <label key={index} htmlFor={`image${index}`} className='cursor-pointer'>
                  <input
                    onChange={e => {
                      const updatedFiles = [...files];
                      updatedFiles[index] = e.target.files[0];
                      setFiles(updatedFiles);
                    }}
                    type='file'
                    id={`image${index}`}
                    hidden
                    accept='image/*'
                  />
                  <img
                    className='w-20 h-20 object-cover rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition-colors'
                    src={
                      files[index]
                        ? URL.createObjectURL(files[index])
                        : assets.upload_area
                    }
                    alt={`Upload ${index + 1}`}
                  />
                </label>
              ))}
          </div>
          <p className='text-xs text-gray-500 mt-2'>Arraste ou clique para adicionar até 8 imagens</p>
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
            placeholder='Ex: Deck J-Bay Preto'
            className='outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:border-primary transition-colors'
            required
          />
        </div>

        {/* Descrição */}
        <div className='flex flex-col gap-1'>
          <label className='text-base font-medium' htmlFor='product-description'>
            Descrição / Especificações
          </label>
          <textarea
            onChange={e => setDescription(e.target.value)}
            value={description}
            id='product-description'
            rows={4}
            className='outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:border-primary transition-colors resize-none'
            placeholder='Escreva cada especificação numa linha separada'
          ></textarea>
          <p className='text-xs text-gray-500'>Cada linha será um item da lista</p>
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
            className='outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:border-primary transition-colors'
            required
          >
            <option value=''>Selecionar Categoria</option>
            {categories.map((item, index) => (
              <option key={index} value={item.path}>
                {item.path}
              </option>
            ))}
          </select>
        </div>

        {/* Preços */}
        <div className='flex items-center gap-5 flex-wrap'>
          <div className='flex-1 flex flex-col gap-1 min-w-[140px]'>
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
              className='outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:border-primary transition-colors'
              required
            />
          </div>
          <div className='flex-1 flex flex-col gap-1 min-w-[140px]'>
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
              className='outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:border-primary transition-colors'
              required
            />
          </div>
        </div>

        {/* 🆕 STOCK */}
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
            className='outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:border-primary transition-colors max-w-[200px]'
            required
          />
          <p className='text-xs text-gray-500'>Defina 0 para produto esgotado</p>
        </div>

        {/* 🆕 FAMÍLIA DE PRODUTOS */}
        <div className='border-t border-gray-200 pt-6 mt-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            Família de Produtos (Variantes de Cor)
          </h3>
          <p className='text-sm text-gray-600 mb-4'>
            Se este produto faz parte de uma família com várias cores (ex: Deck J-Bay em Preto, Azul, Vermelho), 
            defina a família abaixo. Produtos da mesma família mostram bolinhas de cor para alternar entre eles.
          </p>

          {/* Nome da Família */}
          <div className='flex flex-col gap-1 mb-4'>
            <label className='text-base font-medium' htmlFor='product-family'>
              Nome da Família
            </label>
            <input
              onChange={e => setProductFamily(e.target.value)}
              value={productFamily}
              id='product-family'
              type='text'
              placeholder='Ex: Deck J-Bay (deixe em branco se não aplicável)'
              className='outline-none py-2.5 px-3 rounded-lg border border-gray-300 focus:border-primary transition-colors'
            />
            <p className='text-xs text-gray-500'>
              Produtos com o mesmo nome de família serão agrupados (gera slug automático)
            </p>
          </div>

          {/* Toggle Cor */}
          <div className='flex items-center gap-3 mb-4'>
            <input
              type='checkbox'
              id='hasColor'
              checked={hasColor}
              onChange={e => setHasColor(e.target.checked)}
              className='w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer'
            />
            <label htmlFor='hasColor' className='text-base font-medium cursor-pointer'>
              Este produto tem uma cor específica
            </label>
          </div>

          {/* Campos de Cor */}
          {hasColor && (
            <div className='bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-200'>
              {/* Nome da Cor */}
              <div className='flex flex-col gap-1'>
                <label className='text-sm font-medium'>Nome da Cor</label>
                <input
                  type='text'
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  placeholder='Ex: Preto, Azul Marinho'
                  className='outline-none py-2 px-3 rounded-lg border border-gray-300 focus:border-primary transition-colors'
                />
              </div>

              {/* Código da Cor */}
              <div className='flex flex-col gap-1'>
                <label className='text-sm font-medium'>Código da Cor</label>
                <div className='flex items-center gap-3'>
                  <input
                    type='color'
                    value={colorCode}
                    onChange={e => setColorCode(e.target.value)}
                    className='w-12 h-10 rounded border border-gray-300 cursor-pointer'
                  />
                  <input
                    type='text'
                    value={colorCode}
                    onChange={e => setColorCode(e.target.value)}
                    placeholder='#000000'
                    className='outline-none py-2 px-3 rounded-lg border border-gray-300 focus:border-primary transition-colors flex-1 font-mono'
                  />
                </div>
              </div>

              {/* Cores Rápidas */}
              <div>
                <p className='text-sm font-medium mb-2'>Cores Rápidas:</p>
                <div className='flex flex-wrap gap-2'>
                  {PRESET_COLORS.map((preset, index) => (
                    <button
                      key={index}
                      type='button'
                      onClick={() => selectPresetColor(preset)}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        colorCode === preset.code 
                          ? 'ring-2 ring-primary ring-offset-2 border-primary' 
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: preset.code }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              {/* Preview da Cor */}
              {color && (
                <div className='flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200'>
                  <div
                    className='w-10 h-10 rounded-full border-2 border-gray-300'
                    style={{ backgroundColor: colorCode }}
                  />
                  <div>
                    <p className='font-medium'>{color}</p>
                    <p className='text-xs text-gray-500 font-mono'>{colorCode}</p>
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

        {/* Botão Submit */}
        <button 
          type='submit'
          className='w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dull transition-colors mt-6'
        >
          Adicionar Produto
        </button>
      </form>
    </div>
  );
};

export default AddProduct;