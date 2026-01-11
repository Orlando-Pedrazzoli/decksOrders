import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import EditProductModal from '../../components/seller/EditProductModal';

const ProductList = () => {
  const { products, currency, axios, fetchProducts } = useAppContext();
  const [updatingProducts, setUpdatingProducts] = useState(new Set());
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 🆕 Estado para edição rápida de stock
  const [editingStock, setEditingStock] = useState(null);
  const [tempStock, setTempStock] = useState('');

  const toggleStock = async (id, inStock) => {
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

  // 🆕 Atualizar stock rapidamente
  const updateStockQuick = async (productId, variantId = null) => {
    if (!tempStock && tempStock !== '0') {
      toast.error('Digite uma quantidade válida');
      return;
    }

    setUpdatingProducts(prev => new Set(prev).add(productId));

    try {
      const { data } = await axios.post('/api/product/update-stock', {
        id: productId,
        stock: parseInt(tempStock),
        variantId,
      });

      if (data.success) {
        await fetchProducts();
        toast.success('Stock atualizado!');
        setEditingStock(null);
        setTempStock('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao atualizar stock');
    } finally {
      setUpdatingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // 🆕 Calcular stock total do produto
  const getTotalStock = (product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    return product.stock || 0;
  };

  // 🆕 Verificar se tem variantes
  const hasVariants = (product) => {
    return product.variants && product.variants.length > 0;
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      const { data } = await axios.post('/api/product/delete', {
        id: productToDelete._id,
      });

      if (data.success) {
        toast.success(data.message);
        await fetchProducts();
        setProductToDelete(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error(error.response?.data?.message || error.message || 'Erro ao excluir produto');
    } finally {
      setIsDeleting(false);
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
              <span className='text-gray-700'>Em Stock</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 bg-orange-500 rounded-full'></div>
              <span className='text-gray-700'>Stock Baixo (≤3)</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 bg-red-500 rounded-full'></div>
              <span className='text-gray-700'>Esgotado</span>
            </div>
          </div>
        </div>

        <div className='flex flex-col items-center max-w-full w-full overflow-hidden rounded-lg bg-white border border-gray-200 shadow-md'>
          <div className='w-full overflow-x-auto'>
            <table className='w-full table-auto'>
              <thead className='bg-gray-50 text-gray-900 text-sm text-left border-b border-gray-200'>
                <tr>
                  <th className='px-4 py-4 font-semibold whitespace-nowrap'>
                    Produto
                  </th>
                  <th className='px-4 py-4 font-semibold whitespace-nowrap'>
                    Categoria
                  </th>
                  <th className='px-4 py-4 font-semibold whitespace-nowrap hidden md:table-cell'>
                    Preço
                  </th>
                  {/* 🆕 COLUNA DE STOCK */}
                  <th className='px-4 py-4 font-semibold whitespace-nowrap'>
                    Stock
                  </th>
                  <th className='px-4 py-4 font-semibold whitespace-nowrap text-center'>
                    Status
                  </th>
                  <th className='px-4 py-4 font-semibold whitespace-nowrap text-center'>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className='text-sm text-gray-700'>
                {products.map(product => {
                  const isUpdating = updatingProducts.has(product._id);
                  const totalStock = getTotalStock(product);
                  const isOutOfStock = totalStock === 0;
                  const isLowStock = totalStock > 0 && totalStock <= 3;
                  const productHasVariants = hasVariants(product);

                  return (
                    <tr
                      key={product._id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                        isUpdating ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      {/* Produto com imagem e nome */}
                      <td className='px-4 py-3'>
                        <div className='flex items-center space-x-3'>
                          <div className='relative border border-gray-300 rounded-lg p-2 bg-white shadow-sm'>
                            <img
                              src={product.image[0]}
                              alt={product.name}
                              className={`w-16 h-16 object-contain transition-all duration-300 ${
                                isOutOfStock ? 'blur-sm grayscale opacity-60' : ''
                              }`}
                            />
                            {isOutOfStock && (
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
                            {/* 🆕 Indicador de variantes */}
                            {productHasVariants && (
                              <div className='flex items-center gap-1 mt-1'>
                                {product.variants.slice(0, 5).map((v, i) => (
                                  <div
                                    key={i}
                                    className='w-4 h-4 rounded-full border border-gray-300'
                                    style={{ backgroundColor: v.colorCode }}
                                    title={`${v.color}: ${v.stock} un.`}
                                  />
                                ))}
                                {product.variants.length > 5 && (
                                  <span className='text-xs text-gray-400'>
                                    +{product.variants.length - 5}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className='px-4 py-3'>
                        <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 whitespace-nowrap'>
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

                      {/* 🆕 STOCK */}
                      <td className='px-4 py-3'>
                        {editingStock === product._id ? (
                          // Modo de edição
                          <div className='flex items-center gap-2'>
                            <input
                              type='number'
                              min='0'
                              value={tempStock}
                              onChange={e => setTempStock(e.target.value)}
                              className='w-16 py-1 px-2 text-sm border border-gray-300 rounded text-center'
                              autoFocus
                            />
                            <button
                              onClick={() => updateStockQuick(product._id)}
                              className='p-1 text-green-600 hover:bg-green-50 rounded'
                              title='Guardar'
                            >
                              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setEditingStock(null);
                                setTempStock('');
                              }}
                              className='p-1 text-red-600 hover:bg-red-50 rounded'
                              title='Cancelar'
                            >
                              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          // Modo de visualização
                          <div className='flex items-center gap-2'>
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                              isOutOfStock 
                                ? 'bg-red-100 text-red-700'
                                : isLowStock
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-green-100 text-green-700'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${
                                isOutOfStock 
                                  ? 'bg-red-500'
                                  : isLowStock
                                    ? 'bg-orange-500'
                                    : 'bg-green-500'
                              }`}></div>
                              {totalStock} un.
                            </div>
                            
                            {/* Botão de edição rápida (só para produtos sem variantes) */}
                            {!productHasVariants && (
                              <button
                                onClick={() => {
                                  setEditingStock(product._id);
                                  setTempStock(totalStock.toString());
                                }}
                                className='p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded'
                                title='Editar stock'
                              >
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
                                </svg>
                              </button>
                            )}
                            
                            {/* Info de variantes */}
                            {productHasVariants && (
                              <span className='text-xs text-gray-500'>
                                ({product.variants.length} cores)
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Toggle Status */}
                      <td className='px-4 py-3'>
                        <div className='flex items-center justify-center gap-3'>
                          <div className='hidden sm:flex items-center gap-1.5'>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                product.inStock ? 'bg-green-500' : 'bg-red-500'
                              } ${isUpdating ? 'animate-pulse' : ''}`}
                            ></div>
                            <span
                              className={`text-xs font-medium whitespace-nowrap ${
                                product.inStock ? 'text-green-700' : 'text-red-700'
                              }`}
                            >
                              {product.inStock ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>

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
                                product.inStock
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
                                product.inStock ? 'translate-x-6' : 'translate-x-0'
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
                              ) : product.inStock ? (
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

                      {/* Ações */}
                      <td className='px-4 py-3'>
                        <div className='flex items-center justify-center gap-2'>
                          <button
                            onClick={() => setProductToEdit(product)}
                            className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group'
                            title='Editar produto'
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                            </svg>
                          </button>

                          <button
                            onClick={() => setProductToDelete(product)}
                            className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group'
                            title='Excluir produto'
                          >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mensagem quando não há produtos */}
          {products.length === 0 && (
            <div className='py-12 text-center text-gray-500'>
              <svg className='w-16 h-16 mx-auto mb-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
              </svg>
              <p className='text-lg font-medium'>Nenhum produto encontrado</p>
              <p className='text-sm mt-1'>Adicione produtos para começar a gerir o seu inventário</p>
            </div>
          )}
        </div>

        {/* 🆕 ESTATÍSTICAS ATUALIZADAS */}
        <div className='mt-6 grid grid-cols-2 md:grid-cols-5 gap-4'>
          <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
            <p className='text-sm text-gray-600'>Total de Produtos</p>
            <p className='text-2xl font-bold text-gray-900 mt-1'>
              {products.length}
            </p>
          </div>
          <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
            <p className='text-sm text-gray-600'>Em Stock</p>
            <p className='text-2xl font-bold text-green-600 mt-1'>
              {products.filter(p => getTotalStock(p) > 0).length}
            </p>
          </div>
          <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
            <p className='text-sm text-gray-600'>Stock Baixo</p>
            <p className='text-2xl font-bold text-orange-600 mt-1'>
              {products.filter(p => {
                const stock = getTotalStock(p);
                return stock > 0 && stock <= 3;
              }).length}
            </p>
          </div>
          <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
            <p className='text-sm text-gray-600'>Esgotados</p>
            <p className='text-2xl font-bold text-red-600 mt-1'>
              {products.filter(p => getTotalStock(p) === 0).length}
            </p>
          </div>
          <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
            <p className='text-sm text-gray-600'>Stock Total</p>
            <p className='text-2xl font-bold text-primary mt-1'>
              {products.reduce((sum, p) => sum + getTotalStock(p), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {productToEdit && (
        <EditProductModal
          product={productToEdit}
          onClose={() => setProductToEdit(null)}
          onSuccess={fetchProducts}
          axios={axios}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      {productToDelete && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
            <div className='flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4'>
              <svg className='w-6 h-6 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
              </svg>
            </div>

            <h3 className='text-lg font-bold text-gray-900 text-center mb-2'>
              Excluir Produto?
            </h3>
            <p className='text-sm text-gray-600 text-center mb-6'>
              Tem certeza que deseja excluir "{productToDelete.name}"? Esta ação não pode ser desfeita e todas as imagens serão removidas permanentemente.
            </p>

            <div className='flex items-center gap-3'>
              <button
                onClick={() => setProductToDelete(null)}
                className='flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300 transition-colors'
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className='flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className='animate-spin h-5 w-5 text-white' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                    </svg>
                    Excluindo...
                  </>
                ) : (
                  'Excluir Permanentemente'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;