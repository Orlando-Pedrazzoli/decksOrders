import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useParams } from 'react-router-dom';
import { categories } from '../assets/assets';
import ProductCard from '../components/ProductCard';
import { SEO, BreadcrumbSchema } from '../components/seo';
import { categoryDescriptions } from '../components/seo/seoConfig';

const ProductCategory = () => {
  const { products } = useAppContext();
  const { category } = useParams();

  const searchCategory = categories.find(
    item => item.path.toLowerCase() === category
  );

  const filteredProducts = products.filter(
    product => product.category.toLowerCase() === category
  );

  // Create a reversed copy of the filtered products array
  const reversedProducts = [...filteredProducts].reverse();

  // Obter informações SEO da categoria
  const catInfo = categoryDescriptions[category?.toLowerCase()] || {
    title: `Produtos ${searchCategory?.text || category}`,
    description: `Equipamento de surf - ${searchCategory?.text || category}. Compre na Elite Surfing Portugal com envio rápido.`
  };

  return (
    <>
      {/* SEO - Página de categoria */}
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
          <div className='flex flex-col items-end w-max'>
            <p className='text-2xl font-medium'>
              {searchCategory.text.toUpperCase()}
            </p>
            <div className='w-16 h-0.2 bg-primary rounded-full'></div>
          </div>
        )}

        {filteredProducts.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6'>
            {reversedProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className='flex items-center justify-center h-[60vh]'>
            <p className='text-2xl font-medium text-primary'>
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductCategory;