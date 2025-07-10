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

  const handleNavLinkClick = path => {
    setOpen(false); // Close mobile menu when navigating
    navigate(path);
  };

  // Render search input consistently
  const renderSearchInput = (isMobile = false) => (
    <div
      className={`flex items-center gap-2 border border-gray-300 px-3 rounded-full ${
        isMobile ? 'w-full px-4 py-2' : 'text-sm py-1.5'
      }`}
    >
      <input
        onChange={handleSearch}
        value={localSearchInput}
        className={`w-full bg-transparent outline-none placeholder-gray-500 ${
          isMobile ? 'text-base' : ''
        }`}
        type='text'
        placeholder='Pesquisar produtos'
      />
      <img src={assets.search_icon} alt='search' className='w-4 h-4' />
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
          to='/write-review'
          className={({ isActive }) => (isActive ? 'text-primary' : '')}
        >
          Reviews
        </NavLink>
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
          <div className='relative group'>
            <img src={assets.profile_icon} className='w-10' alt='profile' />
            <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-36 rounded-md text-sm z-40 transition-all duration-200'>
              <li
                onClick={() => navigate('/my-orders')}
                className='p-2 pl-4 hover:bg-primary/10 cursor-pointer'
              >
                Os meus Pedidos
              </li>
              <li
                onClick={handleLogout} // <--- Use handleLogout here
                className='p-2 pl-4 hover:bg-primary/10 cursor-pointer'
              >
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
                <NavLink
                  to='/my-orders'
                  className={({ isActive }) =>
                    `block w-full text-left py-2 text-gray-700 hover:text-primary transition-colors duration-200 text-lg font-medium border-b border-gray-100 ${
                      isActive ? 'text-primary' : ''
                    }`
                  }
                  onClick={() => handleNavLinkClick('/my-orders')}
                >
                  Os meus Pedidos
                </NavLink>
                <button
                  onClick={handleLogout} // <--- Use handleLogout here
                  className='w-full cursor-pointer px-6 py-3 mt-4 bg-primary hover:bg-primary-dull transition text-white rounded-lg text-base font-semibold'
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
