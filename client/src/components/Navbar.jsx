import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Lock } from 'lucide-react'; // ✅ NOVO: Ícone de cadeado
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [localSearchInput, setLocalSearchInput] = useState('');

  const {
    user,
    setShowUserLogin,
    navigate,
    setSearchQuery,
    searchQuery,
    getCartCount,
    logoutUser,
    isSeller, // ✅ NOVO: Verificar se é seller
  } = useAppContext();

  // Sync with global search query
  useEffect(() => {
    if (typeof searchQuery === 'string') {
      setLocalSearchInput(searchQuery);
    }
  }, [searchQuery]);

  // ✅ Limpar search quando navegar para rotas específicas
  useEffect(() => {
    const currentPath = window.location.pathname;

    if (currentPath !== '/products' && !currentPath.startsWith('/products/')) {
      if (searchQuery && searchQuery.length > 0) {
        setSearchQuery('');
        setLocalSearchInput('');
      }
    } else if (
      currentPath.includes('/products/') &&
      currentPath.split('/').length > 2
    ) {
      if (searchQuery && searchQuery.length > 0) {
        setSearchQuery('');
        setLocalSearchInput('');
      }
    }
  }, [window.location.pathname]);

  // Navigate to products when search query changes
  useEffect(() => {
    if (searchQuery && searchQuery.length > 0) {
      navigate('/products');
    }
  }, [searchQuery, navigate]);

  const handleLogout = async () => {
    setOpen(false);
    await logoutUser();
  };

  const handleSearch = e => {
    const value = e.target.value;
    setLocalSearchInput(value);
    setSearchQuery(value);
  };

  const handleMobileSearch = e => {
    const value = e.target.value;
    setLocalSearchInput(value);
    setSearchQuery(value);
  };

  const executeMobileSearch = () => {
    if (localSearchInput.trim()) {
      setOpen(false);
      navigate('/products');
    }
  };

  const clearSearch = () => {
    setLocalSearchInput('');
    setSearchQuery('');
  };

  const handleNavLinkClick = path => {
    setOpen(false);
    if (path !== '/products') {
      clearSearch();
    }
    navigate(path);
  };

  // ✅ NOVO: Função para acessar área de admin
  const handleAdminAccess = () => {
    setOpen(false); // Fechar menu mobile se estiver aberto
    navigate('/seller');
  };

  // Render search input consistently
  const renderSearchInput = (isMobile = false) => (
    <div
      className={`flex items-center gap-2 border border-gray-300 px-3 rounded-full relative ${
        isMobile ? 'w-full px-4 py-2' : 'text-sm py-1.5'
      }`}
    >
      <input
        onChange={isMobile ? handleMobileSearch : handleSearch}
        value={localSearchInput}
        className={`w-full bg-transparent outline-none placeholder-gray-500 ${
          isMobile ? 'text-base' : ''
        }`}
        type='text'
        placeholder='Pesquisar produtos'
        onKeyDown={e => {
          if (e.key === 'Enter' && localSearchInput.trim()) {
            if (isMobile) {
              executeMobileSearch();
            } else {
              navigate('/products');
            }
          }
          if (e.key === 'Escape') {
            clearSearch();
          }
        }}
      />

      {localSearchInput.length > 0 ? (
        <button
          onClick={clearSearch}
          className='w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors'
          aria-label='Limpar pesquisa'
        >
          ✕
        </button>
      ) : (
        <img
          src={assets.search_icon}
          alt='search'
          className='w-4 h-4 cursor-pointer opacity-60 hover:opacity-100 transition-opacity'
          onClick={() => {
            if (localSearchInput.trim()) {
              if (isMobile) {
                executeMobileSearch();
              } else {
                navigate('/products');
              }
            }
          }}
        />
      )}
    </div>
  );

  return (
    <nav className='sticky top-0 flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative shadow-sm z-50'>
      <NavLink to='/' onClick={() => setOpen(false)}>
        <img className='h-9' src={assets.logo_es} alt='logo' />
      </NavLink>

      {/* Desktop Navigation */}
      <div className='hidden sm:flex items-center gap-8'>
        <NavLink
          to='/'
          className={({ isActive }) => (isActive ? 'text-primary' : '')}
        >
          Home
        </NavLink>
        <NavLink
          to='/products'
          className={({ isActive }) => (isActive ? 'text-primary' : '')}
        >
          Produtos
        </NavLink>
        <NavLink
          to='/contact'
          className={({ isActive }) => (isActive ? 'text-primary' : '')}
        >
          Contacto
        </NavLink>

        {/* Desktop Search */}
        <div className='hidden lg:flex items-center'>{renderSearchInput()}</div>

        {/* ✅ NOVO: Ícone de Admin (Desktop) */}
        <button
          onClick={handleAdminAccess}
          className='relative group cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-all duration-200'
          title='Área de Administração'
        >
          <Lock className='w-5 h-5 text-gray-600 group-hover:text-primary transition-colors' />
          {/* Tooltip */}
          <span className='absolute hidden group-hover:block top-full mt-2 right-0 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10'>
            Admin
          </span>
          {/* Badge para sellers autenticados */}
          {isSeller && (
            <span className='absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white'></span>
          )}
        </button>

        {/* Desktop Cart Icon */}
        <div
          onClick={() => navigate('/cart')}
          className='relative cursor-pointer'
        >
          <img
            src={assets.nav_cart_icon}
            alt='cart'
            className='w-6 opacity-80'
          />
          <button className='absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full'>
            {getCartCount()}
          </button>
        </div>

        {/* Desktop User Login/Profile */}
        {!user ? (
          <button
            onClick={() => setShowUserLogin(true)}
            className='cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full'
          >
            Login
          </button>
        ) : (
          <div className='relative group flex flex-col items-center'>
            <img src={assets.profile_icon} className='w-10' alt='profile' />
            <span className='text-xs text-gray-600 mt-1 max-w-20 truncate'>
              {user.name}
            </span>
            <ul className='hidden group-hover:block absolute top-12 right-0 bg-white shadow-lg border border-gray-200 py-2.5 w-44 rounded-md text-sm z-40 transition-all duration-200'>
              <li
                onClick={() => navigate('/my-orders')}
                className='p-3 pl-4 hover:bg-primary/10 cursor-pointer flex items-center gap-2 transition-colors duration-200'
              >
                <span className='text-primary'>📦</span>
                Os meus Pedidos
              </li>
              <li
                onClick={() => navigate('/write-review')}
                className='p-3 pl-4 hover:bg-primary/10 cursor-pointer flex items-center gap-2 transition-colors duration-200'
              >
                <span className='text-primary'>⭐</span>
                Escrever Reviews
              </li>
              <li
                onClick={handleLogout}
                className='p-3 pl-4 hover:bg-primary/10 cursor-pointer flex items-center gap-2 transition-colors duration-200 border-t border-gray-100 mt-1'
              >
                <span className='text-red-500'>🚪</span>
                Sair
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Mobile-specific elements */}
      <div className='flex items-center gap-4 sm:hidden'>
        {/* ✅ NOVO: Ícone de Admin (Mobile) */}
        <button
          onClick={handleAdminAccess}
          className='relative p-1.5 hover:bg-gray-100 rounded-lg transition-all duration-200'
          aria-label='Área de Administração'
        >
          <Lock className='w-5 h-5 text-gray-600' />
          {isSeller && (
            <span className='absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white'></span>
          )}
        </button>

        {/* Mobile Cart Icon */}
        <div
          onClick={() => navigate('/cart')}
          className='relative cursor-pointer'
        >
          <img
            src={assets.nav_cart_icon}
            alt='cart'
            className='w-6 opacity-80'
          />
          <button className='absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full'>
            {getCartCount()}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setOpen(!open)}
          aria-label='Menu'
          className='focus:outline-none'
        >
          <img src={assets.menu_icon} alt='menu' className='w-7 h-7' />
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {open && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden transition-opacity duration-300'
          onClick={() => setOpen(false)}
        >
          <div
            className='absolute top-0 right-0 h-full w-3/4 sm:w-1/2 bg-white shadow-lg p-6 flex flex-col items-start gap-6 transition-transform duration-300 ease-out transform translate-x-0'
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className='self-end text-gray-500 hover:text-gray-800 transition-colors duration-200'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-7 w-7'
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

            {/* Mobile Search Input */}
            <div className='w-full mb-4'>{renderSearchInput(true)}</div>

            <NavLink
              to='/'
              className={({ isActive }) =>
                `block w-full text-left py-2 text-gray-700 hover:text-primary transition-colors duration-200 text-lg font-medium border-b border-gray-100 ${
                  isActive ? 'text-primary' : ''
                }`
              }
              onClick={() => handleNavLinkClick('/')}
            >
              Home
            </NavLink>
            <NavLink
              to='/products'
              className={({ isActive }) =>
                `block w-full text-left py-2 text-gray-700 hover:text-primary transition-colors duration-200 text-lg font-medium border-b border-gray-100 ${
                  isActive ? 'text-primary' : ''
                }`
              }
              onClick={() => handleNavLinkClick('/products')}
            >
              Produtos
            </NavLink>
            <NavLink
              to='/contact'
              className={({ isActive }) =>
                `block w-full text-left py-2 text-gray-700 hover:text-primary transition-colors duration-200 text-lg font-medium border-b border-gray-100 ${
                  isActive ? 'text-primary' : ''
                }`
              }
              onClick={() => handleNavLinkClick('/contact')}
            >
              Contacto
            </NavLink>

            {/* ✅ NOVO: Link Admin no menu mobile */}
            <button
              onClick={handleAdminAccess}
              className='flex items-center gap-2 w-full text-left py-2 text-gray-700 hover:text-primary transition-colors duration-200 text-lg font-medium border-b border-gray-100'
            >
              <Lock className='w-5 h-5' />
              <span>Área Admin</span>
              {isSeller && (
                <span className='ml-auto text-xs bg-green-500 text-white px-2 py-0.5 rounded-full'>
                  Autenticado
                </span>
              )}
            </button>

            {/* Mobile User Profile / Login / Logout */}
            {user ? (
              <>
                <div className='w-full p-3 bg-primary/5 rounded-lg border border-primary/20 mb-2'>
                  <div className='flex items-center gap-3'>
                    <img
                      src={assets.profile_icon}
                      className='w-8 h-8'
                      alt='profile'
                    />
                    <div>
                      <p className='font-semibold text-gray-800 text-base'>
                        Olá, {user.name}!
                      </p>
                      <p className='text-xs text-gray-500'>Usuário logado</p>
                    </div>
                  </div>
                </div>

                <NavLink
                  to='/my-orders'
                  className={({ isActive }) =>
                    `block w-full text-left py-2 text-gray-700 hover:text-primary transition-colors duration-200 text-lg font-medium border-b border-gray-100 ${
                      isActive ? 'text-primary' : ''
                    }`
                  }
                  onClick={() => handleNavLinkClick('/my-orders')}
                >
                  📦 Os meus Pedidos
                </NavLink>
                <NavLink
                  to='/write-review'
                  className={({ isActive }) =>
                    `block w-full text-left py-2 text-gray-700 hover:text-primary transition-colors duration-200 text-lg font-medium border-b border-gray-100 ${
                      isActive ? 'text-primary' : ''
                    }`
                  }
                  onClick={() => handleNavLinkClick('/write-review')}
                >
                  ⭐ Escrever Reviews
                </NavLink>
                <button
                  onClick={handleLogout}
                  className='w-full cursor-pointer px-6 py-3 mt-4 bg-primary hover:bg-primary-dull transition text-white rounded-lg text-base font-semibold flex items-center justify-center gap-2'
                >
                  🚪 Sair
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  setShowUserLogin(true);
                }}
                className='w-full cursor-pointer px-6 py-3 mt-4 bg-primary hover:bg-primary-dull transition text-white rounded-lg text-base font-semibold'
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;