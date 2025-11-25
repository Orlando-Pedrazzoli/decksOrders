import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Lock, LogOut } from 'lucide-react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';

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
    logoutSeller,
    isSeller,
    setShowCartSidebar,
  } = useAppContext();

  useEffect(() => {
    if (typeof searchQuery === 'string') {
      setLocalSearchInput(searchQuery);
    }
  }, [searchQuery]);

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

  useEffect(() => {
    if (searchQuery && searchQuery.length > 0) {
      navigate('/products');
    }
  }, [searchQuery, navigate]);

  const handleLogout = async () => {
    setOpen(false);
    await logoutUser();
  };

  const handleSellerLogout = () => {
    setOpen(false);
    logoutSeller();
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

  const handleAdminAccess = () => {
    setOpen(false);
    navigate('/seller');
  };

  // ✅ Abrir Cart Sidebar
  const handleCartClick = () => {
    setShowCartSidebar(true);
  };

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

        <div className='hidden lg:flex items-center'>{renderSearchInput()}</div>

        {/* Admin Icon com Dropdown - Desktop */}
        <div className='relative group'>
          <button
            onClick={handleAdminAccess}
            className='relative group cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-all duration-200'
            title='Área de Administração'
          >
            <Lock className='w-5 h-5 text-gray-600 group-hover:text-primary transition-colors' />
            {isSeller && (
              <span className='absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white'></span>
            )}
          </button>

          {isSeller && (
            <div className='hidden group-hover:block absolute top-full right-0 mt-2 bg-white shadow-lg border border-gray-200 py-2 w-48 rounded-md text-sm z-50'>
              <div className='px-4 py-2 border-b border-gray-100'>
                <p className='font-semibold text-gray-800'>Admin Panel</p>
                <p className='text-xs text-gray-500'>Sessão ativa</p>
              </div>
              <button
                onClick={handleSellerLogout}
                className='w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors'
              >
                <LogOut className='w-4 h-4' />
                Logout Admin
              </button>
            </div>
          )}
        </div>

        {/* Cart Icon - Desktop - ✅ Abre Sidebar */}
        <div
          onClick={handleCartClick}
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

        {/* User Login/Profile - Desktop */}
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
            <ul className='hidden group-hover:block absolute top-12 right-0 bg-white shadow-lg border border-gray-200 py-2.5 w-44 rounded-md text-sm z-40'>
              <li
                onClick={() => navigate('/my-orders')}
                className='p-3 pl-4 hover:bg-primary/10 cursor-pointer flex items-center gap-2'
              >
                <span className='text-primary'>📦</span>
                Os meus Pedidos
              </li>
              <li
                onClick={() => navigate('/write-review')}
                className='p-3 pl-4 hover:bg-primary/10 cursor-pointer flex items-center gap-2'
              >
                <span className='text-primary'>⭐</span>
                Escrever Reviews
              </li>
              <li
                onClick={handleLogout}
                className='p-3 pl-4 hover:bg-primary/10 cursor-pointer flex items-center gap-2 border-t border-gray-100 mt-1'
              >
                <LogOut className='w-4 h-4 text-red-500' />
                <span>Sair</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Mobile - Apenas Cart e Menu */}
      <div className='flex items-center gap-4 sm:hidden'>
        {/* Cart Icon - Mobile - ✅ Abre Sidebar */}
        <div
          onClick={handleCartClick}
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

        {/* Menu Icon - Mobile */}
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
          className='fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden'
          onClick={() => setOpen(false)}
        >
          <div
            className='absolute top-0 right-0 h-full w-3/4 bg-white shadow-lg flex flex-col overflow-hidden'
            onClick={e => e.stopPropagation()}
          >
            {/* Header fixo */}
            <div className='p-6 pb-4 border-b border-gray-100 bg-white'>
              <button
                onClick={() => setOpen(false)}
                className='float-right text-gray-500 hover:text-gray-800 -mt-2'
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
              <div className='clear-both'></div>

              {/* Search no header */}
              <div className='mt-2'>{renderSearchInput(true)}</div>
            </div>

            {/* Conteúdo scrollável */}
            <div className='flex-1 overflow-y-auto p-6 space-y-4'>
              {/* Navegação */}
              <NavLink
                to='/'
                className={({ isActive }) =>
                  `block w-full text-left py-2.5 text-gray-700 hover:text-primary text-base font-medium border-b border-gray-100 ${
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
                  `block w-full text-left py-2.5 text-gray-700 hover:text-primary text-base font-medium border-b border-gray-100 ${
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
                  `block w-full text-left py-2.5 text-gray-700 hover:text-primary text-base font-medium border-b border-gray-100 ${
                    isActive ? 'text-primary' : ''
                  }`
                }
                onClick={() => handleNavLinkClick('/contact')}
              >
                Contacto
              </NavLink>

              {/* Área Admin */}
              <button
                onClick={handleAdminAccess}
                className='flex items-center gap-2 w-full text-left py-2.5 text-gray-700 hover:text-primary text-base font-medium border-b border-gray-100'
              >
                <Lock className='w-5 h-5' />
                <span>Área Admin</span>
                {isSeller && (
                  <span className='ml-auto text-xs bg-green-500 text-white px-2 py-0.5 rounded-full'>
                    Ativo
                  </span>
                )}
              </button>

              {/* Logout Admin */}
              {isSeller && (
                <button
                  onClick={handleSellerLogout}
                  className='flex items-center gap-2 w-full text-left py-2.5 px-3 bg-red-50 text-red-600 hover:bg-red-100 text-base font-medium rounded-lg border border-red-200'
                >
                  <LogOut className='w-5 h-5' />
                  <span>Logout Admin</span>
                </button>
              )}

              {/* User Section */}
              {user ? (
                <>
                  {/* User Info Card */}
                  <div className='w-full p-3 bg-primary/5 rounded-lg border border-primary/20 mt-4'>
                    <div className='flex items-center gap-3'>
                      <img
                        src={assets.profile_icon}
                        className='w-10 h-10'
                        alt='profile'
                      />
                      <div>
                        <p className='font-semibold text-gray-800 text-base'>
                          {user.name}
                        </p>
                        <p className='text-xs text-gray-500'>Usuário logado</p>
                      </div>
                    </div>
                  </div>

                  {/* User Menu Items */}
                  <NavLink
                    to='/my-orders'
                    className={({ isActive }) =>
                      `block w-full text-left py-2.5 text-gray-700 hover:text-primary text-base font-medium border-b border-gray-100 ${
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
                      `block w-full text-left py-2.5 text-gray-700 hover:text-primary text-base font-medium border-b border-gray-100 ${
                        isActive ? 'text-primary' : ''
                      }`
                    }
                    onClick={() => handleNavLinkClick('/write-review')}
                  >
                    ⭐ Escrever Reviews
                  </NavLink>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className='w-full flex items-center justify-center gap-2 px-6 py-3.5 mt-4 mb-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-600 rounded-lg text-base font-semibold transition-colors active:scale-95'
                  >
                    <LogOut className='w-5 h-5' />
                    <span>Sair</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowUserLogin(true);
                  }}
                  className='w-full cursor-pointer px-6 py-3.5 mt-4 mb-4 bg-primary hover:bg-primary-dull transition text-white rounded-lg text-base font-semibold active:scale-95'
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;