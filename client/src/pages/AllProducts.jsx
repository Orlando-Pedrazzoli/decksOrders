import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { categories } from '../assets/assets.js';
import { SEO, BreadcrumbSchema } from '../components/seo';
import seoConfig from '../components/seo/seoConfig';

const AllProducts = () => {
  const { products, searchQuery, fetchProducts, clearSearchQuery } =
    useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products, fetchProducts]);

  useEffect(() => {
    let currentResult = [...products];

    // Apply search filter if search query exists and is a string
    if (
      searchQuery &&
      typeof searchQuery === 'string' &&
      searchQuery.length > 0
    ) {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      currentResult = currentResult.filter(product => {
        // Check if product.name exists and is a string
        const nameMatch =
          product.name && typeof product.name === 'string'
            ? product.name.toLowerCase().includes(lowerCaseSearchQuery)
            : false;

        // Safely check description
        const descriptionMatch =
          product.description && typeof product.description === 'string'
            ? product.description.toLowerCase().includes(lowerCaseSearchQuery)
            : false;

        return nameMatch || descriptionMatch;
      });
    }

    // Apply category filter if categories are selected
    if (selectedCategories.length > 0) {
      currentResult = currentResult.filter(
        product =>
          product.category &&
          typeof product.category === 'string' &&
          selectedCategories.includes(product.category.toLowerCase())
      );
    }

    // Apply in-stock filter
    currentResult = currentResult.filter(product => product.inStock);

    setFilteredProducts([...currentResult].reverse());
  }, [products, searchQuery, selectedCategories]);

  const handleCategoryChange = categoryPath => {
    clearSearchQuery(); // Clears the search term when applying filters
    const lowerCaseCategoryPath = categoryPath.toLowerCase();
    setSelectedCategories(prev =>
      prev.includes(lowerCaseCategoryPath)
        ? prev.filter(c => c !== lowerCaseCategoryPath)
        : [...prev, lowerCaseCategoryPath]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setShowFilterPanel(false);
  };

  return (
    <>
      {/* SEO - Página de todos os produtos */}
      <SEO 
        title={seoConfig.products.title}
        description={seoConfig.products.description}
        url={seoConfig.products.url}
      >
        <BreadcrumbSchema items={[
          { name: 'Home', url: '/' },
          { name: 'Produtos' }
        ]} />
      </SEO>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-10'>
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8'>
          <div className='flex flex-col items-start w-max'>
            <h1 className='text-3xl sm:text-4xl font-bold text-gray-800'>
              Produtos
            </h1>
            <div className='w-full h-1 bg-primary rounded-full mt-2'></div>
          </div>

          <button
            onClick={() => setShowFilterPanel(true)}
            className='sm:hidden mt-6 w-full py-3 px-6 bg-primary text-white font-semibold rounded-lg shadow-md hover:brightness-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          >
            Filtrar Produtos (
            {selectedCategories.length > 0 ? selectedCategories.length : ''})
          </button>
        </div>

        <div className='flex flex-col md:flex-row gap-8'>
          {/* Category Filter Section for Desktop */}
          <div className='hidden sm:block md:w-1/4 lg:w-1/5 flex-shrink-0 bg-white rounded-lg shadow-md p-6 h-max sticky top-24'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>
              Filtrar por Categoria:
            </h3>
            <div className='flex flex-col gap-3'>
              {categories.map(category => (
                <label
                  key={category.path}
                  className='flex items-center space-x-3 cursor-pointer text-gray-700 hover:text-primary transition-colors duration-200'
                >
                  <input
                    type='checkbox'
                    checked={selectedCategories.includes(
                      category.path.toLowerCase()
                    )}
                    onChange={() => handleCategoryChange(category.path)}
                    className='form-checkbox h-5 w-5 text-primary rounded-md border-gray-300 focus:ring-primary transition-colors duration-200'
                  />
                  <span className='text-base'>{category.text}</span>
                </label>
              ))}
            </div>

            {selectedCategories.length > 0 && (
              <button
                onClick={clearAllFilters}
                className='mt-6 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 text-sm w-full'
              >
                Limpar Filtros ({selectedCategories.length})
              </button>
            )}
          </div>

          {/* Filter Panel for Mobile */}
          {showFilterPanel && (
            <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:hidden'>
              <div className='bg-white w-full rounded-t-xl p-6 shadow-lg transform transition-transform duration-300 ease-out translate-y-0'>
                <div className='flex justify-between items-center mb-6 border-b pb-4'>
                  <h3 className='text-2xl font-semibold text-gray-800'>
                    Filtrar Produtos
                  </h3>
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    className='text-gray-500 hover:text-gray-800 transition-colors duration-200'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-8 w-8'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
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
                <div className='flex flex-col gap-4 mb-6'>
                  {categories.map(category => (
                    <label
                      key={category.path}
                      className='flex items-center space-x-3 cursor-pointer text-gray-700 text-lg'
                    >
                      <input
                        type='checkbox'
                        checked={selectedCategories.includes(
                          category.path.toLowerCase()
                        )}
                        onChange={() => handleCategoryChange(category.path)}
                        className='form-checkbox h-6 w-6 text-primary rounded-md border-gray-300 focus:ring-primary transition-colors duration-200'
                      />
                      <span>{category.text}</span>
                    </label>
                  ))}
                </div>
                <div className='flex flex-col gap-3'>
                  {selectedCategories.length > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className='w-full py-3 px-6 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200'
                    >
                      Limpar Filtros ({selectedCategories.length})
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    className='w-full py-3 px-6 bg-primary text-white font-semibold rounded-lg shadow-md hover:brightness-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                  >
                    Ver Produtos
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className='flex-grow'>
            {filteredProducts.length === 0 &&
            (searchQuery || selectedCategories.length > 0) ? (
              <p className='text-gray-500 py-8 text-center text-lg'>
                Nenhum produto encontrado para os filtros selecionados.
              </p>
            ) : filteredProducts.length === 0 ? (
              <p className='text-gray-500 py-8 text-center text-lg'>
                Nenhum produto disponível no momento.
              </p>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6'>
                {filteredProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AllProducts;