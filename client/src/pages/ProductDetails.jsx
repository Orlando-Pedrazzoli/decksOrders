import '../styles/ProductDetails.css';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link, useParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';

const ProductDetails = () => {
  const {
    products,
    navigate,
    currency,
    addToCart,
    cartItems,
    updateCartItem,
    axios,
  } = useAppContext();
  const { id } = useParams();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbStartIndex, setThumbStartIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    loading: true,
  });

  // 🎯 NOVO: Estados para o modal melhorado
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isImageLoading, setIsImageLoading] = useState(false);

  const imageScrollRef = useRef(null);
  const modalRef = useRef(null);
  const modalImageRef = useRef(null);
  const pinchStartDistance = useRef(0);

  const product = products.find(item => item._id === id);

  // Sincronização com cartItems
  useEffect(() => {
    if (product) {
      const cartQuantity = cartItems[product._id] || 0;
      setQuantity(Math.max(1, cartQuantity));
    }
  }, [product, cartItems]);

  useEffect(() => {
    if (product && products.length > 0) {
      const productsCopy = [...products].filter(
        item => product.category === item.category && item._id !== product._id
      );
      setRelatedProducts(productsCopy);
    }
  }, [products, product]);

  // Buscar estatísticas de reviews
  useEffect(() => {
    if (product?._id) {
      fetchReviewStats();
    }
  }, [product]);

  const fetchReviewStats = async () => {
    try {
      setReviewStats(prev => ({ ...prev, loading: true }));

      const response = await axios.get(
        `/api/reviews/product/${product._id}?page=1&limit=1`
      );

      if (response.data.success) {
        setReviewStats({
          averageRating: response.data.stats.averageRating || 0,
          totalReviews: response.data.stats.totalReviews || 0,
          loading: false,
        });
      } else {
        setReviewStats({
          averageRating: 0,
          totalReviews: 0,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de reviews:', error);
      setReviewStats({
        averageRating: 0,
        totalReviews: 0,
        loading: false,
      });
    }
  };

  // 🎯 NOVO: Abrir modal com índice correto
  const openModal = useCallback(
    index => {
      setModalImageIndex(index || currentImageIndex);
      setIsModalOpen(true);
      setIsZoomed(false);
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden'; // Previne scroll do body
    },
    [currentImageIndex]
  );

  // 🎯 NOVO: Fechar modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    document.body.style.overflow = 'auto';
  }, []);

  // 🎯 NOVO: Handlers de touch para swipe
  const minSwipeDistance = 50;

  const onTouchStart = useCallback(
    e => {
      if (isZoomed) return;
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    },
    [isZoomed]
  );

  const onTouchMove = useCallback(
    e => {
      if (isZoomed) return;
      setTouchEnd(e.targetTouches[0].clientX);
    },
    [isZoomed]
  );

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || isZoomed) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && product) {
      // Swipe left - próxima imagem
      const nextIndex =
        modalImageIndex < product.image.length - 1 ? modalImageIndex + 1 : 0;
      setModalImageIndex(nextIndex);
      setCurrentImageIndex(nextIndex);
    }

    if (isRightSwipe && product) {
      // Swipe right - imagem anterior
      const prevIndex =
        modalImageIndex > 0 ? modalImageIndex - 1 : product.image.length - 1;
      setModalImageIndex(prevIndex);
      setCurrentImageIndex(prevIndex);
    }
  }, [touchStart, touchEnd, modalImageIndex, product, isZoomed]);

  // 🎯 NOVO: Double tap para zoom
  const lastTap = useRef(0);
  const handleDoubleTap = useCallback(
    e => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap.current;

      if (tapLength < 300 && tapLength > 0) {
        e.preventDefault();
        if (isZoomed) {
          setIsZoomed(false);
          setZoomLevel(1);
          setImagePosition({ x: 0, y: 0 });
        } else {
          setIsZoomed(true);
          setZoomLevel(2);
        }
      }
      lastTap.current = currentTime;
    },
    [isZoomed]
  );

  // 🎯 NOVO: Pinch to zoom para mobile
  const handlePinch = useCallback(
    e => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        if (pinchStartDistance.current === 0) {
          pinchStartDistance.current = distance;
        } else {
          const scale = distance / pinchStartDistance.current;
          const newZoomLevel = Math.min(Math.max(1, zoomLevel * scale), 3);
          setZoomLevel(newZoomLevel);
          setIsZoomed(newZoomLevel > 1);
        }
      }
    },
    [zoomLevel]
  );

  const handlePinchEnd = useCallback(() => {
    pinchStartDistance.current = 0;
  }, []);

  // 🎯 NOVO: Arrastar imagem com zoom
  const handleMouseDown = useCallback(
    e => {
      if (!isZoomed) return;
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      });
    },
    [isZoomed, imagePosition]
  );

  const handleMouseMove = useCallback(
    e => {
      if (!isDragging || !isZoomed) return;
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, isZoomed, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Navegação do modal
  const nextModalImage = useCallback(() => {
    if (!product) return;
    setIsImageLoading(true);
    const newIndex =
      modalImageIndex < product.image.length - 1 ? modalImageIndex + 1 : 0;
    setModalImageIndex(newIndex);
    setCurrentImageIndex(newIndex);
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  }, [modalImageIndex, product]);

  const prevModalImage = useCallback(() => {
    if (!product) return;
    setIsImageLoading(true);
    const newIndex =
      modalImageIndex > 0 ? modalImageIndex - 1 : product.image.length - 1;
    setModalImageIndex(newIndex);
    setCurrentImageIndex(newIndex);
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  }, [modalImageIndex, product]);

  // Navegação com teclado
  useEffect(() => {
    const handleKeyDown = e => {
      if (!isModalOpen) return;

      if (e.key === 'ArrowLeft') {
        prevModalImage();
      } else if (e.key === 'ArrowRight') {
        nextModalImage();
      } else if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isModalOpen, nextModalImage, prevModalImage, closeModal]);

  // Scroll programático para o carousel mobile principal
  useEffect(() => {
    if (imageScrollRef.current && window.innerWidth < 640) {
      const scrollContainer = imageScrollRef.current;
      const imageWidth = scrollContainer.offsetWidth;
      scrollContainer.scrollLeft = currentImageIndex * imageWidth;
    }
  }, [currentImageIndex]);

  const increaseQuantity = () => {
    const currentCartQuantity = cartItems[product._id] || 0;
    const newQuantity = Math.max(1, currentCartQuantity) + 1;
    setQuantity(newQuantity);
    updateCartItem(product._id, newQuantity);
  };

  const decreaseQuantity = () => {
    const currentCartQuantity = cartItems[product._id] || 0;
    if (currentCartQuantity > 1) {
      const newQuantity = currentCartQuantity - 1;
      setQuantity(newQuantity);
      updateCartItem(product._id, newQuantity);
    }
  };

  const handleAddToCart = () => {
    addToCart(product._id);
  };

  const handleBuyNow = () => {
    if (!cartItems[product._id]) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product._id);
      }
    }
    navigate('/cart');
  };

  const changeImage = newIndex => {
    setIsTransitioning(true);
    setCurrentImageIndex(newIndex);

    if (window.innerWidth >= 640) {
      if (newIndex >= thumbStartIndex + 5) {
        setThumbStartIndex(prev =>
          Math.min(prev + 1, Math.max(0, product.image.length - 5))
        );
      } else if (newIndex < thumbStartIndex) {
        setThumbStartIndex(prev => Math.max(prev - 1, 0));
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

  const scrollThumbsLeft = () => {
    const newIndex = thumbStartIndex - 1;
    setThumbStartIndex(
      newIndex < 0 ? Math.max(0, product.image.length - 5) : newIndex
    );
  };

  const scrollThumbsRight = () => {
    const newIndex = thumbStartIndex + 1;
    setThumbStartIndex(newIndex > product.image.length - 5 ? 0 : newIndex);
  };

  const selectThumbnail = index => {
    changeImage(index);
  };

  const handleImageScroll = ref => {
    if (ref.current) {
      const scrollContainer = ref.current;
      const imageWidth = scrollContainer.offsetWidth;
      const newIndex = Math.round(scrollContainer.scrollLeft / imageWidth);

      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex);
      }
    }
  };

  if (!product) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-gray-600'>Carregando produto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='mt-12 px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32'>
      {/* 🎯 MODAL MELHORADO COM SWIPE, ZOOM E GESTURES */}
      {isModalOpen && (
        <div
          className='fixed inset-0 bg-black z-50 flex items-center justify-center'
          onClick={closeModal}
          style={{ touchAction: isZoomed ? 'none' : 'pan-y' }}
        >
          {/* Close button */}
          <button
            className='absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-all duration-300 z-50 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center'
            onClick={closeModal}
            aria-label='Fechar'
          >
            ×
          </button>

          {/* Image counter */}
          <div className='absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm z-50'>
            {modalImageIndex + 1} / {product.image.length}
          </div>

          {/* Zoom indicator */}
          {isZoomed && (
            <div className='absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm z-50'>
              Zoom: {Math.round(zoomLevel * 100)}%
            </div>
          )}

          {/* Main image container */}
          <div
            className='relative w-full h-full flex items-center justify-center'
            onClick={e => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={e => {
              onTouchMove(e);
              if (e.touches.length === 2) handlePinch(e);
            }}
            onTouchEnd={e => {
              onTouchEnd();
              handlePinchEnd();
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Loading spinner */}
            {isImageLoading && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/50 z-40'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white'></div>
              </div>
            )}

            {/* Product image */}
            <img
              ref={modalImageRef}
              src={product.image[modalImageIndex]}
              alt={`${product.name} - Imagem ${modalImageIndex + 1}`}
              className='max-w-full max-h-full object-contain transition-transform duration-300'
              style={{
                transform: `scale(${zoomLevel}) translate(${
                  imagePosition.x / zoomLevel
                }px, ${imagePosition.y / zoomLevel}px)`,
                cursor: isZoomed
                  ? isDragging
                    ? 'grabbing'
                    : 'grab'
                  : 'pointer',
                userSelect: 'none',
                WebkitUserDrag: 'none',
                touchAction: 'none',
              }}
              onClick={handleDoubleTap}
              onLoad={() => setIsImageLoading(false)}
              draggable={false}
            />

            {/* Navigation arrows - hidden when zoomed */}
            {!isZoomed && product.image.length > 1 && (
              <>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    prevModalImage();
                  }}
                  className='absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 sm:p-3 shadow-lg hover:bg-white transition-all duration-300 active:scale-90'
                  aria-label='Imagem anterior'
                >
                  <img
                    src={assets.arrow_left}
                    alt=''
                    className='w-4 h-4 sm:w-5 sm:h-5'
                  />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    nextModalImage();
                  }}
                  className='absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 sm:p-3 shadow-lg hover:bg-white transition-all duration-300 active:scale-90'
                  aria-label='Próxima imagem'
                >
                  <img
                    src={assets.arrow_right}
                    alt=''
                    className='w-4 h-4 sm:w-5 sm:h-5'
                  />
                </button>
              </>
            )}

            {/* Thumbnail strip at bottom */}
            {!isZoomed && product.image.length > 1 && (
              <div className='absolute bottom-0 left-0 right-0 bg-black/70 p-2 sm:p-4'>
                <div className='flex gap-2 justify-center overflow-x-auto scrollbar-hide max-w-full'>
                  {product.image.map((image, index) => (
                    <button
                      key={index}
                      onClick={e => {
                        e.stopPropagation();
                        setModalImageIndex(index);
                        setCurrentImageIndex(index);
                        setIsImageLoading(true);
                      }}
                      className={`flex-shrink-0 border-2 transition-all duration-300 ${
                        modalImageIndex === index
                          ? 'border-white scale-110'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className='w-12 h-12 sm:w-16 sm:h-16 object-cover'
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instructions for mobile */}
          {!isZoomed && (
            <div className='absolute bottom-24 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black/50 px-3 py-1 rounded-full opacity-75 sm:hidden'>
              Deslize ou toque duplo para zoom
            </div>
          )}
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className='text-sm md:text-base mb-6'>
        <Link
          to={'/'}
          className='hover:text-primary transition-colors duration-200'
        >
          Home
        </Link>
        <span className='mx-2 text-gray-400'>/</span>
        <Link
          to={'/products'}
          className='hover:text-primary transition-colors duration-200'
        >
          Products
        </Link>
        <span className='mx-2 text-gray-400'>/</span>
        <Link
          to={`/products/${product.category.toLowerCase()}`}
          className='hover:text-primary transition-colors duration-200'
        >
          {product.category}
        </Link>
        <span className='mx-2 text-gray-400'>/</span>
        <span className='text-primary font-medium'>{product.name}</span>
      </nav>

      {/* Product Content */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16'>
        {/* Images Section */}
        <div className='flex flex-col gap-4'>
          {/* Main Image Container */}
          <div className='relative w-full max-w-[450px] h-[350px] sm:h-[450px] mx-auto'>
            {/* Mobile Carousel */}
            <div
              ref={imageScrollRef}
              onScroll={() => handleImageScroll(imageScrollRef)}
              className='flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide sm:hidden border border-gray-200 rounded-xl shadow-sm'
            >
              {product.image.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className='w-full h-full object-contain flex-shrink-0 snap-center cursor-pointer'
                  onClick={() => openModal(index)}
                />
              ))}
            </div>

            {/* Desktop Main Image */}
            <div className='relative border border-gray-200 w-full h-full rounded-xl overflow-hidden hidden sm:block shadow-sm'>
              <img
                src={product.image[currentImageIndex]}
                alt='Selected product'
                className={`w-full h-full object-contain cursor-pointer transition-opacity duration-300 ${
                  isTransitioning ? 'opacity-70' : 'opacity-100'
                }`}
                onClick={() => openModal(currentImageIndex)}
              />

              {/* Zoom hint */}
              <div className='absolute top-2 right-2 bg-black/50 text-white p-2 rounded-lg text-xs opacity-0 hover:opacity-100 transition-opacity'>
                🔍 Clique para ampliar
              </div>

              {/* Desktop Navigation Arrows */}
              {product.image.length > 1 && (
                <>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-3 shadow-lg hover:bg-white transition-all duration-300 active:scale-90'
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
                    className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-3 shadow-lg hover:bg-white transition-all duration-300 active:scale-90'
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

            {/* Mobile Dots */}
            <div className='flex justify-center gap-2 mt-4 sm:hidden'>
              {product.image.map((_, index) => (
                <button
                  key={index}
                  onClick={() => changeImage(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    currentImageIndex === index
                      ? 'bg-primary scale-110'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>

          {/* Horizontal Thumbnail Carousel for Desktop */}
          <div className='hidden sm:flex justify-center'>
            <div className='flex items-center gap-2 max-w-[550px]'>
              {/* Left Arrow */}
              {product.image.length > 5 && (
                <button
                  onClick={scrollThumbsLeft}
                  className='p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 active:scale-90 flex-shrink-0'
                >
                  <img
                    src={assets.arrow_left}
                    alt='Previous'
                    className='w-4 h-4'
                  />
                </button>
              )}

              {/* Thumbnail Container */}
              <div className='flex gap-3 overflow-hidden'>
                {product.image
                  .slice(thumbStartIndex, thumbStartIndex + 5)
                  .map((image, index) => (
                    <div
                      key={thumbStartIndex + index}
                      onClick={() => selectThumbnail(thumbStartIndex + index)}
                      className={`border-2 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 flex-shrink-0 ${
                        currentImageIndex === thumbStartIndex + index
                          ? 'border-primary scale-105 shadow-lg'
                          : 'border-gray-300 hover:scale-105 hover:border-gray-400'
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

              {/* Right Arrow */}
              {product.image.length > 5 && (
                <button
                  onClick={scrollThumbsRight}
                  className='p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 active:scale-90 flex-shrink-0'
                >
                  <img
                    src={assets.arrow_right}
                    alt='Next'
                    className='w-4 h-4'
                  />
                </button>
              )}
            </div>
          </div>

          {/* Accordion below horizontal carousel */}
          <div className='hidden sm:flex justify-center'>
            <div className='w-full max-w-[550px]'>
              <button
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                className='flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200'
              >
                <h3 className='text-base md:text-lg font-semibold text-gray-900'>
                  Especificações Técnicas
                </h3>
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                    isDescriptionOpen ? 'rotate-180' : ''
                  }`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </button>
              {isDescriptionOpen && (
                <div className='mt-3 p-3 border border-gray-200 rounded-lg bg-white'>
                  <ul className='space-y-2'>
                    {product.description.map((desc, index) => (
                      <li
                        key={index}
                        className='flex items-start gap-2 text-gray-700 text-sm'
                      >
                        <span className='text-primary mt-1 text-xs'>●</span>
                        <span className='leading-relaxed'>{desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className='space-y-4'>
          {/* Product Title */}
          <div>
            <h1 className='text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight'>
              {product.name}
            </h1>

            {/* Rating */}
            <div className='flex items-center gap-2 mt-2'>
              <div className='flex items-center gap-1'>
                {reviewStats.loading ? (
                  <div className='flex gap-1'>
                    {Array(5)
                      .fill('')
                      .map((_, i) => (
                        <div
                          key={i}
                          className='w-4 h-4 bg-gray-200 rounded animate-pulse'
                        ></div>
                      ))}
                  </div>
                ) : (
                  <div className='flex text-yellow-500 text-lg'>
                    {Array(5)
                      .fill('')
                      .map((_, i) => (
                        <span
                          key={i}
                          className='transition-transform duration-200 hover:scale-110'
                        >
                          {i < Math.round(reviewStats.averageRating)
                            ? '★'
                            : '☆'}
                        </span>
                      ))}
                  </div>
                )}
              </div>
              {reviewStats.loading ? (
                <div className='w-12 h-4 bg-gray-200 rounded animate-pulse'></div>
              ) : (
                <span className='text-gray-600 text-sm'>
                  {reviewStats.totalReviews > 0
                    ? `(${reviewStats.averageRating.toFixed(1)}) ${
                        reviewStats.totalReviews
                      } ${
                        reviewStats.totalReviews === 1 ? 'review' : 'reviews'
                      }`
                    : '(Sem reviews)'}
                </span>
              )}
            </div>
          </div>

          {/* Price Section */}
          <div className='bg-gray-50 p-3 md:p-4 rounded-lg'>
            <div className='space-y-1'>
              <p className='text-gray-500 text-sm line-through'>
                De:{' '}
                {product.price.toLocaleString('pt-PT', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {currency}
              </p>
              <p className='text-xl md:text-2xl font-bold text-gray-900'>
                {product.offerPrice.toLocaleString('pt-PT', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {currency}
              </p>
              <p className='text-xs text-gray-600'>(Impostos incluídos)</p>
            </div>
          </div>

          {/* Product Description - Mobile/Tablet only */}
          <div className='sm:hidden'>
            <button
              onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
              className='flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200'
            >
              <h3 className='text-base md:text-lg font-semibold text-gray-900'>
                Especificações Técnicas
              </h3>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                  isDescriptionOpen ? 'rotate-180' : ''
                }`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </button>
            {isDescriptionOpen && (
              <div className='mt-3 p-3 border border-gray-200 rounded-lg bg-white'>
                <ul className='space-y-2'>
                  {product.description.map((desc, index) => (
                    <li
                      key={index}
                      className='flex items-start gap-2 text-gray-700 text-sm'
                    >
                      <span className='text-primary mt-1 text-xs'>●</span>
                      <span className='leading-relaxed'>{desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className='bg-white border border-gray-200 p-3 md:p-4 rounded-lg'>
            <div className='space-y-3'>
              {/* Stock Status */}
              <div className='flex items-center gap-2'>
                <div className='w-2.5 h-2.5 bg-green-500 rounded-full'></div>
                <span className='text-sm text-gray-700 font-medium'>
                  Em Stock - Pronto para envio
                </span>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>
                  Quantidade
                </label>
                <div className='flex items-center w-fit'>
                  <button
                    onClick={decreaseQuantity}
                    className='w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-lg hover:bg-gray-50 transition-colors duration-200 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                    disabled={quantity <= 1 && !cartItems[product._id]}
                  >
                    −
                  </button>
                  <div className='w-16 h-10 flex items-center justify-center border-t border-b border-gray-300 bg-gray-50 text-base font-semibold'>
                    {quantity}
                  </div>
                  <button
                    onClick={increaseQuantity}
                    className='w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-lg hover:bg-gray-50 transition-colors duration-200 text-lg font-medium'
                  >
                    +
                  </button>
                </div>
                {cartItems[product._id] && (
                  <p className='text-xs text-primary mt-1'>
                    {cartItems[product._id]}{' '}
                    {cartItems[product._id] === 1 ? 'item' : 'itens'} no
                    carrinho
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='space-y-3'>
            <button
              onClick={handleAddToCart}
              className='w-full py-3 px-4 text-base font-semibold bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all duration-300 active:scale-[0.98] border border-gray-200'
            >
              Adicionar ao Carrinho
            </button>

            <button
              onClick={handleBuyNow}
              className='w-full py-3 px-4 text-base font-semibold bg-primary text-white rounded-lg hover:bg-primary-dull transition-all duration-300 active:scale-[0.98] shadow-lg hover:shadow-xl'
            >
              Comprar Agora
            </button>
          </div>

          {/* Additional Info */}
          <div className='bg-blue-50 p-3 md:p-4 rounded-lg'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <div className='w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center'>
                  <span className='text-white text-xs'>✓</span>
                </div>
                <span className='text-xs md:text-sm text-gray-700'>
                  Envio grátis para Portugal Continental
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center'>
                  <span className='text-white text-xs'>✓</span>
                </div>
                <span className='text-xs md:text-sm text-gray-700'>
                  Garantia de 24 meses
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center'>
                  <span className='text-white text-xs'>✓</span>
                </div>
                <span className='text-xs md:text-sm text-gray-700'>
                  Devolução gratuita em 30 dias
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className='mt-16'>
        <ProductReviews productId={product._id} />
      </div>

      {/* Related Products */}
      <div className='mt-20'>
        <div className='text-center mb-12'>
          <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4'>
            Produtos Relacionados
          </h2>
          <div className='w-20 h-1 bg-primary rounded-full mx-auto'></div>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6'>
          {relatedProducts
            .filter(product => product.inStock)
            .slice(0, 10)
            .map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
        </div>

        {relatedProducts.length > 10 && (
          <div className='text-center mt-12'>
            <button
              onClick={() => {
                navigate('/products');
                window.scrollTo(0, 0);
              }}
              className='inline-flex items-center px-8 py-3 border border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 font-medium'
            >
              Ver Mais Produtos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
