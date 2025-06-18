import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  const {
    user,
    setUser,
    setShowUserLogin,
    navigate,
    setSearchQuery,
    searchQuery,
    getCartCount,
    axios,
  } = useAppContext();

  const logout = async () => {
    try {
      const { data } = await axios.get('/api/user/logout');
      if (data.success) {
        toast.success(data.message);
        setUser(null);
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      navigate('/products');
    }
  }, [searchQuery]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (open && !event.target.closest('.mobile-menu-container')) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <nav className='flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white sticky top-0 z-50'>
      <NavLink to='/' onClick={() => setOpen(false)}>
        <img className='h-11' src={assets.logo_es} alt='logo' />
      </NavLink>

      {/* Desktop Navigation */}
      <div className='hidden sm:flex items-center gap-8'>
        <NavLink to='/' className='hover:text-primary transition-colors'>
          Início
        </NavLink>
        <NavLink
          to='/products'
          className='hover:text-primary transition-colors'
        >
          Produtos
        </NavLink>
        <NavLink to='/contact' className='hover:text-primary transition-colors'>
          Contacto
        </NavLink>

        <div className='hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full hover:border-primary transition-colors'>
          <input
            onChange={e => setSearchQuery(e.target.value)}
            className='py-1.5 w-full bg-transparent outline-none placeholder-gray-500'
            type='text'
            placeholder='O que você procura?'
          />
          <img src={assets.search_icon} alt='search' className='w-4 h-4' />
        </div>

        <div
          onClick={() => navigate('/cart')}
          className='relative cursor-pointer hover:opacity-80 transition-opacity'
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

        {!user ? (
          <button
            onClick={() => setShowUserLogin(true)}
            className='cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full'
          >
            Login
          </button>
        ) : (
          <div className='relative group'>
            <img
              src={assets.profile_icon}
              className='w-10 cursor-pointer hover:opacity-80 transition-opacity'
              alt='Profile'
            />
            <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow-lg border border-gray-200 py-2 w-40 rounded-md text-sm z-50'>
              <li
                onClick={() => navigate('my-orders')}
                className='px-4 py-2 hover:bg-primary/10 cursor-pointer'
              >
                My Orders
              </li>
              <li
                onClick={logout}
                className='px-4 py-2 hover:bg-primary/10 cursor-pointer'
              >
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className='flex items-center gap-6 sm:hidden mobile-menu-container'>
        <div
          onClick={() => navigate('/cart')}
          className='relative cursor-pointer hover:opacity-80 transition-opacity'
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
        <button
          onClick={() => setOpen(!open)}
          aria-label='Menu'
          className='p-1 hover:bg-gray-100 rounded-md transition-colors'
        >
          <img src={assets.menu_icon} alt='menu' className='w-6 h-6' />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className='fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden'
            onClick={() => setOpen(false)}
          />

          {/* Menu */}
          <div
            className={`fixed top-[68px] left-0 w-full bg-white shadow-lg py-4 flex flex-col items-start gap-1 px-5 text-sm sm:hidden z-50 transition-all duration-300`}
          >
            <NavLink
              to='/'
              onClick={() => setOpen(false)}
              className='w-full px-4 py-3 hover:bg-primary/10 rounded-md transition-colors'
            >
              Início
            </NavLink>
            <NavLink
              to='/products'
              onClick={() => setOpen(false)}
              className='w-full px-4 py-3 hover:bg-primary/10 rounded-md transition-colors'
            >
              Produtos
            </NavLink>
            {user && (
              <NavLink
                to='/my-orders'
                onClick={() => setOpen(false)}
                className='w-full px-4 py-3 hover:bg-primary/10 rounded-md transition-colors'
              >
                Meus Pedidos
              </NavLink>
            )}
            <NavLink
              to='/contact'
              onClick={() => setOpen(false)}
              className='w-full px-4 py-3 hover:bg-primary/10 rounded-md transition-colors'
            >
              Contacto
            </NavLink>

            <div className='w-full border-t border-gray-200 my-2'></div>

            {!user ? (
              <button
                onClick={() => {
                  setOpen(false);
                  setShowUserLogin(true);
                }}
                className='w-full mt-2 cursor-pointer px-6 py-3 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm'
              >
                Login
              </button>
            ) : (
              <button
                onClick={logout}
                className='w-full mt-2 cursor-pointer px-6 py-3 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm'
              >
                Logout
              </button>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
