import React, { useState, useEffect } from 'react';
import { assets, categories } from '../../assets/assets';
import toast from 'react-hot-toast';

const EditProductModal = ({ product, onClose, onSuccess, axios }) => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description.join('\n'));
      setCategory(product.category);
      setPrice(product.price.toString());
      setOfferPrice(product.offerPrice.toString());
    }
  }, [product]);

  const handleSubmit = async event => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        name,
        description: description.split('\n'),
        category,
        price: parseFloat(price),
        offerPrice: parseFloat(offerPrice),
      };

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
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
          <h2 className='text-xl font-bold text-gray-800'>Editar Produto</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 transition-colors'
            disabled={isSubmitting}
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
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
                    />
                    <div className='relative'>
                      <img
                        className='max-w-24 cursor-pointer border border-gray-300 rounded-lg p-2'
                        src={
                          files[index]
                            ? URL.createObjectURL(files[index])
                            : assets.upload_area
                        }
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

          {/* Product Description */}
          <div className='flex flex-col gap-1'>
            <label
              className='text-base font-medium'
              htmlFor='product-description'
            >
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

          {/* Category */}
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

          {/* Prices */}
          <div className='flex items-center gap-5 flex-wrap'>
            <div className='flex-1 flex flex-col gap-1 min-w-[120px]'>
              <label className='text-base font-medium' htmlFor='product-price'>
                Preço Original
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
                Preço de Oferta
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
                  <svg
                    className='animate-spin h-5 w-5 text-white'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                      fill='none'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
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