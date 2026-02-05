import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Lock, LogOut, Menu, ChevronDown, ChevronRight, User, Package, Star } from 'lucide-react';
import { assets, groups } from '../assets/assets';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [localSearchInput, setLocalSearchInput] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [productsExpanded, setProductsExpanded] = useState(false);
  
  const location = useLocation();
  const isHomepage = location.pathname === '/';

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

  // Detectar scroll para mudar o fundo na homepage
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    if (isHomepage) {
      window.addEventListener('scroll', handleScroll);
      handleScroll();
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage]);

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
    setProductsExpanded(false);
    if (path !== '/products') {
      clearSearch();
    }
    navigate(path);
  };

  const handleAdminAccess = () => {
    setOpen(false);
    navigate('/seller');
  };

  const handleCartClick = () => {
    setShowCartSidebar(true);
  };

  // Determinar se deve usar estilo transparente
  const isTransparent = isHomepage && !scrolled;

  const renderSearchInput = (isMobile = false) => (
    <div
      className={`flex items-center gap-2 px-3 rounded-full relative ${
        isMobile 
          ? 'w-full px-4 py-2 border border-gray-300' 
          : `text-sm py-1.5 border ${isTransparent ? 'border-white/30 bg-white/10' : 'border-gray-300'}`
      }`}
    >
      <input
        onChange={isMobile ? handleMobileSearch : handleSearch}
        value={localSearchInput}
        className={`w-full bg-transparent outline-none ${
          isMobile 
            ? 'text-base placeholder-gray-500' 
            : `${isTransparent ? 'placeholder-white/70 text-white' : 'placeholder-gray-500'}`
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
          className={`w-4 h-4 flex items-center justify-center transition-colors ${
            isTransparent ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-gray-600'
          }`}
          aria-label='Limpar pesquisa'
        >
          ✕
        </button>
      ) : (
        <img
          src={assets.search_icon}
          alt='Pesquisar'
          className={`w-4 h-4 cursor-pointer transition-opacity ${
            isTransparent ? 'invert opacity-70 hover:opacity-100' : 'opacity-60 hover:opacity-100'
          }`}
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
<nav
  className={`z-50 left-0 right-0
  flex items-center justify-between
  px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b
  transition-[background-color,border-color,box-shadow] duration-300
  ${
    isTransparent
      ? 'bg-transparent border-white/10'
      : 'bg-white border-gray-300 shadow-sm'
  }`}
>

      
      {/* ===== MOBILE: Menu Icon (Left) ===== */}
      <button
        onClick={() => setOpen(!open)}
        aria-label='Menu de navegação'
        className='sm:hidden focus:outline-none p-1'
      >
        <Menu 
          className={`w-6 h-6 transition-all duration-300 ${isTransparent ? 'text-white' : 'text-gray-700'}`}
          strokeWidth={2}
        />
      </button>

      {/* ===== DESKTOP: Logo (Left) ===== */}
      <NavLink 
        to='/' 
        onClick={() => setOpen(false)}
        aria-label='Elite Surfing Portugal - Página Inicial'
        title='Ir para página inicial'
        className='hidden sm:block'
      >
        <img 
          className={`h-9 transition-all duration-300 ${isTransparent ? 'brightness-0 invert' : ''}`}
          src={assets.logo_es} 
          alt='Elite Surfing Portugal - Loja de Surf'
        />
      </NavLink>

      {/* ===== MOBILE: Logo (Center) ===== */}
      <NavLink 
        to='/' 
        onClick={() => setOpen(false)}
        aria-label='Elite Surfing Portugal - Página Inicial'
        title='Ir para página inicial'
        className='sm:hidden'
      >
        <img 
          className={`h-9 transition-all duration-300 ${isTransparent ? 'brightness-0 invert' : ''}`}
          src={assets.logo_es} 
          alt='Elite Surfing Portugal - Loja de Surf'
        />
      </NavLink>

      {/* ===== DESKTOP: Navigation ===== */}
      <div className='hidden sm:flex items-center gap-8'>
        <NavLink
          to='/'
          className={({ isActive }) => 
            `transition-colors ${isTransparent 
              ? `text-white hover:text-white/80 ${isActive ? 'text-white font-medium' : ''}` 
              : `hover:text-primary ${isActive ? 'text-primary' : ''}`
            }`
          }
        >
          Home
        </NavLink>
        
        {/* PRODUTOS COM DROPDOWN */}
        <div className='relative group'>
          <NavLink
            to='/products'
            className={({ isActive }) => 
              `flex items-center gap-1 transition-colors py-2 ${isTransparent 
                ? `text-white hover:text-white/80 ${isActive ? 'text-white font-medium' : ''}` 
                : `hover:text-primary ${isActive ? 'text-primary' : ''}`
              }`
            }
          >
            Produtos
            <ChevronDown className={`w-4 h-4 transition-transform group-hover:rotate-180 ${
              isTransparent ? 'text-white' : ''
            }`} />
          </NavLink>
          
          {/* Dropdown Menu - Sem gap */}
          <div className='invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute top-full left-0 pt-0 transition-all duration-200 z-50'>
            <div className='h-2' />
            <div className='bg-white shadow-xl border border-gray-200 rounded-lg py-2 min-w-[200px]'>
              <Link
                to='/products'
                className='block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors font-medium border-b border-gray-100'
              >
                Ver Todos os Produtos
              </Link>
              
              <div className='py-1'>
                <p className='px-4 py-2 text-xs text-gray-400 uppercase tracking-wider'>Coleções</p>
                {groups.map((group) => (
                  <Link
                    key={group.id}
                    to={`/collections/${group.slug}`}
                    className='flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors'
                  >
                    <img 
                      src={group.image} 
                      alt={group.name}
                      className='w-8 h-8 rounded object-cover'
                    />
                    <span>{group.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <NavLink
          to='/contact'
          className={({ isActive }) => 
            `transition-colors ${isTransparent 
              ? `text-white hover:text-white/80 ${isActive ? 'text-white font-medium' : ''}` 
              : `hover:text-primary ${isActive ? 'text-primary' : ''}`
            }`
          }
        >
          Contacto
        </NavLink>

        <div className='hidden lg:flex items-center'>{renderSearchInput()}</div>

        {/* Admin Lock Icon */}
        <div className='relative group'>
          <button
            onClick={handleAdminAccess}
            className={`relative cursor-pointer p-2 rounded-lg transition-all duration-200 ${
              isTransparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
            title='Área de Administração'
          >
            <Lock className={`w-5 h-5 transition-colors ${
              isTransparent ? 'text-white' : 'text-gray-600 group-hover:text-primary'
            }`} />
            {isSeller && (
              <span className='absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white'></span>
            )}
          </button>

          {isSeller && (
            <div className='hidden group-hover:block absolute top-full right-0 pt-2 z-50'>
              <div className='bg-white shadow-lg border border-gray-200 py-2 w-48 rounded-md text-sm'>
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
            </div>
          )}
        </div>

        {/* Cart Icon */}
        <div
          onClick={handleCartClick}
          className='relative cursor-pointer'
        >
          <img
            src={assets.nav_cart_icon}
            alt='Carrinho de compras'
            className={`w-6 transition-all duration-300 ${
              isTransparent ? 'invert brightness-0 opacity-100' : 'opacity-80'
            }`}
          />
          {getCartCount() > 0 && (
            <span className='absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full flex items-center justify-center'>
              {getCartCount()}
            </span>
          )}
        </div>

        {/* ===== USER ACCOUNT - Ícone unificado ===== */}
        <div className='relative group'>
          <button
            onClick={() => !user && setShowUserLogin(true)}
            className={`relative p-2 rounded-full transition-all duration-200 cursor-pointer ${
              isTransparent 
                ? 'hover:bg-white/10' 
                : 'hover:bg-gray-100'
            }`}
            aria-label={user ? 'Minha conta' : 'Entrar'}
          >
            <User 
              className={`w-6 h-6 transition-colors ${
                isTransparent 
                  ? 'text-white' 
                  : 'text-gray-700'
              }`}
              fill={user 
                ? (isTransparent ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)') 
                : 'none'
              }
            />
            {/* Indicador de logado - só aparece quando user está logado */}
            {user && (
              <span className='absolute bottom-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white'></span>
            )}
          </button>
          
          {/* Dropdown - Só aparece quando logado */}
          {user && (
            <div className='hidden group-hover:block absolute top-full right-0 pt-2 z-50'>
              <div className='bg-white shadow-xl border border-gray-200 rounded-xl py-2 w-52 text-sm'>
                {/* Header com nome */}
                <div className='px-4 py-3 border-b border-gray-100'>
                  <p className='font-semibold text-gray-800 truncate'>{user.name}</p>
                  <p className='text-xs text-gray-400 mt-0.5'>A minha conta</p>
                </div>
                
                {/* Menu Items */}
                <div className='py-1'>
                  <button
                    onClick={() => navigate('/my-orders')}
                    className='w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors'
                  >
                    <Package className='w-4 h-4 text-gray-400' />
                    <span>Os meus Pedidos</span>
                  </button>
                  <button
                    onClick={() => navigate('/write-review')}
                    className='w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors'
                  >
                    <Star className='w-4 h-4 text-gray-400' />
                    <span>Escrever Reviews</span>
                  </button>
                </div>
                
                {/* Logout */}
                <div className='border-t border-gray-100 pt-1'>
                  <button
                    onClick={handleLogout}
                    className='w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors'
                  >
                    <LogOut className='w-4 h-4' />
                    <span>Terminar Sessão</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== MOBILE: Cart (Right) ===== */}
      <div className='flex items-center gap-4 sm:hidden'>
        <div
          onClick={handleCartClick}
          className='relative cursor-pointer'
        >
          <img
            src={assets.nav_cart_icon}
            alt='Carrinho de compras'
            className={`w-6 transition-all duration-300 ${
              isTransparent ? 'invert brightness-0 opacity-100' : 'opacity-80'
            }`}
          />
          {getCartCount() > 0 && (
            <span className='absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full flex items-center justify-center'>
              {getCartCount()}
            </span>
          )}
        </div>
      </div>

      {/* ===== MOBILE MENU DRAWER ===== */}
      {open && (
        <div
          className='fixed inset-0 bg-black/50 z-[60] sm:hidden'
          onClick={() => setOpen(false)}
        >
          <div
            className='absolute top-0 right-0 h-full w-[80%] max-w-[320px] bg-white shadow-2xl flex flex-col'
            onClick={e => e.stopPropagation()}
          >
            {/* Header do Menu Mobile */}
            <div className='flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50'>
              <span className='text-lg font-semibold text-gray-800'>Menu</span>
              <button
                onClick={() => setOpen(false)}
                className='p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors'
                aria-label='Fechar menu'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6'
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

            {/* Search Input */}
            <div className='p-4 border-b border-gray-100'>
              {renderSearchInput(true)}
            </div>

            {/* Navigation Links */}
            <div className='flex-1 overflow-y-auto'>
              <nav className='p-4'>
                <NavLink
                  to='/'
                  className={({ isActive }) =>
                    `block py-3 px-2 text-base font-medium border-b border-gray-100 transition-colors ${
                      isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'
                    }`
                  }
                  onClick={() => handleNavLinkClick('/')}
                >
                  Home
                </NavLink>

                {/* PRODUTOS COM SUBMENU EXPANSÍVEL */}
                <div className='border-b border-gray-100'>
                  <button
                    onClick={() => setProductsExpanded(!productsExpanded)}
                    className='flex items-center justify-between w-full py-3 px-2 text-base font-medium text-gray-700 hover:text-primary transition-colors'
                  >
                    <span>Produtos</span>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform duration-200 ${
                        productsExpanded ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  
                  {/* Submenu */}
                  <div className={`overflow-hidden transition-all duration-300 ${
                    productsExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className='pl-4 pb-3 space-y-1'>
                      <Link
                        to='/products'
                        onClick={() => handleNavLinkClick('/products')}
                        className='flex items-center gap-2 py-2 px-3 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors'
                      >
                        <ChevronRight className='w-4 h-4' />
                        <span>Ver Todos</span>
                      </Link>
                      
                      <p className='px-3 pt-2 pb-1 text-xs text-gray-400 uppercase tracking-wider'>
                        Coleções
                      </p>
                      
                      {groups.map((group) => (
                        <Link
                          key={group.id}
                          to={`/collections/${group.slug}`}
                          onClick={() => handleNavLinkClick(`/collections/${group.slug}`)}
                          className='flex items-center gap-3 py-2 px-3 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors'
                        >
                          <img 
                            src={group.image} 
                            alt={group.name}
                            className='w-8 h-8 rounded object-cover'
                          />
                          <span>{group.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <NavLink
                  to='/contact'
                  className={({ isActive }) =>
                    `block py-3 px-2 text-base font-medium border-b border-gray-100 transition-colors ${
                      isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'
                    }`
                  }
                  onClick={() => handleNavLinkClick('/contact')}
                >
                  Contacto
                </NavLink>

                <button
                  onClick={handleAdminAccess}
                  className='flex items-center gap-3 w-full py-3 px-2 text-base font-medium border-b border-gray-100 text-gray-700 hover:text-primary transition-colors'
                >
                  <Lock className='w-5 h-5' />
                  <span>Área Admin</span>
                  {isSeller && (
                    <span className='ml-auto text-xs bg-green-500 text-white px-2 py-0.5 rounded-full'>
                      Ativo
                    </span>
                  )}
                </button>

                {isSeller && (
                  <button
                    onClick={handleSellerLogout}
                    className='flex items-center gap-2 w-full mt-3 py-3 px-3 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium rounded-lg border border-red-200 transition-colors'
                  >
                    <LogOut className='w-4 h-4' />
                    <span>Logout Admin</span>
                  </button>
                )}
              </nav>

              {/* User Section */}
              <div className='p-4 border-t border-gray-100'>
                {user ? (
                  <div className='space-y-3'>
                    {/* User Info - Discreto */}
                    <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                      <div className='relative'>
                        <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>
                          <User className='w-5 h-5 text-gray-500' />
                        </div>
                        <span className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white'></span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium text-gray-800 text-sm truncate'>
                          {user.name}
                        </p>
                        <p className='text-xs text-gray-400'>Conta ativa</p>
                      </div>
                    </div>

                    {/* User Links */}
                    <NavLink
                      to='/my-orders'
                      className={({ isActive }) =>
                        `flex items-center gap-3 py-2.5 px-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive 
                            ? 'text-primary bg-primary/10' 
                            : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                        }`
                      }
                      onClick={() => handleNavLinkClick('/my-orders')}
                    >
                      <Package className='w-4 h-4 text-gray-400' />
                      Os meus Pedidos
                    </NavLink>

                    <NavLink
                      to='/write-review'
                      className={({ isActive }) =>
                        `flex items-center gap-3 py-2.5 px-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive 
                            ? 'text-primary bg-primary/10' 
                            : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                        }`
                      }
                      onClick={() => handleNavLinkClick('/write-review')}
                    >
                      <Star className='w-4 h-4 text-gray-400' />
                      Escrever Reviews
                    </NavLink>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className='w-full flex items-center justify-center gap-2 py-3 mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors'
                    >
                      <LogOut className='w-4 h-4' />
                      <span>Terminar Sessão</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setOpen(false);
                      setShowUserLogin(true);
                    }}
                    className='w-full py-3 bg-primary hover:bg-primary-dull text-white rounded-lg text-base font-semibold transition-colors'
                  >
                    Entrar / Registar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;