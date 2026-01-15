import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { SEO, BreadcrumbSchema } from '../components/seo';
import { getCategorySEO } from '../components/seo/seoConfig';

const ProductCategory = () => {
  const { category } = useParams();
  const { products, fetchProducts } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Obter configuração SEO para esta categoria
  const categorySEO = getCategorySEO(category);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products, fetchProducts]);

  useEffect(() => {
    if (products.length > 0 && category) {
      const categoryLower = category.toLowerCase();
      const filtered = products.filter(product => {
        // Filtrar por categoria
        const productCategory = (product.category || '').toLowerCase();
        if (productCategory !== categoryLower) return false;
        
        // Apenas produtos em stock
        if (!product.inStock) return false;
        
        // Apenas variantes principais
        if (product.isMainVariant === false) return false;
        
        return true;
      });
      
      setFilteredProducts(filtered);
    }
  }, [products, category]);

  // Formatar nome da categoria para exibição
  const formatCategoryName = (cat) => {
    if (!cat) return '';
    return cat
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const displayName = formatCategoryName(category);

  return (
    <>
      {/* SEO - URL deve ser /products/categoria (sem trailing slash) */}
      <SEO 
        title={categorySEO.title}
        description={categorySEO.description}
        url={categorySEO.url}
      >
        <BreadcrumbSchema items={[
          { name: 'Home', url: '/' },
          { name: 'Produtos', url: '/products' },
          { name: displayName }
        ]} />
      </SEO>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-10'>
        {/* Header */}
        <div className='flex flex-col items-start w-max mb-8'>
          <h1 className='text-3xl sm:text-4xl font-bold text-gray-800'>
            {displayName}
          </h1>
          <div className='w-full h-1 bg-primary rounded-full mt-2'></div>
        </div>

        {/* Descrição da categoria */}
        <p className='text-gray-600 mb-8 max-w-3xl'>
          {categorySEO.description}
        </p>

        {/* Grid de produtos */}
        {filteredProducts.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg'>
              Nenhum produto disponível nesta categoria no momento.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6'>
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ProductCategory;