import '../styles/ProductDetails.css';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link, useParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';
import { SEO, ProductSchema, BreadcrumbSchema } from '../components/seo';
import toast from 'react-hot-toast';

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
  const { id, category } = useParams();
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

  // 🎯 NOVO: Estado para variante selecionada
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Estados para o modal melhorado
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

  // 🎯 CÁLCULOS DE STOCK E VARIANTES
  const hasVariants = product?.variants && product.variants.length > 0;
  
  const totalStock = useMemo(() => {
    if (!product) return 0;
    if (hasVariants) {
      return product.variants.reduce((total, v) => total + (v.stock || 0), 0);
    }
    return product.stock || 0;
  }, [product, hasVariants]);

  // Stock da variante selecionada ou stock total
  const currentStock = useMemo(() => {
    if (!product) return 0;
    if (selectedVariant && hasVariants) {
      const variant = product.variants.find(v => v._id === selectedVariant);
      return variant?.stock || 0;
    }
    return hasVariants ? totalStock : (product.stock || 0);
  }, [product, selectedVariant, hasVariants, totalStock]);

  // Imagens a exibir baseado na variante
  const displayImages = useMemo(() => {
    if (!product) return [];
    if (selectedVariant && hasVariants) {
      const variant = product.variants.find(v => v._id === selectedVariant);
      if (variant?.images && variant.images.length > 0) {
        return variant.images;
      }
    }
    return product.image;
  }, [product, selectedVariant, hasVariants]);

  // Preço da variante (se tiver preço específico)
  const currentPrice = useMemo(() => {
    if (!product) return { price: 0, offerPrice: 0 };
    if (selectedVariant && hasVariants) {
      const variant = product.variants.find(v => v._id === selectedVariant);
      if (variant?.offerPrice) {
        return {
          price: variant.price || product.price,
          offerPrice: variant.offerPrice,
        };
      }
    }
    return {
      price: product.price,
      offerPrice: product.offerPrice,
    };
  }, [product, selectedVariant, hasVariants]);

  // Variante selecionada (objeto completo)
  const selectedVariantData = useMemo(() => {
    if (!selectedVariant || !hasVariants) return null;
    return product.variants.find(v => v._id === selectedVariant);
  }, [product, selectedVariant, hasVariants]);

  // Key do carrinho
  const cartKey = selectedVariant ? `${product?._id}_${selectedVariant}` : product?._id;
  const cartQuantity = cartItems[cartKey] || 0;

  // Verificar se está inativo
  const isInactive = totalStock === 0;
  const isCurrentVariantOutOfStock = currentStock === 0;

  // Reset quando muda de produto
  useEffect(() => {
    setSelectedVariant(null);
    setCurrentImageIndex(0);
    setThumbStartIndex(0);
    setQuantity(1);
  }, [id]);

  // Auto-selecionar primeira variante com stock se todas as imagens principais estiverem vazias
  useEffect(() => {
    if (hasVariants && !selectedVariant) {
      const firstAvailable = product.variants.find(v => v.stock > 0);
      if (firstAvailable) {
        // Não auto-selecionar, deixar o usuário escolher
        // setSelectedVariant(firstAvailable._id);
      }
    }
  }, [product, hasVariants, selectedVariant]);

  // Sincronização com cartItems
  useEffect(() => {
    if (product) {
      const qty = cartItems[cartKey] || 0;
      setQuantity(Math.max(1, qty));
    }
  }, [product, cartItems, cartKey]);

  useEffect(() => {
    if (product && products.length > 0) {
      const productsCopy = [...products].filter(
        item =>
          product.category === item.category &&
          item._id !== product._id &&
          (item.stock > 0 || (item.variants && item.variants.some(v => v.stock > 0)))
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

  // 🎯 SEO
  const generateProductDescription = (product) => {
    if (!product) return '';
    const desc = Array.isArray(product.description) 
      ? product.description[0] 
      : product.description;
    return desc?.substring(0, 155) + (desc?.length > 155 ? '...' : '') || 
      `${product.name} - Compre na Elite Surfing Portugal. Envio rápido para todo Portugal.`;
  };

  const getBreadcrumbs = () => {
    if (!product) return [];
    return [
      { name: 'Home', url: '/' },
      { name: 'Produtos', url: '/products' },
      { name: product.category, url: `/products/${product.category?.toLowerCase()}` },
      { name: product.name }
    ];
  };

  // 🎯 HANDLER PARA SELEÇÃO DE COR
  const handleColorSelect = (variantId) => {
    if (variantId === selectedVariant) {
      // Deselecionar
      setSelectedVariant(null);
    } else {
      setSelectedVariant(variantId);
    }
    setCurrentImageIndex(0);
    setThumbStartIndex(0);
  };

  // Modal handlers
  const openModal = useCallback(
    index => {
      if (isInactive && !selectedVariant) return;
      setModalImageIndex(index || currentImageIndex);
      setIsModalOpen(true);
      setIsZoomed(false);
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    },
    [currentImageIndex, isInactive, selectedVariant]
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    document.body.style.overflow = 'auto';
  }, []);

  // Touch handlers
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

    if (isLeftSwipe && displayImages.length > 0) {
      const nextIndex =
        modalImageIndex < displayImages.length - 1 ? modalImageIndex + 1 : 0;
      setModalImageIndex(nextIndex);
      setCurrentImageIndex(nextIndex);
    }

    if (isRightSwipe && displayImages.length > 0) {
      const prevIndex =
        modalImageIndex > 0 ? modalImageIndex - 1 : displayImages.length - 1;
      setModalImageIndex(prevIndex);
      setCurrentImageIndex(prevIndex);
    }
  }, [touchStart, touchEnd, modalImageIndex, displayImages, isZoomed]);

  // Double tap zoom
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

  // Pinch zoom
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

  // Drag handlers
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

  // Modal navigation
  const nextModalImage = useCallback(() => {
    if (displayImages.length === 0) return;
    setIsImageLoading(true);
    const newIndex =
      modalImageIndex < displayImages.length - 1 ? modalImageIndex + 1 : 0;
    setModalImageIndex(newIndex);
    setCurrentImageIndex(newIndex);
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  }, [modalImageIndex, displayImages]);

  const prevModalImage = useCallback(() => {
    if (displayImages.length === 0) return;
    setIsImageLoading(true);
    const newIndex =
      modalImageIndex > 0 ? modalImageIndex - 1 : displayImages.length - 1;
    setModalImageIndex(newIndex);
    setCurrentImageIndex(newIndex);
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  }, [modalImageIndex, displayImages]);

  // Keyboard navigation
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

  // Scroll for mobile carousel
  useEffect(() => {
    if (imageScrollRef.current && window.innerWidth < 640) {
      const scrollContainer = imageScrollRef.current;
      const imageWidth = scrollContainer.offsetWidth;
      scrollContainer.scrollLeft = currentImageIndex * imageWidth;
    }
  }, [currentImageIndex]);

  // 🎯 QUANTITY HANDLERS COM VALIDAÇÃO DE STOCK
  const increaseQuantity = () => {
    if (isInactive || isCurrentVariantOutOfStock) return;
    
    // Verificar se tem variantes e nenhuma selecionada
    if (hasVariants && !selectedVariant) {
      toast.error('Por favor, selecione uma cor');
      return;
    }
    
    const newQuantity = quantity + 1;
    if (newQuantity > currentStock) {
      toast.error(`Apenas ${currentStock} unidade(s) disponível(eis)`);
      return;
    }
    
    setQuantity(newQuantity);
    if (cartQuantity > 0) {
      updateCartItem(cartKey, newQuantity);
    }
  };

  const decreaseQuantity = () => {
    if (isInactive || isCurrentVariantOutOfStock) return;
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      if (cartQuantity > 0) {
        updateCartItem(cartKey, newQuantity);
      }
    }
  };

  const handleAddToCart = () => {
    if (isInactive || isCurrentVariantOutOfStock) return;
    
    // Verificar se tem variantes e nenhuma selecionada
    if (hasVariants && !selectedVariant) {
      toast.error('Por favor, selecione uma cor');
      return;
    }
    
    // Verificar stock
    if (quantity > currentStock) {
      toast.error(`Apenas ${currentStock} unidade(s) disponível(eis)`);
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart(cartKey);
    }
    toast.success('Adicionado ao carrinho!');
  };

  const handleBuyNow = () => {
    if (isInactive || isCurrentVariantOutOfStock) return;
    
    // Verificar se tem variantes e nenhuma selecionada
    if (hasVariants && !selectedVariant) {
      toast.error('Por favor, selecione uma cor');
      return;
    }
    
    // Verificar stock
    if (quantity > currentStock) {
      toast.error(`Apenas ${currentStock} unidade(s) disponível(eis)`);
      return;
    }
    
    if (!cartQuantity) {
      for (let i = 0; i < quantity; i++) {
        addToCart(cartKey);
      }
    }
    navigate('/cart');
  };

  // Image navigation
  const changeImage = newIndex => {
    if (isInactive && !selectedVariant) return;
    setIsTransitioning(true);
    setCurrentImageIndex(newIndex);

    if (window.innerWidth >= 640) {
      if (newIndex >= thumbStartIndex + 5) {
        setThumbStartIndex(prev =>
          Math.min(prev + 1, Math.max(0, displayImages.length - 5))
        );
      } else if (newIndex < thumbStartIndex) {
        setThumbStartIndex(prev => Math.max(prev - 1, 0));
      }
    }

    setTimeout(() => setIsTransitioning(false), 300);
  };

  const nextImage = () => {
    if (isInactive && !selectedVariant) return;
    const newIndex = (currentImageIndex + 1) % displayImages.length;
    changeImage(newIndex);
  };

  const prevImage = () => {
    if (isInactive && !selectedVariant) return;
    const newIndex =
      (currentImageIndex - 1 + displayImages.length) % displayImages.length;
    changeImage(newIndex);
  };

  const scrollThumbsLeft = () => {
    if (isInactive && !selectedVariant) return;
    const newIndex = thumbStartIndex - 1;
    setThumbStartIndex(
      newIndex < 0 ? Math.max(0, displayImages.length - 5) : newIndex
    );
  };

  const scrollThumbsRight = () => {
    if (isInactive && !selectedVariant) return;
    const newIndex = thumbStartIndex + 1;
    setThumbStartIndex(newIndex > displayImages.length - 5 ? 0 : newIndex);
  };

  const selectThumbnail = index => {
    if (isInactive && !selectedVariant) return;
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

  // Helper para verificar cor clara
  const isLightColor = (hexColor) => {
    if (!hexColor) return false;
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.7;
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
    <>
      {/* SEO */}
      <SEO 
        title={product.name}
        description={generateProductDescription(product)}
        image={displayImages[0]}
        url={`/products/${category || product.category?.toLowerCase()}/${id}`}
        type="product"
      >
        <ProductSchema 
          product={{
            ...product,
            averageRating: reviewStats.averageRating,
            reviewCount: reviewStats.totalReviews
          }} 
        />
        <BreadcrumbSchema items={getBreadcrumbs()} />
      </SEO>

      <div className='mt-12 px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32'>
        {/* MODAL */}
        {isModalOpen && (
          <div
            className='fixed inset-0 bg-black z-50 flex items-center justify-center'
            onClick={closeModal}
            style={{ touchAction: isZoomed ? 'none' : 'pan-y' }}
          >
            <button
              className='absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-all duration-300 z-50 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center'
              onClick={closeModal}
              aria-label='Fechar'
            >
              ×
            </button>

            <div className='absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm z-50'>
              {modalImageIndex + 1} / {displayImages.length}
            </div>

            {isZoomed && (
              <div className='absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm z-50'>
                Zoom: {Math.round(zoomLevel * 100)}%
              </div>
            )}

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
              {isImageLoading && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/50 z-40'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white'></div>
                </div>
              )}

              <img
                ref={modalImageRef}
                src={displayImages[modalImageIndex]}
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

              {!isZoomed && displayImages.length > 1 && (
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

              {!isZoomed && displayImages.length > 1 && (
                <div className='absolute bottom-0 left-0 right-0 bg-black/70 p-2 sm:p-4'>
                  <div className='flex gap-2 justify-center overflow-x-auto scrollbar-hide max-w-full'>
                    {displayImages.map((image, index) => (
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
                className='flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide sm:hidden border border-gray-200 rounded-xl shadow-sm relative'
              >
                {displayImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Product image ${index + 1}`}
                    className={`w-full h-full object-contain flex-shrink-0 snap-center transition-all duration-300 ${
                      isInactive && !selectedVariant
                        ? 'blur-sm grayscale cursor-default'
                        : 'cursor-pointer'
                    }`}
                    onClick={() => !(isInactive && !selectedVariant) && openModal(index)}
                  />
                ))}

                {isInactive && !selectedVariant && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px] pointer-events-none rounded-xl'>
                    <div className='bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-2xl border-2 border-white/30 transform rotate-[-5deg] animate-pulse'>
                      INDISPONÍVEL
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Main Image */}
              <div className='relative border border-gray-200 w-full h-full rounded-xl overflow-hidden hidden sm:block shadow-sm'>
                <img
                  src={displayImages[currentImageIndex]}
                  alt='Selected product'
                  className={`w-full h-full object-contain transition-all duration-300 ${
                    isTransitioning ? 'opacity-70' : 'opacity-100'
                  } ${
                    isInactive && !selectedVariant
                      ? 'blur-sm grayscale cursor-default'
                      : 'cursor-pointer'
                  }`}
                  onClick={() => !(isInactive && !selectedVariant) && openModal(currentImageIndex)}
                />

                {isInactive && !selectedVariant && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px] rounded-xl pointer-events-none'>
                    <div className='bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-2xl border-2 border-white/30 transform rotate-[-5deg] animate-pulse'>
                      INDISPONÍVEL
                    </div>
                  </div>
                )}

                {!(isInactive && !selectedVariant) && (
                  <div className='absolute top-2 right-2 bg-black/50 text-white p-2 rounded-lg text-xs opacity-0 hover:opacity-100 transition-opacity'>
                    🔍 Clique para ampliar
                  </div>
                )}

                {!(isInactive && !selectedVariant) && displayImages.length > 1 && (
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
                {displayImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => !(isInactive && !selectedVariant) && changeImage(index)}
                    disabled={isInactive && !selectedVariant}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      currentImageIndex === index
                        ? 'bg-primary scale-110'
                        : 'bg-gray-300 hover:bg-gray-400'
                    } ${(isInactive && !selectedVariant) ? 'cursor-not-allowed opacity-50' : ''}`}
                    aria-label={`Go to image ${index + 1}`}
                  ></button>
                ))}
              </div>
            </div>

            {/* Thumbnail Carousel for Desktop */}
            {!(isInactive && !selectedVariant) && (
              <div className='hidden sm:flex justify-center'>
                <div className='flex items-center gap-2 max-w-[550px]'>
                  {displayImages.length > 5 && (
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

                  <div className='flex gap-3 overflow-hidden'>
                    {displayImages
                      .slice(thumbStartIndex, thumbStartIndex + 5)
                      .map((image, index) => (
                        <div
                          key={thumbStartIndex + index}
                          onClick={() =>
                            selectThumbnail(thumbStartIndex + index)
                          }
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

                  {displayImages.length > 5 && (
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
            )}

            {/* Accordion - Desktop */}
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

            {/* 🎯 SELETOR DE CORES */}
            {hasVariants && (
              <div className='bg-gray-50 p-4 rounded-lg'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-sm font-semibold text-gray-900'>
                    Cor: {selectedVariantData?.color || 'Selecione uma cor'}
                  </h3>
                  {selectedVariantData && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      selectedVariantData.stock > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedVariantData.stock > 0 
                        ? `${selectedVariantData.stock} em stock` 
                        : 'Esgotado'}
                    </span>
                  )}
                </div>
                
                <div className='flex items-center gap-3 flex-wrap'>
                  {product.variants.map((variant) => {
                    const variantOutOfStock = variant.stock === 0;
                    const isSelected = selectedVariant === variant._id;
                    
                    return (
                      <button
                        key={variant._id}
                        onClick={() => handleColorSelect(variant._id)}
                        title={`${variant.color}${variantOutOfStock ? ' (Esgotado)' : ` - ${variant.stock} unidades`}`}
                        className={`
                          relative w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-200
                          ${isSelected 
                            ? 'ring-4 ring-offset-2 ring-primary scale-110 shadow-lg' 
                            : 'hover:scale-105 shadow-md'
                          }
                          ${variantOutOfStock && !isSelected ? 'opacity-50' : ''}
                        `}
                        style={{ backgroundColor: variant.colorCode }}
                      >
                        {/* X para variantes esgotadas */}
                        {variantOutOfStock && (
                          <span className='absolute inset-0 flex items-center justify-center'>
                            <svg className='w-6 h-6 text-white drop-shadow-lg' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M6 18L18 6M6 6l12 12' />
                            </svg>
                          </span>
                        )}
                        {/* Check para variante selecionada */}
                        {isSelected && !variantOutOfStock && (
                          <span className='absolute inset-0 flex items-center justify-center'>
                            <svg className='w-5 h-5 text-white drop-shadow-lg' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                            </svg>
                          </span>
                        )}
                        {/* Borda para cores claras */}
                        <span 
                          className='absolute inset-0 rounded-full border-2'
                          style={{ 
                            borderColor: isLightColor(variant.colorCode) ? '#d1d5db' : 'transparent' 
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
                
                {/* Aviso se nenhuma cor selecionada */}
                {!selectedVariant && !isInactive && (
                  <p className='text-xs text-orange-600 mt-2'>
                    ⚠️ Por favor, selecione uma cor para continuar
                  </p>
                )}
              </div>
            )}

            {/* Price Section */}
            <div className='bg-gray-50 p-3 md:p-4 rounded-lg'>
              <div className='space-y-1'>
                <p className='text-gray-500 text-sm line-through'>
                  De:{' '}
                  {currentPrice.price.toLocaleString('pt-PT', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  {currency}
                </p>
                <p className='text-xl md:text-2xl font-bold text-gray-900'>
                  {currentPrice.offerPrice.toLocaleString('pt-PT', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  {currency}
                </p>
                <p className='text-xs text-gray-600'>(Impostos incluídos)</p>
              </div>
            </div>

            {/* Description - Mobile */}
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
            <div
              className={`bg-white border p-3 md:p-4 rounded-lg transition-all duration-300 ${
                isInactive || isCurrentVariantOutOfStock ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
              }`}
            >
              <div className='space-y-3'>
                {/* Stock Status */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                        isInactive || isCurrentVariantOutOfStock
                          ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                          : 'bg-green-500 shadow-lg shadow-green-500/50'
                      }`}
                    ></div>
                    <span
                      className={`text-sm font-medium transition-colors duration-300 ${
                        isInactive || isCurrentVariantOutOfStock ? 'text-red-700' : 'text-green-700'
                      }`}
                    >
                      {isInactive || isCurrentVariantOutOfStock
                        ? 'Produto Indisponível'
                        : 'Em Stock - Pronto para envio'}
                    </span>
                  </div>
                  
                  {/* 🎯 INDICADOR DE STOCK */}
                  {!isInactive && !isCurrentVariantOutOfStock && currentStock > 0 && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      currentStock <= 3 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {currentStock <= 3 
                        ? `Últimas ${currentStock} unidades!` 
                        : `${currentStock} disponíveis`}
                    </span>
                  )}
                </div>

                {/* Quantity Selector */}
                {!isInactive && !isCurrentVariantOutOfStock && (
                  <div>
                    <label className='block text-sm font-semibold text-gray-900 mb-2'>
                      Quantidade
                    </label>
                    <div className='flex items-center w-fit'>
                      <button
                        onClick={decreaseQuantity}
                        className='w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-lg hover:bg-gray-50 transition-colors duration-200 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <div className='w-16 h-10 flex items-center justify-center border-t border-b border-gray-300 bg-gray-50 text-base font-semibold'>
                        {quantity}
                      </div>
                      <button
                        onClick={increaseQuantity}
                        disabled={quantity >= currentStock}
                        className={`w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-lg hover:bg-gray-50 transition-colors duration-200 text-lg font-medium ${
                          quantity >= currentStock ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        +
                      </button>
                    </div>
                    {cartQuantity > 0 && (
                      <p className='text-xs text-primary mt-1'>
                        {cartQuantity}{' '}
                        {cartQuantity === 1 ? 'item' : 'itens'} no carrinho
                      </p>
                    )}
                    {quantity >= currentStock && (
                      <p className='text-xs text-orange-600 mt-1'>
                        Quantidade máxima disponível
                      </p>
                    )}
                  </div>
                )}

                {/* Mensagem quando indisponível */}
                {(isInactive || isCurrentVariantOutOfStock) && (
                  <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                    <p className='text-sm text-red-700 text-center'>
                      {hasVariants && !selectedVariant 
                        ? 'Selecione uma cor para ver a disponibilidade'
                        : 'Este produto está temporariamente indisponível'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className='space-y-3'>
              {isInactive || isCurrentVariantOutOfStock ? (
                <>
                  <div className='bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-5 text-center transform transition-all duration-300 hover:scale-[1.02]'>
                    <div className='flex items-center justify-center gap-3 mb-3'>
                      <svg
                        className='w-8 h-8 text-red-500 animate-pulse'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                          clipRule='evenodd'
                        />
                      </svg>
                      <span className='text-red-700 font-bold text-xl'>
                        {hasVariants && !selectedVariant 
                          ? 'SELECIONE UMA COR' 
                          : 'PRODUTO INDISPONÍVEL'}
                      </span>
                    </div>
                    <p className='text-red-600 text-sm leading-relaxed'>
                      {hasVariants && !selectedVariant 
                        ? 'Por favor, selecione uma cor disponível para adicionar ao carrinho.'
                        : 'Este produto está temporariamente indisponível. Entre em contacto connosco para saber quando voltará ao stock.'}
                    </p>
                  </div>

                  <button
                    disabled
                    className='w-full py-3.5 px-4 text-base font-semibold bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed opacity-70 flex items-center justify-center gap-2'
                  >
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                      />
                    </svg>
                    Adicionar ao Carrinho - Indisponível
                  </button>

                  <button
                    disabled
                    className='w-full py-3.5 px-4 text-base font-semibold bg-gray-400 text-gray-600 rounded-lg cursor-not-allowed opacity-70 flex items-center justify-center gap-2'
                  >
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                      />
                    </svg>
                    Comprar Agora - Indisponível
                  </button>

                  <button
                    onClick={() => navigate('/contact')}
                    className='w-full py-3 px-4 text-base font-semibold bg-primary/10 text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-300 active:scale-[0.98]'
                  >
                    Contacte-nos para Mais Informações
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={hasVariants && !selectedVariant}
                    className={`w-full py-3 px-4 text-base font-semibold rounded-lg transition-all duration-300 active:scale-[0.98] border ${
                      hasVariants && !selectedVariant
                        ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {hasVariants && !selectedVariant 
                      ? 'Selecione uma cor primeiro' 
                      : 'Adicionar ao Carrinho'}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={hasVariants && !selectedVariant}
                    className={`w-full py-3 px-4 text-base font-semibold rounded-lg transition-all duration-300 active:scale-[0.98] shadow-lg hover:shadow-xl ${
                      hasVariants && !selectedVariant
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary-dull'
                    }`}
                  >
                    {hasVariants && !selectedVariant 
                      ? 'Selecione uma cor primeiro' 
                      : 'Comprar Agora'}
                  </button>
                </>
              )}
            </div>

            {/* Additional Info */}
            <div
              className={`p-3 md:p-4 rounded-lg transition-all duration-300 ${
                isInactive || isCurrentVariantOutOfStock
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}
            >
              {isInactive || isCurrentVariantOutOfStock ? (
                <div className='space-y-2 text-center'>
                  <p className='text-red-700 font-semibold'>
                    🚫 Produto Temporariamente Indisponível
                  </p>
                  <p className='text-sm text-red-600'>
                    Entre em contacto para saber quando voltará ao stock
                  </p>
                </div>
              ) : (
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
              )}
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
            {relatedProducts.slice(0, 10).map((product, index) => (
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
    </>
  );
};

export default ProductDetails;