// ImageGalleryModal.jsx - Componente de galeria de imagens reutilizável
import React, { useState, useRef, useCallback, useEffect } from 'react';
import '../styles/ProductDetails.css';

/**
 * Hook para detectar se é dispositivo touch
 */
const useIsTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);

    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  return isTouchDevice;
};

/**
 * Componente de galeria de imagens com modal
 * Suporta swipe, zoom, navegação por teclado e touch gestures
 */
const ImageGalleryModal = ({
  images = [],
  isOpen = false,
  onClose,
  initialIndex = 0,
  productName = 'Product',
  showThumbnails = true,
  showCounter = true,
  enableZoom = true,
  enableSwipe = true,
  customStyles = {},
}) => {
  const isTouchDevice = useIsTouchDevice();
  const modalRef = useRef(null);
  const imageContainerRef = useRef(null);
  const lastTap = useRef(0);
  const pinchStartDistance = useRef(0);

  // Estados principais
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Estados de touch
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;
  const maxZoomLevel = 3;
  
  // 🆕 Altura fixa da área de thumbnails
  const THUMBNAIL_AREA_HEIGHT = 110;

  // Reset zoom
  const resetZoom = useCallback(() => {
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback(
    e => {
      if (isZoomed) return;

      const touch = e.touches[0];
      setTouchEnd(null);
      setTouchStart(touch.clientX);

      if (e.touches.length === 2) {
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch.clientX,
          touch2.clientY - touch.clientY
        );
        pinchStartDistance.current = distance;
      }
    },
    [isZoomed]
  );

  // Handle touch move
  const handleTouchMove = useCallback(
    e => {
      if (e.touches.length === 2 && enableZoom) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        if (pinchStartDistance.current > 0) {
          const scale = distance / pinchStartDistance.current;
          const newZoom = Math.min(
            Math.max(1, zoomLevel * scale),
            maxZoomLevel
          );

          setZoomLevel(newZoom);
          setIsZoomed(newZoom > 1);
        }
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];

        if (!isZoomed && enableSwipe) {
          setTouchEnd(touch.clientX);
        }
      }
    },
    [isZoomed, zoomLevel, enableZoom, enableSwipe]
  );

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    pinchStartDistance.current = 0;

    if (!touchStart || !touchEnd || isZoomed || !enableSwipe) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < images.length - 1) {
      goToNext();
    } else if (isRightSwipe && currentIndex > 0) {
      goToPrevious();
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, isZoomed, currentIndex, images.length, enableSwipe]);

  // Handle double tap for zoom
  const handleDoubleTap = useCallback(
    e => {
      if (!enableZoom) return;

      const currentTime = Date.now();
      const tapLength = currentTime - lastTap.current;

      if (tapLength < 300 && tapLength > 0) {
        e.preventDefault();

        if (isZoomed) {
          resetZoom();
        } else {
          setIsZoomed(true);
          setZoomLevel(2);
        }
      }

      lastTap.current = currentTime;
    },
    [isZoomed, enableZoom, resetZoom]
  );

  // Handle wheel zoom
  const handleWheel = useCallback(
    e => {
      if (!enableZoom) return;

      e.preventDefault();

      const delta = e.deltaY * -0.01;
      const newZoom = Math.min(Math.max(1, zoomLevel + delta), maxZoomLevel);

      setZoomLevel(newZoom);
      setIsZoomed(newZoom > 1);

      if (newZoom === 1) {
        setImagePosition({ x: 0, y: 0 });
      }
    },
    [zoomLevel, enableZoom]
  );

  // Handle drag start
  const handleDragStart = useCallback(
    e => {
      if (!isZoomed || !enableZoom) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      setIsDragging(true);
      setDragStart({
        x: clientX - imagePosition.x,
        y: clientY - imagePosition.y,
      });
    },
    [isZoomed, imagePosition, enableZoom]
  );

  // Handle drag move
  const handleDragMove = useCallback(
    e => {
      if (!isDragging || !isZoomed || !enableZoom) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      setImagePosition({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y,
      });
    },
    [isDragging, isZoomed, dragStart, enableZoom]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Navigate to next image
  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsImageLoading(true);
      resetZoom();
    }
  }, [currentIndex, images.length, resetZoom]);

  // Navigate to previous image
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsImageLoading(true);
      resetZoom();
    }
  }, [currentIndex, resetZoom]);

  // Go to specific image
  const goToImage = useCallback(
    index => {
      if (index >= 0 && index < images.length) {
        setCurrentIndex(index);
        setIsImageLoading(true);
        resetZoom();
      }
    },
    [images.length, resetZoom]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = e => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          if (isZoomed) {
            resetZoom();
          } else {
            onClose?.();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToNext, goToPrevious, resetZoom, isZoomed, onClose]);

  // Initialize modal
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        setShowInstructions(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = 'auto';
      resetZoom();
    }
  }, [isOpen, initialIndex, resetZoom]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setIsImageLoading(false);
  }, []);

  // Handle image error
  const handleImageError = useCallback(e => {
    e.target.src = '/placeholder.jpg';
    setIsImageLoading(false);
  }, []);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    e => {
      if (e.target === e.currentTarget && !isZoomed) {
        onClose?.();
      }
    },
    [isZoomed, onClose]
  );

  // Prevent scroll on touch devices when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const preventScroll = e => {
      if (modalRef.current?.contains(e.target)) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventScroll);
  }, [isOpen]);

  if (!isOpen || !images.length) return null;

  const currentImage = images[currentIndex] || '';
  const hasThumbnails = showThumbnails && images.length > 1;

  return (
    <div
      ref={modalRef}
      className='fixed inset-0 z-[9999] bg-black flex flex-col'
      onClick={handleBackdropClick}
      style={{
        touchAction: isZoomed ? 'none' : 'pan-y',
        ...customStyles.container,
      }}
    >
      {/* ========== HEADER: Contador + Botão Fechar ========== */}
      <div className='absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4'>
        {/* Image counter */}
        {showCounter && images.length > 1 ? (
          <div className='text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium'>
            {currentIndex + 1} / {images.length}
          </div>
        ) : (
          <div />
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className='text-white bg-black/50 rounded-full w-11 h-11 flex items-center justify-center hover:bg-black/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50'
          aria-label='Fechar galeria'
        >
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>
      </div>

      {/* Zoom indicator */}
      {enableZoom && isZoomed && (
        <div className='absolute top-16 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm z-50'>
          Zoom: {Math.round(zoomLevel * 100)}%
        </div>
      )}

      {/* Instructions (mobile only) */}
      {showInstructions && isTouchDevice && !isZoomed && (
        <div className='absolute top-16 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black/50 px-3 py-1 rounded-full opacity-75 z-50 sm:hidden animate-pulse'>
          {enableSwipe && 'Deslize para navegar • '}
          {enableZoom && 'Toque duplo para zoom'}
        </div>
      )}

      {/* ========== ÁREA PRINCIPAL DA IMAGEM ========== */}
      {/* 🆕 Com padding-bottom para não sobrepor as thumbnails */}
      <div
        ref={imageContainerRef}
        className='flex-1 relative flex items-center justify-center px-4 sm:px-12 pt-16'
        style={{
          paddingBottom: hasThumbnails && !isZoomed ? `${THUMBNAIL_AREA_HEIGHT + 16}px` : '16px',
        }}
        onClick={e => e.stopPropagation()}
        onTouchStart={enableSwipe ? handleTouchStart : undefined}
        onTouchMove={handleTouchMove}
        onTouchEnd={enableSwipe ? handleTouchEnd : undefined}
        onMouseDown={enableZoom ? handleDragStart : undefined}
        onMouseMove={enableZoom ? handleDragMove : undefined}
        onMouseUp={enableZoom ? handleDragEnd : undefined}
        onMouseLeave={enableZoom ? handleDragEnd : undefined}
        onWheel={enableZoom ? handleWheel : undefined}
      >
        {/* Loading state */}
        {isImageLoading && (
          <div className='absolute inset-0 flex items-center justify-center z-40'>
            <div className='animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent'></div>
          </div>
        )}

        {/* Main image */}
        <img
          src={currentImage}
          alt={`${productName} - Imagem ${currentIndex + 1} de ${images.length}`}
          className={`max-w-full max-h-full object-contain select-none transition-all duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{
            transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
            cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : (enableZoom ? 'zoom-in' : 'default'),
            userSelect: 'none',
            touchAction: 'none',
            willChange: isZoomed ? 'transform' : 'auto',
          }}
          onClick={enableZoom ? handleDoubleTap : undefined}
          onLoad={handleImageLoad}
          onError={handleImageError}
          draggable={false}
        />

        {/* ========== SETAS DE NAVEGAÇÃO (IGUAIS) ========== */}
        {!isZoomed && images.length > 1 && (
          <>
            {/* Seta Esquerda */}
            <button
              onClick={e => {
                e.stopPropagation();
                goToPrevious();
              }}
              disabled={currentIndex === 0}
              className='absolute left-2 sm:left-4 bg-white/90 rounded-full p-2 sm:p-3 shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-white'
              style={{
                top: hasThumbnails ? `calc(50% - ${THUMBNAIL_AREA_HEIGHT / 2}px)` : '50%',
                transform: 'translateY(-50%)',
              }}
              aria-label='Imagem anterior'
            >
              <svg className='w-5 h-5 sm:w-6 sm:h-6 text-gray-800' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M15 19l-7-7 7-7' />
              </svg>
            </button>

            {/* Seta Direita */}
            <button
              onClick={e => {
                e.stopPropagation();
                goToNext();
              }}
              disabled={currentIndex === images.length - 1}
              className='absolute right-2 sm:right-4 bg-white/90 rounded-full p-2 sm:p-3 shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-white'
              style={{
                top: hasThumbnails ? `calc(50% - ${THUMBNAIL_AREA_HEIGHT / 2}px)` : '50%',
                transform: 'translateY(-50%)',
              }}
              aria-label='Próxima imagem'
            >
              <svg className='w-5 h-5 sm:w-6 sm:h-6 text-gray-800' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M9 5l7 7-7 7' />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* ========== THUMBNAILS (em baixo, com fundo) ========== */}
      {hasThumbnails && !isZoomed && (
        <div 
          className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent flex items-center justify-center'
          style={{ height: `${THUMBNAIL_AREA_HEIGHT}px` }}
        >
          <div className='flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide px-4 py-3'>
            {images.map((image, index) => (
              <button
                key={`thumb-${index}`}
                onClick={e => {
                  e.stopPropagation();
                  goToImage(index);
                }}
                className={`flex-shrink-0 border-2 transition-all duration-200 overflow-hidden rounded-lg focus:outline-none ${
                  currentIndex === index
                    ? 'border-white scale-105 shadow-lg shadow-white/30'
                    : 'border-transparent opacity-50 hover:opacity-100 hover:border-white/50'
                }`}
                aria-label={`Ir para imagem ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`Miniatura ${index + 1}`}
                  className='w-16 h-16 sm:w-20 sm:h-20 object-cover'
                  loading='lazy'
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard hints (desktop only) */}
      {!isTouchDevice && !isZoomed && (
        <div 
          className='hidden sm:block absolute left-1/2 transform -translate-x-1/2 text-white/60 text-xs bg-black/40 px-4 py-2 rounded-full'
          style={{ bottom: hasThumbnails ? `${THUMBNAIL_AREA_HEIGHT + 8}px` : '16px' }}
        >
          ← → navegar • {enableZoom && 'Duplo clique zoom • '}ESC fechar
        </div>
      )}
    </div>
  );
};

export default ImageGalleryModal;