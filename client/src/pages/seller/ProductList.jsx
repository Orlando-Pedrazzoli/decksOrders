import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ProductList = () => {
  const { products, currency, axios, fetchProducts } = useAppContext();
  const [updatingProducts, setUpdatingProducts] = useState(new Set());

  const toggleStock = async (id, inStock) => {
    // Prevenir cliques múltiplos
    if (updatingProducts.has(id)) return;

    setUpdatingProducts(prev => new Set(prev).add(id));

    try {
      const { data } = await axios.post('/api/product/stock', { id, inStock });
      if (data.success) {
        await fetchProducts();
        toast.success(
          inStock ? 'Produto ativado com sucesso!' : 'Produto desativado'
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao atualizar o produto');
    } finally {
      setUpdatingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  return (
    <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between'>
      <div className='w-full md:p-10 p-4'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-gray-800'>
            Gestão de Produtos
          </h2>
          <div className='text-sm text-gray-600'>
            Total: <span className='font-semibold'>{products.length}</span>{' '}
            produtos
          </div>
        </div>

        {/* Legenda dos status */}
        <div className='mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200'>
          <div className='flex flex-wrap gap-4 text-sm'>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 bg-green-500 rounded-full'></div>
              <span className='text-gray-700'>Ativo</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 bg-red-500 rounded-full'></div>
              <span className='text-gray-700'>Inativo</span>
            </div>
          </div>
        </div>

        <div className='flex flex-col items-center max-w-6xl w-full overflow-hidden rounded-lg bg-white border border-gray-200 shadow-md'>
          <table className='md:table-auto table-fixed w-full overflow-hidden'>
            <thead className='bg-gray-50 text-gray-900 text-sm text-left border-b border-gray-200'>
              <tr>
                <th className='px-4 py-4 font-semibold truncate'>Produto</th>
                <th className='px-4 py-4 font-semibold truncate'>Categoria</th>
                <th className='px-4 py-4 font-semibold truncate hidden md:table-cell'>
                  Preço
                </th>
                <th className='px-4 py-4 font-semibold truncate text-center'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className='text-sm text-gray-700'>
              {products.map(product => {
                const isUpdating = updatingProducts.has(product._id);
                const isActive = product.inStock;

                return (
                  <tr
                    key={product._id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                      isUpdating ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {/* Produto com imagem e nome */}
                    <td className='md:px-4 pl-2 md:pl-4 py-3'>
                      <div className='flex items-center space-x-3'>
                        <div className='relative border border-gray-300 rounded-lg p-2 bg-white shadow-sm'>
                          <img
                            src={product.image[0]}
                            alt={product.name}
                            className={`w-16 h-16 object-contain transition-all duration-300 ${
                              !isActive ? 'blur-sm grayscale opacity-60' : ''
                            }`}
                          />
                          {!isActive && (
                            <div className='absolute inset-0 flex items-center justify-center'>
                              <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></div>
                            </div>
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium text-gray-900 truncate'>
                            {product.name}
                          </p>
                          <p className='text-xs text-gray-500 truncate mt-1'>
                            ID: {product._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Categoria */}
                    <td className='px-4 py-3'>
                      <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20'>
                        {product.category}
                      </span>
                    </td>

                    {/* Preço */}
                    <td className='px-4 py-3 hidden md:table-cell'>
                      <div className='space-y-1'>
                        <p className='font-semibold text-gray-900'>
                          {currency} {product.offerPrice.toFixed(2)}
                        </p>
                        {product.offerPrice < product.price && (
                          <p className='text-xs text-gray-500 line-through'>
                            {currency} {product.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Toggle Status com design melhorado */}
                    <td className='px-4 py-3'>
                      <div className='flex items-center justify-center gap-3'>
                        {/* Status badge */}
                        <div className='hidden sm:flex items-center gap-1.5'>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isActive ? 'bg-green-500' : 'bg-red-500'
                            } ${isUpdating ? 'animate-pulse' : ''}`}
                          ></div>
                          <span
                            className={`text-xs font-medium ${
                              isActive ? 'text-green-700' : 'text-red-700'
                            }`}
                          >
                            {isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>

                        {/* Toggle switch */}
                        <label className='relative inline-flex items-center cursor-pointer group'>
                          <input
                            onClick={() =>
                              toggleStock(product._id, !product.inStock)
                            }
                            checked={product.inStock}
                            disabled={isUpdating}
                            type='checkbox'
                            className='sr-only peer'
                          />
                          <div
                            className={`w-14 h-8 rounded-full transition-all duration-300 ${
                              isActive
                                ? 'bg-green-500 shadow-green-500/50'
                                : 'bg-red-400 shadow-red-400/50'
                            } ${
                              isUpdating
                                ? 'opacity-50 cursor-not-allowed'
                                : 'peer-hover:shadow-lg'
                            }`}
                          ></div>
                          <span
                            className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out flex items-center justify-center ${
                              isActive ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          >
                            {isUpdating ? (
                              <svg
                                className='w-3 h-3 animate-spin text-gray-600'
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
                            ) : isActive ? (
                              <svg
                                className='w-3 h-3 text-green-600'
                                fill='currentColor'
                                viewBox='0 0 20 20'
                              >
                                <path
                                  fillRule='evenodd'
                                  d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                  clipRule='evenodd'
                                />
                              </svg>
                            ) : (
                              <svg
                                className='w-3 h-3 text-red-600'
                                fill='currentColor'
                                viewBox='0 0 20 20'
                              >
                                <path
                                  fillRule='evenodd'
                                  d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                                  clipRule='evenodd'
                                />
                              </svg>
                            )}
                          </span>
                        </label>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mensagem quando não há produtos */}
          {products.length === 0 && (
            <div className='py-12 text-center text-gray-500'>
              <svg
                className='w-16 h-16 mx-auto mb-4 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
                />
              </svg>
              <p className='text-lg font-medium'>Nenhum produto encontrado</p>
              <p className='text-sm mt-1'>
                Adicione produtos para começar a gerir o seu inventário
              </p>
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className='mt-6 grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
            <p className='text-sm text-gray-600'>Total de Produtos</p>
            <p className='text-2xl font-bold text-gray-900 mt-1'>
              {products.length}
            </p>
          </div>
          <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
            <p className='text-sm text-gray-600'>Produtos Ativos</p>
            <p className='text-2xl font-bold text-green-600 mt-1'>
              {products.filter(p => p.inStock).length}
            </p>
          </div>
          <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
            <p className='text-sm text-gray-600'>Produtos Inativos</p>
            <p className='text-2xl font-bold text-red-600 mt-1'>
              {products.filter(p => !p.inStock).length}
            </p>
          </div>
          <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
            <p className='text-sm text-gray-600'>Taxa de Disponibilidade</p>
            <p className='text-2xl font-bold text-primary mt-1'>
              {products.length > 0
                ? Math.round(
                    (products.filter(p => p.inStock).length /
                      products.length) *
                      100
                  )
                : 0}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;