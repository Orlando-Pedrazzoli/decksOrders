import React from 'react';
import Navbar from './components/Navbar';
import AnnouncementBar from './components/AnnouncementBar';
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
import Privacy from './pages/Privacy';
import RefundPolicy from './pages/RefundPolicy';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import ScrollToTop from './components/ScrollToTop';
import HealthCheck from './components/HealthCheck';
import WhatsAppButton from './components/WhatsAppButton';
import CartSidebar from './components/CartSidebar';
import GroupPage from './pages/GroupPage';

// ✅ Importa o CookieConsent
import CookieConsent from 'react-cookie-consent';

const App = () => {
  const location = useLocation();
  const isSellerPath = location.pathname.includes('seller');
  const isHomepage = location.pathname === '/';
  const isCollectionPage = location.pathname.startsWith('/collections/');
  const { showUserLogin, isSeller, isSellerLoading } = useAppContext();

  // ✅ OTIMIZADO: Loading APENAS na área de seller
  if (isSellerPath && isSellerLoading) {
    return (
      <div className='flex justify-center items-center h-screen bg-white'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-primary mx-auto'></div>
          <p className='mt-4 text-gray-600'>A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    // ✅ FIX: Removido overflow-x-hidden - usar overflow-x: clip no CSS (index.css)
    // overflow-x-hidden cria scroll context que QUEBRA position: sticky
    <div className='text-default min-h-screen text-gray-700 bg-white'>
     {/* ✅ AnnouncementBar + Navbar - apenas fora do seller - EMPACOTADOS EM STICKY */}
{!isSellerPath && (
  <>
    <div className="fixed top-0 left-0 right-0 z-50">
      <AnnouncementBar />
      <Navbar />
    </div>
    <div className="h-[104px]" /> {/* Spacer - ajusta conforme altura real */}
  </>
)}
     
      
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
      
      {/* ✅ Condicional: Homepage e Collections sem padding lateral para hero full-bleed */}
      <div
        className={`${
          isSellerPath 
            ? '' 
            : (isHomepage || isCollectionPage)
              ? '' 
              : 'px-4 md:px-16 lg:px-24 xl:px-32'
        }`}
      >
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/collections/:group' element={<GroupPage />} />
          <Route path='/products' element={<AllProducts />} />
          <Route path='/products/:category' element={<ProductCategory />} />
          <Route path='/products/:category/:id' element={<ProductDetails />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/add-address' element={<AddAddress />} />
          <Route path='/order-success/:orderId' element={<OrderSuccess />} />
          <Route path='/my-orders' element={<MyOrders />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/privacy' element={<Privacy />} />
          <Route path='/refund-policy' element={<RefundPolicy />} />
          <Route path='/faq' element={<FAQ />} />
          <Route path='/terms' element={<Terms />} />
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

      {/* ✅ WhatsApp Button - Aparece em todas as páginas exceto seller */}
      {!isSellerPath && <WhatsAppButton />}

      {/* ✅ Cart Sidebar - Aparece em todas as páginas exceto seller */}
      {!isSellerPath && <CartSidebar />}

      {/* ✅ Cookie Consent RGPD-Compliant (Portugal/UE) */}
      <CookieConsent
        location='bottom'
        cookieName='elitesurfingCookieConsent'
        containerClasses='cookie-consent-container'
        contentClasses='cookie-consent-content'
        buttonWrapperClasses='cookie-consent-buttons'
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          color: '#1e293b',
          fontSize: '14px',
          padding: '20px 24px',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.12)',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
          zIndex: 9999,
        }}
        buttonText='Aceitar todos'
        declineButtonText='Rejeitar'
        enableDeclineButton
        buttonStyle={{
          background: '#3B82F6',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '600',
          border: 'none',
          padding: '10px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
        }}
        declineButtonStyle={{
          background: 'transparent',
          color: '#64748b',
          fontSize: '14px',
          fontWeight: '600',
          border: '1px solid #cbd5e1',
          padding: '10px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        expires={365}
        overlay={false}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            flex: '1',
            minWidth: '280px',
          }}
        >
          {/* Ícone de Cookie */}
          <div
            style={{
              width: '40px',
              height: '40px',
              background: '#EFF6FF',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z'
                fill='#3B82F6'
              />
              <circle cx='8' cy='9' r='1.5' fill='#3B82F6' />
              <circle cx='12' cy='15' r='1.5' fill='#3B82F6' />
              <circle cx='16' cy='9' r='1.5' fill='#3B82F6' />
            </svg>
          </div>

          {/* Texto */}
          <div style={{ flex: '1' }}>
            <p
              style={{
                margin: 0,
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '6px',
                fontSize: '15px',
              }}
            >
              Este site utiliza cookies
            </p>
            <p
              style={{
                margin: 0,
                color: '#475569',
                fontSize: '13px',
                lineHeight: '1.5',
              }}
            >
              Utilizamos cookies essenciais para o funcionamento do site e cookies
              de análise para melhorar a sua experiência. Ao clicar em "Aceitar
              todos", concorda com o uso de todos os cookies de acordo com a nossa{' '}
              <a
                href='/privacy'
                style={{
                  color: '#3B82F6',
                  textDecoration: 'underline',
                  fontWeight: '500',
                }}
                onClick={e => e.stopPropagation()}
              >
                Política de Privacidade
              </a>
              .
            </p>
          </div>
        </div>
      </CookieConsent>

      {/* ✅ Estilos customizados para hover effects */}
      <style>{`
        .cookie-consent-container button:hover {
          transform: translateY(-1px);
        }

        .cookie-consent-container button:active {
          transform: translateY(0);
        }

        /* Responsivo para mobile */
        @media (max-width: 640px) {
          .cookie-consent-container {
            padding: 16px !important;
          }
          
          .cookie-consent-container > div:first-child {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .cookie-consent-buttons {
            width: 100%;
            display: flex;
            gap: 8px;
            margin-top: 12px;
          }

          .cookie-consent-buttons button {
            flex: 1;
            padding: 12px 16px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default App;