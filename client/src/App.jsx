import React from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer';
import { useAppContext } from './context/AppContext';
import Login from './components/Login';
import AllProducts from './pages/AllProducts';
import ProductCategory from './pages/ProductCategory';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import AddAddress from './pages/AddAddress';
import MyOrders from './pages/MyOrders';
import OrderSuccess from './pages/OrderSuccess';
import WriteReview from './pages/WriteReview';
import SellerLogin from './components/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';
import AddProduct from './pages/seller/AddProduct';
import ProductList from './pages/seller/ProductList';
import Orders from './pages/seller/Orders';
import Loading from './components/Loading';
import Contact from './pages/Contact';
import ScrollToTop from './components/ScrollToTop';
import HealthCheck from './components/HealthCheck';

// ✅ Importa o CookieConsent
import CookieConsent from 'react-cookie-consent';

const App = () => {
  const isSellerPath = useLocation().pathname.includes('seller');
  const { showUserLogin, isSeller, isLoading } = useAppContext();

  // Show loading spinner while authentication is being verified
  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen bg-white'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-primary mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>
      {isSellerPath ? null : <Navbar />}
      {showUserLogin ? <Login /> : null}

      <Toaster
        position='top-center'
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#358f61',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#f87171',
              secondary: '#fff',
            },
          },
        }}
      />
      <ScrollToTop />
      <div
        className={`${isSellerPath ? '' : 'px-4 md:px-16 lg:px-24 xl:px-32'}`}
      >
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/products' element={<AllProducts />} />
          <Route path='/products/:category' element={<ProductCategory />} />
          <Route path='/products/:category/:id' element={<ProductDetails />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/add-address' element={<AddAddress />} />
          <Route path='/order-success/:orderId' element={<OrderSuccess />} />
          <Route path='/my-orders' element={<MyOrders />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/write-review' element={<WriteReview />} />

          <Route path='/loader' element={<Loading />} />
          <Route
            path='/seller'
            element={isSeller ? <SellerLayout /> : <SellerLogin />}
          >
            <Route index element={isSeller ? <AddProduct /> : null} />
            <Route path='product-list' element={<ProductList />} />
            <Route path='orders' element={<Orders />} />
          </Route>
        </Routes>
      </div>
      {!isSellerPath && <Footer />}
      <HealthCheck />

      {/* ✅ Cookie Consent banner */}
      <CookieConsent
        location='bottom'
        cookieName='elitesurfingCookieConsent'
        style={{
          background: '#121212',
          color: '#fff',
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: '10px 20px',
        }}
        buttonText='Aceitar'
        declineButtonText='Recusar'
        enableDeclineButton
        buttonStyle={{
          background: '#3B82F6', // cinza médio
          color: '#fff',
          fontSize: '14px',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          marginLeft: '10px',
          cursor: 'pointer',
        }}
        declineButtonStyle={{
          background: '#6e6e6e', // cinza um pouco mais claro
          color: '#fff',
          fontSize: '14px',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          marginLeft: '10px',
          cursor: 'pointer',
        }}
        expires={150}
      >
        <div style={{ maxWidth: '800px' }}>
          <strong>Este website utiliza cookies</strong> – Utilizamos cookies
          para personalizar conteúdo e anúncios, fornecer funcionalidades de
          redes sociais e analisar o nosso tráfego.
        </div>
      </CookieConsent>
    </div>
  );
};

export default App;
