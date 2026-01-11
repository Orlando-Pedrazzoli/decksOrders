import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import EditProductModal from '../../components/seller/EditProductModal';
import toast from 'react-hot-toast';

const ProductList = () => {
  const { axios, products, fetchProducts, currency } = useAppContext();
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('all'); // all, inStock, lowStock, outOfStock
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name, price, stock

  // Filtrar e ordenar produtos
  const filteredProducts = products
    .filter(product => {
      // Filtro de texto
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtro de stock
      const stock = product.stock || 0;
      switch (filter) {
        case 'inStock':
          return stock > 3;
        case 'lowStock':
          return stock > 0 && stock <= 3;
        case 'outOfStock':
          return stock === 0;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return b.offerPrice - a.offerPrice;
        case 'stock':
          return (b.stock || 0) - (a.stock || 0);
        default: // newest
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  // Estatísticas
  const stats = {
    total: products.length,
    inStock: products.filter(p => (p.stock || 0) > 0).length,
    lowStock: products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 3).length,
    outOfStock: products.filter(p => (p.stock || 0) === 0).length,
    totalStock: products.reduce((sum, p) => sum + (p.stock || 0), 0),
  };

  // Handlers
  const handleDelete = async (productId) => {
    try {
      const { data } = await axios.post('/api/product/delete', { id: productId });
      
      if (data.success) {
        toast.success('Produto eliminado com sucesso');
        fetchProducts();
        setDeleteConfirm(null);
      } else {
        toast.error(data.message || 'Erro ao eliminar produto');
      }
    } catch (error) {
      toast.error('Erro ao eliminar produto');
    }
  };

  const handleStockUpdate = async (productId, newStock) => {
    try {
      const { data } = await axios.post('/api/product/update-stock', {
        productId,
        stock: parseInt(newStock) || 0,
      });
      
      if (data.success) {
        toast.success('Stock atualizado');
        fetchProducts();
      } else {
        toast.error(data.message || 'Erro ao atualizar stock');
      }
    } catch (error) {
      toast.error('Erro ao atualizar stock');
    }
  };

  const handleProductUpdate = () => {
    fetchProducts();
    setEditingProduct(null);
  };

  // Renderizar badge de stock
  const renderStockBadge = (stock) => {
    if (stock === 0) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
          Esgotado
        </span>
      );
    }
    if (stock <= 3) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
          Stock Baixo ({stock})
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
        Em Stock ({stock})
      </span>
    );
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Produtos</h1>
          
          <a
            href="/seller/add-product"
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dull transition-colors"
          >
            + Adicionar Produto
          </a>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Em Stock</p>
            <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Stock Baixo</p>
            <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Esgotados</p>
            <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Stock Total</p>
            <p className="text-2xl font-bold text-primary">{stats.totalStock}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Pesquisar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="all">Todos</option>
              <option value="inStock">Em Stock</option>
              <option value="lowStock">Stock Baixo</option>
              <option value="outOfStock">Esgotados</option>
            </select>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="newest">Mais Recentes</option>
              <option value="oldest">Mais Antigos</option>
              <option value="name">Nome A-Z</option>
              <option value="price">Maior Preço</option>
              <option value="stock">Maior Stock</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Produto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Preço
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Família/Cor
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    {/* Produto */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image?.[0]}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {product._id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Categoria */}
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{product.category}</span>
                    </td>
                    
                    {/* Preço */}
                    <td className="px-4 py-4">
                      <div>
                        <span className="font-medium text-gray-900">
                          {product.offerPrice?.toFixed(2)} {currency}
                        </span>
                        {product.price !== product.offerPrice && (
                          <span className="text-xs text-gray-400 line-through ml-2">
                            {product.price?.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* Stock */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {renderStockBadge(product.stock || 0)}
                        <input
                          type="number"
                          min="0"
                          value={product.stock || 0}
                          onChange={(e) => handleStockUpdate(product._id, e.target.value)}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-primary"
                        />
                      </div>
                    </td>
                    
                    {/* Família/Cor */}
                    <td className="px-4 py-4">
                      {product.productFamily ? (
                        <div className="flex items-center gap-2">
                          {product.colorCode && (
                            <div
                              className="w-5 h-5 rounded-full border border-gray-300"
                              style={{ backgroundColor: product.colorCode }}
                              title={product.color}
                            />
                          )}
                          <div className="text-xs">
                            <p className="text-gray-600">{product.productFamily}</p>
                            {product.color && (
                              <p className="text-gray-400">{product.color}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    
                    {/* Ações */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product._id)}
                          className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {filteredProducts.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              {searchTerm || filter !== 'all'
                ? 'Nenhum produto encontrado com estes filtros'
                : 'Nenhum produto cadastrado'}
            </div>
          )}
        </div>

        {/* Pagination info */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          A mostrar {filteredProducts.length} de {products.length} produtos
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdate={handleProductUpdate}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar Eliminação
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja eliminar este produto? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;