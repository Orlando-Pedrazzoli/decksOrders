import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast'; // Keep toast for local error messages if needed, but AppContext handles most.

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
    logoutUser, // <--- Import the new logoutUser from AppContext
  } = useAppContext(); // Removed setUser, setCartItems, axios as they are now handled by logoutUser

  // Sync with global search query
  useEffect(() => {
    if (typeof searchQuery === 'string') {
      setLocalSearchInput(searchQuery);
    }
  }, [searchQuery]);

  // ✅ NOVO: Limpar search quando navegar para rotas específicas
  useEffect(() => {
    const currentPath = window.location.pathname;

    // ✅ Limpar search quando sair da página de produtos ou ir para produto específico
    if (currentPath !== '/products' && !currentPath.startsWith('/products/')) {
      // Limpar apenas se não estamos em páginas relacionadas a produtos
      if (searchQuery && searchQuery.length > 0) {
        setSearchQuery('');
        setLocalSearchInput('');
      }
    } else if (
      currentPath.includes('/products/') &&
      currentPath.split('/').length > 2
    ) {
      // ✅ Se estamos numa página de produto específico, limpar search
      if (searchQuery && searchQuery.length > 0) {
        setSearchQuery('');
        setLocalSearchInput('');
      }
    }
  }, [window.location.pathname]); // ✅ Monitorar mudanças de rota

  // Navigate to products when search query changes
  useEffect(() => {
    // Only navigate if search query is not empty to avoid navigating on initial load
    if (searchQuery && searchQuery.length > 0) {
      navigate('/products');
    }
  }, [searchQuery, navigate]);

  // Handle logout: This function now just calls the context's logoutUser
  const handleLogout = async () => {
    setOpen(false); // Close mobile menu first
    await logoutUser(); // Call the centralized logout function from context
    // The context's logoutUser handles:
    // - API call to /api/user/logout
    // - Clearing user state (setUser(null))
    // - Clearing cart items (setCartItems({}))
    // - Clearing mobile_auth_token from localStorage
    // - Showing success/error toasts
    // - Navigating to '/'
    // - Setting sessionStorage.setItem('userLoggedOut', 'true');
    // - Potentially forcing a reload if necessary (though the context function should be robust enough without it)
    // No need for window.location.reload() or explicit setUser/setCartItems here.
  };

  const handleSearch = e => {
    const value = e.target.value;
    setLocalSearchInput(value);
    setSearchQuery(value); // Update global search immediately
  };

  // ✅ CORRIGIDO: Função específica para mobile search
  const handleMobileSearch = e => {
    const value = e.target.value;
    setLocalSearchInput(value);
    setSearchQuery(value); // Update global search immediately
  };

  // ✅ NOVO: Função para executar pesquisa (mobile)
  const executeMobileSearch = () => {
    if (localSearchInput.trim()) {
      setOpen(false); // Fechar menu mobile
      navigate('/products');
    }
  };

  // ✅ NOVO: Função para limpar search manualmente
  const clearSearch = () => {
    setLocalSearchInput('');
    setSearchQuery('');
  };

  const handleNavLinkClick = path => {
    setOpen(false); // Close mobile menu when navigating

    // ✅ NOVO: Limpar search quando navegar para outras páginas
    if (path !== '/products') {
      clearSearch();
    }

    navigate(path);
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
          // ✅ Pesquisar ao pressionar Enter
          if (e.key === 'Enter' && localSearchInput.trim()) {
            if (isMobile) {
              executeMobileSearch(); // ✅ Usar função específica para mobile
            } else {
              navigate('/products');
            }
          }
          // ✅ Limpar com Escape
          if (e.key === 'Escape') {
            clearSearch();
          }
        }}
      />

      {/* ✅ Ícone de pesquisa OU botão de limpar */}
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
            // ✅ Pesquisar ao clicar no ícone
            if (localSearchInput.trim()) {
              if (isMobile) {
                executeMobileSearch(); // ✅ Usar função específica para mobile
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
        {/* ✅ REMOVIDO: Reviews link do menu principal */}
        <NavLink
          to='/contact'
          className={({ isActive }) => (isActive ? 'text-primary' : '')}
        >
          Contacto
        </NavLink>

        {/* Desktop Search */}
        <div className='hidden lg:flex items-center'>{renderSearchInput()}</div>

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
            {/* ✅ NOVO: Nome do usuário embaixo do profile */}
            <span className='text-xs text-gray-600 mt-1 max-w-20 truncate'>
              {user.name}
            </span>
            {/* ✅ EXPANDIDO: Menu do profile com Reviews */}
            <ul className='hidden group-hover:block absolute top-12 right-0 bg-white shadow-lg border border-gray-200 py-2.5 w-44 rounded-md text-sm z-40 transition-all duration-200'>
              <li
                onClick={() => navigate('/my-orders')}
                className='p-3 pl-4 hover:bg-primary/10 cursor-pointer flex items-center gap-2 transition-colors duration-200'
              >
                <span className='text-primary'>📦</span>
                Os meus Pedidos
              </li>
              {/* ✅ NOVO: Reviews no menu do profile */}
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
                <span className='text-red-500'></span>
                Sair
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Mobile-specific elements */}
      <div className='flex items-center gap-6 sm:hidden'>
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
          onClick={() => setOpen(false)} // Close menu when clicking outside
        >
          <div
            className='absolute top-0 right-0 h-full w-3/4 sm:w-1/2 bg-white shadow-lg p-6 flex flex-col items-start gap-6 transition-transform duration-300 ease-out transform translate-x-0'
            onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the panel
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
            <div className='w-full mb-4'>{renderSearchInput(true)}</div>{' '}
            {/* Added mobile search here */}
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
            {/* Mobile User Profile / Login / Logout */}
            {user ? (
              <>
                {/* ✅ NOVO: Nome do usuário no menu mobile */}
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
                {/* ✅ NOVO: Reviews no menu mobile */}
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
                  onClick={handleLogout} // <--- Use handleLogout here
                  className='w-full cursor-pointer px-6 py-3 mt-4 bg-primary hover:bg-primary-dull transition text-white rounded-lg text-base font-semibold flex items-center justify-center gap-2'
                >
                  Sair
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
