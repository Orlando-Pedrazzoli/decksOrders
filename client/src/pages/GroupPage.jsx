import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, SlidersHorizontal, LayoutGrid, Rows3 } from 'lucide-react';
import { getGroupBySlug, getCategoriesByGroup } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { SEO, getCollectionSEO, BreadcrumbSchema, OrganizationSchema, CollectionSchema } from '../components/seo';

const GroupPage = () => {
  const { group: groupSlug } = useParams();
  const { products, navigate } = useAppContext();

  // Estados para filtros e visualização
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [mobileGridCols, setMobileGridCols] = useState(1); // 1 coluna como padrão

  // Obter dados do grupo
  const group = getGroupBySlug(groupSlug);

  // Obter configuração SEO para esta collection
  const seoData = getCollectionSEO(groupSlug);

  // Breadcrumbs para structured data
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: group?.name || groupSlug, url: `/collections/${groupSlug}` }
  ];

  // Obter categorias deste grupo (para filtros)
  const groupCategories = getCategoriesByGroup(groupSlug);
  const groupCategoryPaths = groupCategories.map(cat => cat.path.toLowerCase());

  // Filtrar produtos deste grupo e aplicar filtros de categoria
  const groupProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Filtrar por group do produto (se existir)
      if (product.group && product.group === groupSlug) {
        return product.isMainVariant !== false;
      }
      
      // Fallback: filtrar por categoria (para produtos antigos sem group)
      const productCategory = (product.category || '').toLowerCase();
      if (groupCategoryPaths.includes(productCategory)) {
        return product.isMainVariant !== false;
      }
      
      return false;
    });

    // Aplicar filtro de categorias selecionadas
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => {
        const productCategory = (product.category || '').toLowerCase();
        return selectedCategories.includes(productCategory);
      });
    }

    // Ordenar: produtos disponíveis primeiro, esgotados no final
    return filtered.sort((a, b) => {
      const aIsInactive = !a.inStock || (a.stock || 0) <= 0;
      const bIsInactive = !b.inStock || (b.stock || 0) <= 0;
      
      if (aIsInactive && !bIsInactive) return 1;
      if (!aIsInactive && bIsInactive) return -1;
      return 0;
    });
  }, [products, groupSlug, groupCategoryPaths, selectedCategories]);

  // Contar produtos por categoria
  const getCategoryProductCount = (categoryPath) => {
    return products.filter(product => {
      if (product.isMainVariant === false) return false;
      return (product.category || '').toLowerCase() === categoryPath.toLowerCase();
    }).length;
  };

  // Handlers
  const handleCategoryChange = (categoryPath) => {
    const lowerCasePath = categoryPath.toLowerCase();
    setSelectedCategories(prev =>
      prev.includes(lowerCasePath)
        ? prev.filter(c => c !== lowerCasePath)
        : [...prev, lowerCasePath]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setShowFilterPanel(false);
  };

  const totalActiveFilters = selectedCategories.length;

  // Se grupo não existe, mostrar erro
  if (!group) {
    return (
      <>
        <SEO
          title="Coleção não encontrada"
          description="A coleção que procura não existe na Elite Surfing Portugal."
          url={`/collections/${groupSlug}`}
          noindex={true}
        />
        <div className='min-h-[60vh] flex flex-col items-center justify-center px-6'>
          <h1 className='text-2xl font-bold text-gray-800 mb-4'>Coleção não encontrada</h1>
          <p className='text-gray-600 mb-6'>A coleção que procuras não existe.</p>
          <Link 
            to='/'
            className='px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dull transition-colors'
          >
            Voltar à Home
          </Link>
        </div>
      </>
    );
  }

  // Dados da collection para o schema
  const collectionData = {
    name: seoData.title,
    description: seoData.description,
    slug: groupSlug
  };

  // Componente de filtro por categoria (dentro do grupo)
  const FilterSection = ({ isMobile = false }) => (
    <div className='flex flex-col gap-3'>
      {groupCategories.map(category => {
        const isSelected = selectedCategories.includes(category.path.toLowerCase());
        const productCount = getCategoryProductCount(category.path);

        return (
          <label
            key={category.path}
            className='flex items-center cursor-pointer text-gray-700 hover:text-primary transition-colors duration-200'
          >
            <input
              type='checkbox'
              checked={isSelected}
              onChange={() => handleCategoryChange(category.path)}
              className={`form-checkbox ${isMobile ? 'h-6 w-6' : 'h-5 w-5'} text-primary rounded-md border-gray-300 focus:ring-primary transition-colors duration-200`}
            />
            <span className={`ml-3 ${isMobile ? 'text-base' : 'text-sm'} ${isSelected ? 'font-medium text-primary' : ''}`}>
              {category.text}
            </span>
            <span className='ml-2 text-xs text-gray-400'>({productCount})</span>
          </label>
        );
      })}
    </div>
  );

  return (
    <>
      {/* SEO Completo para Collection */}
      <SEO
        title={seoData.title}
        description={seoData.description}
        url={seoData.url}
        image={group.bannerImage || '/og-image.jpg'}
        type="website"
      >
        <OrganizationSchema />
        <BreadcrumbSchema items={breadcrumbItems} />
        <CollectionSchema collection={collectionData} products={groupProducts} />
      </SEO>

      <div className='min-h-screen'>
        {/* Conteúdo */}
        <div className='px-6 md:px-16 lg:px-24 xl:px-32 py-6 md:py-8'>
          
          {/* Breadcrumbs - Mobile apenas */}
          <motion.nav
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='flex sm:hidden items-center gap-2 text-gray-500 text-sm mb-4'
            aria-label="Breadcrumb"
          >
            <Link to='/' className='hover:text-primary transition-colors'>Home</Link>
            <span>/</span>
            <span className='text-gray-800 font-medium' aria-current="page">{group.name}</span>
          </motion.nav>

          {/* Mobile Controls Bar */}
          <div className='flex sm:hidden items-center justify-between mb-4'>
            {/* Botão Filtro - só mostra se há categorias */}
            {groupCategories.length > 1 ? (
              <button
                onClick={() => setShowFilterPanel(true)}
                className='flex items-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200'
              >
                <SlidersHorizontal className='w-4 h-4' />
                <span>Filtro</span>
                {totalActiveFilters > 0 && (
                  <span className='ml-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full'>
                    {totalActiveFilters}
                  </span>
                )}
              </button>
            ) : (
              <div /> 
            )}

            {/* Toggle Visualização 1/2 colunas */}
            <div className='flex items-center gap-1'>
              <button
                onClick={() => setMobileGridCols(1)}
                className={`p-2.5 rounded-lg transition-colors duration-200 ${
                  mobileGridCols === 1 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label='Ver em 1 coluna'
              >
                <Rows3 className='w-5 h-5' />
              </button>
              <button
                onClick={() => setMobileGridCols(2)}
                className={`p-2.5 rounded-lg transition-colors duration-200 ${
                  mobileGridCols === 2 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label='Ver em 2 colunas'
              >
                <LayoutGrid className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* Filter Panel for Mobile - Fullscreen */}
          {showFilterPanel && (
            <div className='fixed inset-0 bg-white z-50 flex flex-col sm:hidden'>
              <div className='flex justify-between items-center p-4 border-b'>
                <h3 className='text-xl font-semibold text-gray-800'>
                  Filtrar {group.name}
                </h3>
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className='p-2 text-gray-500 hover:text-gray-800 transition-colors duration-200'
                >
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>

              <div className='flex-1 overflow-y-auto p-4'>
                <h4 className='text-base font-semibold text-gray-700 mb-4'>Modelos</h4>
                <FilterSection isMobile={true} />
              </div>

              <div className='p-4 border-t bg-white'>
                <div className='flex flex-col gap-3'>
                  {totalActiveFilters > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className='w-full py-3 px-6 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200'
                    >
                      Limpar Filtros ({totalActiveFilters})
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    className='w-full py-3 px-6 bg-primary text-white font-semibold rounded-lg shadow-md hover:brightness-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                  >
                    Ver {groupProducts.length} Produtos
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className='flex flex-col md:flex-row gap-8'>
            {/* Coluna da Esquerda: Breadcrumb + Filtros */}
            {groupCategories.length > 1 && (
              <div className='hidden sm:block md:w-1/4 lg:w-1/5 flex-shrink-0'>
                {/* Breadcrumb - Desktop */}
                <motion.nav
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className='flex items-center gap-2 text-gray-500 text-sm mb-4'
                  aria-label="Breadcrumb"
                >
                  <Link to='/' className='hover:text-primary transition-colors'>Home</Link>
                  <span>/</span>
                  <span className='text-gray-800 font-medium' aria-current="page">{group.name}</span>
                </motion.nav>

                {/* Filtros */}
                <div className='bg-white rounded-lg shadow-md p-6 sticky top-32'>
                  <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                    Filtrar por Modelo
                  </h3>
                  
                  <FilterSection />

                  {totalActiveFilters > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className='mt-6 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 text-sm w-full'
                    >
                      Limpar Filtros ({totalActiveFilters})
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Product Grid */}
            <div className='flex-grow'>
              {/* Desktop: Voltar + Contagem */}
              <div className='hidden sm:flex items-center justify-between mb-6'>
                <button
                  onClick={() => navigate(-1)}
                  className='flex items-center gap-2 text-gray-600 hover:text-primary transition-colors group'
                >
                  <ChevronLeft className='w-5 h-5 transition-transform group-hover:-translate-x-1' />
                  <span>Voltar</span>
                </button>
                
                <p className='text-gray-500 text-sm'>
                  {groupProducts.length} {groupProducts.length === 1 ? 'produto' : 'produtos'}
                </p>
              </div>

              {/* Active Filters Tags */}
              {totalActiveFilters > 0 && (
                <div className='flex flex-wrap gap-2 mb-4'>
                  {selectedCategories.map(catPath => {
                    const category = groupCategories.find(c => c.path.toLowerCase() === catPath);
                    if (!category) return null;
                    return (
                      <span 
                        key={catPath}
                        className='inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full'
                      >
                        {category.text}
                        <button 
                          onClick={() => handleCategoryChange(category.path)}
                          className='ml-1 hover:text-primary-dull'
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Mobile: Contagem de produtos */}
              <p className='sm:hidden text-gray-500 text-sm mb-4'>
                {groupProducts.length} {groupProducts.length === 1 ? 'produto' : 'produtos'}
              </p>

              {groupProducts.length === 0 ? (
                <div className='text-center py-16 bg-gray-50 rounded-lg'>
                  <p className='text-gray-500 text-lg mb-4'>
                    {totalActiveFilters > 0 
                      ? 'Nenhum produto encontrado para os filtros selecionados.'
                      : 'Ainda não há produtos nesta coleção.'
                    }
                  </p>
                  {totalActiveFilters > 0 ? (
                    <button
                      onClick={clearAllFilters}
                      className='inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dull transition-colors'
                    >
                      Limpar Filtros
                    </button>
                  ) : (
                    <Link 
                      to='/products'
                      className='inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dull transition-colors'
                    >
                      Ver Todos os Produtos
                    </Link>
                  )}
                </div>
              ) : (
                <div className={`grid gap-4 md:gap-6 ${
                  mobileGridCols === 1 
                    ? 'grid-cols-1 sm:grid-cols-2' 
                    : 'grid-cols-2'
                } md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4`}>
                  {groupProducts.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <ProductCard 
                        product={product} 
                        largeSwatches={mobileGridCols === 1}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupPage;