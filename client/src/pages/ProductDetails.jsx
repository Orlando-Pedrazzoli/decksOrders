import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link, useParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
  const { products, navigate, currency, addToCart } = useAppContext();
  const { id } = useParams();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbStartIndex, setThumbStartIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const imageScrollRef = useRef(null);
  const modalImageScrollRef = useRef(null);

  // Flag para controlar scroll programático no modal
  const isProgrammaticScroll = useRef(false);

  const product = products.find(item => item._id === id);

  useEffect(() => {
    if (product && products.length > 0) {
      const productsCopy = [...products].filter(
        item => product.category === item.category && item._id !== product._id
      );
      setRelatedProducts(productsCopy);
    }
  }, [products, product]);

  // Scroll programático no carrossel principal mobile (pode deixar assim ou aplicar flag similar)
  useEffect(() => {
    if (imageScrollRef.current && window.innerWidth < 640) {
      const scrollContainer = imageScrollRef.current;
      const imageWidth = scrollContainer.offsetWidth;
      scrollContainer.scrollLeft = currentImageIndex * imageWidth;
    }
  }, [currentImageIndex]);

  // Scroll programático no modal mobile com controle da flag
  useEffect(() => {
    if (modalImageScrollRef.current && isModalOpen && window.innerWidth < 640) {
      const scrollContainer = modalImageScrollRef.current;
      const imageWidth = scrollContainer.offsetWidth;

      isProgrammaticScroll.current = true;
      scrollContainer.scrollLeft = currentImageIndex * imageWidth;

      const timeout = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 300); // tempo igual ao transition duration

      return () => clearTimeout(timeout);
    }
  }, [currentImageIndex, isModalOpen]);

  const changeImage = newIndex => {
    setIsTransitioning(true);
    setCurrentImageIndex(newIndex);

    if (window.innerWidth >= 640) {
      if (newIndex >= thumbStartIndex + 4) {
        setThumbStartIndex(prev => prev + 1);
      } else if (newIndex < thumbStartIndex) {
        setThumbStartIndex(prev => prev - 1);
      }
    }

    setTimeout(() => setIsTransitioning(false), 300);
  };

  const nextImage = () => {
    const newIndex = (currentImageIndex + 1) % product.image.length;
    changeImage(newIndex);
  };

  const prevImage = () => {
    const newIndex =
      (currentImageIndex - 1 + product.image.length) % product.image.length;
    changeImage(newIndex);
  };

  const scrollThumbsUp = () => {
    const newIndex = thumbStartIndex - 1;
    setThumbStartIndex(newIndex < 0 ? product.image.length - 4 : newIndex);
  };

  const scrollThumbsDown = () => {
    const newIndex = thumbStartIndex + 1;
    setThumbStartIndex(newIndex > product.image.length - 4 ? 0 : newIndex);
  };

  const selectThumbnail = index => {
    changeImage(index);
  };

  // Agora ignoramos scroll se for programático no modal
  const handleImageScroll = ref => {
    if (ref.current) {
      if (ref === modalImageScrollRef && isProgrammaticScroll.current) {
        // Ignora scroll causado pelo efeito programático
        return;
      }
      const scrollContainer = ref.current;
      const imageWidth = scrollContainer.offsetWidth;
      const newIndex = Math.round(scrollContainer.scrollLeft / imageWidth);
      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex);
      }
    }
  };

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className='mt-12 px-6 md:px-16 lg:px-24 xl:px-32'>
      {/* Full Image Modal */}
      {isModalOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className='relative max-w-4xl w-full p-4'
            onClick={e => e.stopPropagation()}
          >
            <button
              className='absolute -top-10 -right-10 text-white text-3xl hover:text-gray-300 transition-all duration-300 z-50'
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>

            <div className='relative'>
              {/* Mobile Carousel for Modal */}
              <div
                ref={modalImageScrollRef}
                onScroll={() => handleImageScroll(modalImageScrollRef)}
                className='flex w-full h-full overflow-x-scroll snap-x snap-mandatory scroll-smooth hide-scrollbar sm:hidden border border-gray-500/30 rounded'
              >
                {product.image.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Product image ${index + 1}`}
                    className='w-full h-full object-contain flex-shrink-0 snap-center cursor-pointer'
                    onClick={() => setIsModalOpen(false)}
                  />
                ))}
              </div>

              {/* Modal Image Desktop */}
              <img
                src={product.image[currentImageIndex]}
                alt='Selected product'
                className={`w-full h-full object-contain max-h-screen cursor-pointer transition-opacity duration-300 ${
                  isTransitioning ? 'opacity-70' : 'opacity-100'
                } hidden sm:block`}
                onClick={() => setIsModalOpen(false)}
              />

              {/* Modal navigation arrows */}
              {product.image.length > 1 && (
                <>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className='absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-3 shadow-md hover:bg-white transition-all duration-300 active:scale-90 hidden sm:block'
                  >
                    <img
                      src={assets.arrow_left}
                      alt='Previous'
                      className='w-5 h-5'
                    />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-3 shadow-md hover:bg-white transition-all duration-300 active:scale-90 hidden sm:block'
                  >
                    <img
                      src={assets.arrow_right}
                      alt='Next'
                      className='w-5 h-5'
                    />
                  </button>
                </>
              )}

              {/* Dots for Mobile Modal */}
              <div className='flex justify-center gap-2 mt-4 sm:hidden'>
                {product.image.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => changeImage(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                      currentImageIndex === index
                        ? 'bg-primary'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      ;{/* Breadcrumbs */}
      <p className='text-sm md:text-base'>
        <Link
          to={'/'}
          className='hover:text-primary transition-colors duration-200'
        >
          Home
        </Link>{' '}
        /
        <Link
          to={'/products'}
          className='hover:text-primary transition-colors duration-200'
        >
          {' '}
          Products
        </Link>{' '}
        /
        <Link
          to={`/products/${product.category.toLowerCase()}`}
          className='hover:text-primary transition-colors duration-200'
        >
          {' '}
          {product.category}
        </Link>{' '}
        /<span className='text-primary'> {product.name}</span>
      </p>
      {/* Product Content */}
      <div className='flex flex-col md:flex-row gap-8 lg:gap-16 mt-4'>
        {/* Images Section */}
        <div className='flex flex-col-reverse sm:flex-row gap-3 md:gap-6 w-full md:w-1/2'>
          {/* Thumbnail Carousel (hidden on mobile, visible on sm and up) */}
          <div className='relative hidden sm:flex sm:flex-col items-center justify-center gap-2'>
            {product.image.length > 4 && (
              <button
                onClick={scrollThumbsUp}
                className='p-1.5 rounded-full bg-white/90 shadow-md hover:bg-white transition-all duration-300 active:scale-90'
              >
                <img src={assets.arrow_up} alt='Up' className='w-4 h-4' />
              </button>
            )}

            <div className='flex sm:flex-col gap-3 overflow-hidden'>
              {product.image
                .slice(thumbStartIndex, thumbStartIndex + 4)
                .map((image, index) => (
                  <div
                    key={thumbStartIndex + index}
                    onClick={() => selectThumbnail(thumbStartIndex + index)}
                    className={`border-2 w-16 h-16 sm:w-20 sm:h-20 rounded overflow-hidden cursor-pointer transition-all duration-300 ${
                      currentImageIndex === thumbStartIndex + index
                        ? 'border-primary scale-105 shadow-md'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${thumbStartIndex + index + 1}`}
                      className='w-full h-full object-cover transition-transform duration-300'
                    />
                  </div>
                ))}
            </div>

            {product.image.length > 4 && (
              <button
                onClick={scrollThumbsDown}
                className='p-1.5 rounded-full bg-white/90 shadow-md hover:bg-white transition-all duration-300 active:scale-90'
              >
                <img src={assets.arrow_down} alt='Down' className='w-4 h-4' />
              </button>
            )}
          </div>

          {/* Main Image Container */}
          <div className='relative w-full max-w-[400px] h-[300px] sm:h-[400px] mx-auto md:mx-0'>
            {/* Mobile Carousel (horizontal scroll with dots) */}
            <div
              ref={imageScrollRef}
              onScroll={() => handleImageScroll(imageScrollRef)}
              className='flex w-full h-full overflow-x-scroll snap-x snap-mandatory scroll-smooth hide-scrollbar sm:hidden border border-gray-500/30 rounded'
            >
              {product.image.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className='w-full h-full object-contain flex-shrink-0 snap-center cursor-pointer'
                  onClick={() => setIsModalOpen(true)}
                />
              ))}
            </div>

            {/* Desktop Main Image (standard with arrows) */}
            <div className='relative border border-gray-500/30 w-full h-full rounded overflow-hidden hidden sm:block'>
              <img
                src={product.image[currentImageIndex]}
                alt='Selected product'
                className={`w-full h-full object-contain cursor-pointer transition-opacity duration-300 ${
                  isTransitioning ? 'opacity-70' : 'opacity-100'
                }`}
                onClick={() => setIsModalOpen(true)}
              />

              {product.image.length > 1 && (
                <>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className='absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-all duration-300 active:scale-90'
                  >
                    <img
                      src={assets.arrow_left}
                      alt='Previous'
                      className='w-4 h-4'
                    />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-all duration-300 active:scale-90'
                  >
                    <img
                      src={assets.arrow_right}
                      alt='Next'
                      className='w-4 h-4'
                    />
                  </button>
                </>
              )}
            </div>

            {/* Dots for Mobile View */}
            <div className='flex justify-center gap-2 mt-4 sm:hidden'>
              {product.image.map((_, index) => (
                <button
                  key={index}
                  onClick={() => changeImage(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                    currentImageIndex === index
                      ? 'bg-primary'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className='text-sm w-full md:w-1/2 mt-6 md:mt-0'>
          <h1 className='text-2xl md:text-3xl font-medium'>{product.name}</h1>

          <div className='flex items-center gap-0.5 mt-1'>
            {Array(5)
              .fill('')
              .map((_, i) => (
                <img
                  key={i}
                  src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                  alt=''
                  className='w-3.5 md:w-4 transition-transform duration-200 hover:scale-110'
                />
              ))}
            <p className='text-base ml-2'>(4)</p>
          </div>

          <div className='mt-6'>
            <p className='text-gray-500/60 text-xs md:text-sm line-through'>
              {product.price.toLocaleString('pt-PT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {currency}
            </p>
            <p className='text-lg md:text-xl font-medium text-gray-700'>
              {product.offerPrice.toLocaleString('pt-PT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {currency}
            </p>
            <span className='text-gray-500/70'>(inclusive of all taxes)</span>
          </div>

          <p className='text-base font-medium mt-6'>Especificações Técnicas</p>
          <ul className='list-disc ml-4 text-gray-500/70'>
            {product.description.map((desc, index) => (
              <li
                key={index}
                className='mb-1 transition-colors duration-200 hover:text-gray-700'
              >
                {desc}
              </li>
            ))}
          </ul>

          <div className='flex items-center mt-10 gap-4 text-base'>
            <button
              onClick={() => addToCart(product._id)}
              className='w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition-all duration-300 active:scale-95'
            >
              Adicionar ao carrinho
            </button>
            <button
              onClick={() => {
                addToCart(product._id);
                navigate('/cart');
              }}
              className='w-full py-3.5 cursor-pointer font-medium bg-primary text-white hover:bg-primary-dull transition-all duration-300 active:scale-95'
            >
              Comprar agora
            </button>
          </div>
        </div>
      </div>
      {/* Related Products */}
      <div className='flex flex-col items-center mt-10'>
        <div className='flex flex-col items-center w-max'>
          <p className='text-2xl md:text-3xl font-medium'>Opção de Cores</p>
          <div className='w-20 h-0.5 bg-primary rounded-full mt-2'></div>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6 w-full'>
          {relatedProducts
            .filter(product => product.inStock)
            .map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
        </div>
        <button
          onClick={() => {
            navigate('/products');
            window.scrollTo(0, 0);
          }}
          className='mx-auto cursor-pointer px-12 my-16 py-2.5 border rounded text-primary hover:bg-primary/10 transition-all duration-300 active:scale-95'
        >
          See more
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
