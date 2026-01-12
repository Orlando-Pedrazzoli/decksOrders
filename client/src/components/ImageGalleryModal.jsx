// ImageGalleryModal.jsx - Galeria de imagens com thumbnails verticais
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { assets } from '../assets/assets';
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
 * Thumbnails verticais no desktop, dots no mobile
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

      // Handle pinch start
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
        // Handle pinch zoom
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
        case 'ArrowUp':
          goToPrevious();
          break;
        case 'ArrowDown':
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
    e.target.src = assets.placeholder_image || '/placeholder.jpg';
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

  return (
    <div
      ref={modalRef}
      className='fixed inset-0 z-[9999] bg-black/95 flex'
      onClick={handleBackdropClick}
      style={{
        touchAction: isZoomed ? 'none' : 'pan-y',
        ...customStyles.container,
      }}
    >
      {/* ============================================ */}
      {/* THUMBNAILS VERTICAIS - DESKTOP (lado esquerdo) */}
      {/* ============================================ */}
      {showThumbnails && !isZoomed && images.length > 1 && (
        <div className='hidden md:flex flex-col items-center py-4 px-2 bg-black/50 max-h-full overflow-y-auto scrollbar-hide'>
          <div className='flex flex-col gap-2'>
            {images.map((image, index) => (
              <button
                key={`thumb-${index}`}
                onClick={e => {
                  e.stopPropagation();
                  goToImage(index);
                }}
                className={`
                  flex-shrink-0 border-2 transition-all duration-200
                  overflow-hidden rounded-lg focus:outline-none
                  w-16 h-16 lg:w-20 lg:h-20
                  ${
                    currentIndex === index
                      ? 'border-white ring-2 ring-white/50 scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/50'
                  }
                `}
                aria-label={`Ir para imagem ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`Miniatura ${index + 1}`}
                  className='w-full h-full object-cover'
                  loading='lazy'
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* ÁREA PRINCIPAL DA IMAGEM */}
      {/* ============================================ */}
      <div className='flex-1 flex flex-col relative'>
        
        {/* Header com contador e botão fechar */}
        <div className='absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4'>
          {/* Contador */}
          {showCounter && images.length > 1 && (
            <div className='text-white bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium'>
              {currentIndex + 1} / {images.length}
            </div>
          )}
          
          {/* Spacer */}
          {!showCounter && <div />}
          
          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className='text-white bg-black/60 backdrop-blur-sm rounded-full w-11 h-11 flex items-center justify-center hover:bg-black/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50'
            aria-label='Fechar galeria'
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* Zoom indicator */}
        {enableZoom && isZoomed && (
          <div className='absolute top-20 left-1/2 transform -translate-x-1/2 text-white bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm z-50'>
            Zoom: {Math.round(zoomLevel * 100)}%
          </div>
        )}

        {/* Container da imagem principal */}
        <div
          ref={imageContainerRef}
          className='flex-1 flex items-center justify-center p-4 md:p-8'
          onClick={e => e.stopPropagation()}
          onTouchStart={enableSwipe ? handleTouchStart : undefined}
          onTouchMove={handleTouchMove}
          onTouchEnd={enableSwipe ? handleTouchEnd : undefined}
          onMouseDown={enableZoom ? handleDragStart : undefined}
          onMouseMove={enableZoom ? handleDragMove : undefined}
          onMouseUp={enableZoom ? handleDragEnd : undefined}
          onMouseLeave={enableZoom ? handleDragEnd : undefined}
          onWheel={enableZoom ? handleWheel : undefined}
          style={{
            cursor: isZoomed
              ? isDragging
                ? 'grabbing'
                : 'grab'
              : enableZoom
              ? 'zoom-in'
              : 'default',
          }}
        >
          {/* Loading state */}
          {isImageLoading && (
            <div className='absolute inset-0 flex items-center justify-center z-40'>
              <div className='animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent'></div>
            </div>
          )}

          {/* Imagem principal */}
          <img
            src={currentImage}
            alt={`${productName} - Imagem ${currentIndex + 1} de ${images.length}`}
            className={`
              max-w-full max-h-full object-contain select-none
              transition-all duration-300
              ${isImageLoading ? 'opacity-0' : 'opacity-100'}
            `}
            style={{
              transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
              userSelect: 'none',
              WebkitUserDrag: 'none',
              touchAction: 'none',
              willChange: isZoomed ? 'transform' : 'auto',
            }}
            onClick={enableZoom ? handleDoubleTap : undefined}
            onLoad={handleImageLoad}
            onError={handleImageError}
            draggable={false}
          />

          {/* Setas de navegação - Desktop */}
          {!isZoomed && images.length > 1 && (
            <>
              <button
                onClick={e => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className={`
                  hidden md:flex absolute left-4 top-1/2 -translate-y-1/2
                  bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg
                  hover:bg-white hover:scale-110 transition-all duration-200
                  disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
                disabled={currentIndex === 0}
                aria-label='Imagem anterior'
              >
                <svg className='w-6 h-6 text-gray-800' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                </svg>
              </button>

              <button
                onClick={e => {
                  e.stopPropagation();
                  goToNext();
                }}
                className={`
                  hidden md:flex absolute right-4 top-1/2 -translate-y-1/2
                  bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg
                  hover:bg-white hover:scale-110 transition-all duration-200
                  disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
                  focus:outline-none focus:ring-2 focus:ring-primary
                `}
                disabled={currentIndex === images.length - 1}
                aria-label='Próxima imagem'
              >
                <svg className='w-6 h-6 text-gray-800' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* ============================================ */}
        {/* DOTS MINIMALISTAS - MOBILE (em baixo) */}
        {/* ============================================ */}
        {showThumbnails && !isZoomed && images.length > 1 && (
          <div className='md:hidden flex justify-center items-center gap-2 pb-6 pt-2'>
            {images.map((_, index) => (
              <button
                key={`dot-${index}`}
                onClick={e => {
                  e.stopPropagation();
                  goToImage(index);
                }}
                className={`
                  transition-all duration-300 rounded-full
                  ${
                    currentIndex === index
                      ? 'w-8 h-2 bg-white'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                  }
                `}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Instruções - Mobile */}
        {showInstructions && isTouchDevice && !isZoomed && (
          <div className='md:hidden absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white/70 text-xs bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full animate-pulse'>
            {enableSwipe && 'Deslize para navegar'}
            {enableSwipe && enableZoom && ' • '}
            {enableZoom && 'Duplo toque para zoom'}
          </div>
        )}

        {/* Instruções - Desktop */}
        {!isTouchDevice && !isZoomed && (
          <div className='hidden md:block absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/50 text-xs bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full'>
            ← → navegar • {enableZoom && 'Duplo clique zoom • '}ESC fechar
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGalleryModal;