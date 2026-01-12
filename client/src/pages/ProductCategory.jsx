import React, { useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useParams } from 'react-router-dom';
import { categories } from '../assets/assets';
import ProductCard from '../components/ProductCard';
import { SEO, BreadcrumbSchema } from '../components/seo';
import { categoryDescriptions } from '../components/seo/seoConfig';

const ProductCategory = () => {
  const { products, fetchProducts } = useAppContext();
  const { category } = useParams();

  // 🆕 Re-fetch produtos quando a categoria muda (garante sincronização)
  useEffect(() => {
    // Buscar produtos atualizados ao entrar na categoria
    fetchProducts();
  }, [category]);

  // Encontrar informação da categoria
  const searchCategory = categories.find(
    item => item.path.toLowerCase() === category
  );

  // 🆕 Filtrar produtos: mesma categoria + é principal (isMainVariant) + em stock
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = product.category?.toLowerCase() === category;
      const isMainVariant = product.isMainVariant !== false;
      const isInStock = product.inStock;
      
      return matchesCategory && isMainVariant && isInStock;
    });
  }, [products, category]);

  // Ordenar: mais recentes primeiro
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].reverse();
  }, [filteredProducts]);

  // 🆕 Contar total de variantes (para mostrar info)
  const totalVariants = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = product.category?.toLowerCase() === category;
      const isVariant = product.isMainVariant === false;
      return matchesCategory && isVariant;
    }).length;
  }, [products, category]);

  // SEO
  const catInfo = categoryDescriptions[category?.toLowerCase()] || {
    title: `Produtos ${searchCategory?.text || category}`,
    description: `Equipamento de surf - ${searchCategory?.text || category}. Compre na Elite Surfing Portugal com envio rápido.`
  };

  return (
    <>
      <SEO 
        title={catInfo.title}
        description={catInfo.description}
        url={`/products/${category}`}
      >
        <BreadcrumbSchema items={[
          { name: 'Home', url: '/' },
          { name: 'Produtos', url: '/products' },
          { name: searchCategory?.text || category }
        ]} />
      </SEO>

      <div className='mt-16'>
        {searchCategory && (
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
            <div className='flex flex-col items-start'>
              <p className='text-2xl font-medium'>
                {searchCategory.text.toUpperCase()}
              </p>
              <div className='w-16 h-0.5 bg-primary rounded-full mt-1'></div>
            </div>
            
            {/* 🆕 Contagem de produtos */}
            <div className='text-sm text-gray-500'>
              {sortedProducts.length} {sortedProducts.length === 1 ? 'produto' : 'produtos'}
              {totalVariants > 0 && (
                <span className='ml-2 text-gray-400'>
                  ({totalVariants} {totalVariants === 1 ? 'variante' : 'variantes'} de cor)
                </span>
              )}
            </div>
          </div>
        )}

        {sortedProducts.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6'>
            {sortedProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-[50vh] text-center'>
            <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
              <svg className='w-12 h-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' />
              </svg>
            </div>
            <p className='text-xl font-medium text-gray-600 mb-2'>
              Nenhum produto encontrado
            </p>
            <p className='text-gray-500'>
              Ainda não temos produtos nesta categoria.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductCategory;