import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { getGroupBySlug, getCategoriesByGroup } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

const GroupPage = () => {
  const { group: groupSlug } = useParams();
  const { products, navigate } = useAppContext();

  // Obter dados do grupo
  const group = getGroupBySlug(groupSlug);

  // Obter categorias deste grupo (para filtrar produtos)
  const groupCategories = getCategoriesByGroup(groupSlug);
  const groupCategoryPaths = groupCategories.map(cat => cat.path.toLowerCase());

  // Filtrar produtos deste grupo e ordenar (disponíveis primeiro, esgotados no final)
  const groupProducts = useMemo(() => {
    const filtered = products.filter(product => {
      // Filtrar por group do produto (se existir)
      if (product.group && product.group === groupSlug) {
        // Apenas variantes principais
        return product.isMainVariant !== false;
      }
      
      // Fallback: filtrar por categoria (para produtos antigos sem group)
      const productCategory = (product.category || '').toLowerCase();
      if (groupCategoryPaths.includes(productCategory)) {
        return product.isMainVariant !== false;
      }
      
      return false;
    });

    // Ordenar: produtos disponíveis primeiro, esgotados no final
    // Usa a mesma lógica do ProductCard: isInactive = !inStock || stock <= 0
    return filtered.sort((a, b) => {
      const aIsInactive = !a.inStock || (a.stock || 0) <= 0;
      const bIsInactive = !b.inStock || (b.stock || 0) <= 0;
      
      // Se a está inativo e b não, a vai para o final (retorna 1)
      // Se b está inativo e a não, b vai para o final (retorna -1)
      // Se ambos iguais, mantém ordem (retorna 0)
      if (aIsInactive && !bIsInactive) return 1;
      if (!aIsInactive && bIsInactive) return -1;
      return 0;
    });
  }, [products, groupSlug, groupCategoryPaths]);

  // Se grupo não existe, mostrar erro
  if (!group) {
    return (
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
    );
  }

  return (
    <div className='min-h-screen'>
      {/* Banner Hero */}
      <div className='relative h-[40vh] md:h-[50vh] overflow-hidden'>
        <img
          src={group.bannerImage}
          alt={group.name}
          className='w-full h-full object-cover'
        />
        {/* Overlay */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20' />
        
        {/* Conteúdo do Banner */}
        <div className='absolute inset-0 flex flex-col justify-end pb-10 md:pb-16 px-6 md:px-16 lg:px-24 xl:px-32'>
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='flex items-center gap-2 text-white/80 text-sm mb-4'
          >
            <Link to='/' className='hover:text-white transition-colors'>Home</Link>
            <span>/</span>
            <span className='text-white'>{group.name}</span>
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className='text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-wide'
          >
            {group.name}
          </motion.h1>

          {/* Descrição */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='text-white/90 text-base md:text-lg max-w-2xl mt-4'
          >
            {group.description}
          </motion.p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className='px-6 md:px-16 lg:px-24 xl:px-32 py-8'>
        {/* Voltar Button + Contagem */}
        <div className='flex items-center justify-between mb-8'>
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

        {/* Grid de Produtos */}
        {groupProducts.length === 0 ? (
          <div className='text-center py-16 bg-gray-50 rounded-lg'>
            <p className='text-gray-500 text-lg mb-4'>
              Ainda não há produtos nesta coleção.
            </p>
            <Link 
              to='/products'
              className='inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dull transition-colors'
            >
              Ver Todos os Produtos
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6'>
            {groupProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupPage;