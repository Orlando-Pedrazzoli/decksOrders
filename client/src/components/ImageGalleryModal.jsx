// ImageGalleryModal.jsx - Componente de galeria de imagens reutilizável
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
          // Handle swipe
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

    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
  }, [
    touchStart,
    touchEnd,
    isZoomed,
    currentIndex,
    images.length,
    enableSwipe,
  ]);

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

      // Hide instructions after 3 seconds
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
      className={`
        fixed inset-0 z-[9999] bg-black flex items-center justify-center
        ${customStyles.backdrop || ''}
      `}
      onClick={handleBackdropClick}
      style={{
        touchAction: isZoomed ? 'none' : 'pan-y',
        ...customStyles.container,
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className={`
          absolute top-4 right-4 z-50 text-white text-4xl
          bg-black/50 rounded-full w-12 h-12 flex items-center justify-center
          hover:bg-black/70 transition-all duration-200 focus:outline-none
          focus:ring-2 focus:ring-white focus:ring-opacity-50
          ${customStyles.closeButton || ''}
        `}
        aria-label='Fechar galeria'
      >
        ×
      </button>

      {/* Image counter */}
      {showCounter && images.length > 1 && (
        <div
          className={`
            absolute top-4 left-4 z-50 text-white bg-black/50 
            px-3 py-1 rounded-full text-sm font-medium
            ${customStyles.counter || ''}
          `}
        >
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Zoom indicator */}
      {enableZoom && isZoomed && (
        <div className='absolute bottom-24 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm z-50'>
          Zoom: {Math.round(zoomLevel * 100)}%
        </div>
      )}

      {/* Instructions (mobile only) */}
      {showInstructions && isTouchDevice && !isZoomed && (
        <div className='absolute bottom-28 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black/50 px-3 py-1 rounded-full opacity-75 z-50 sm:hidden animate-pulse'>
          {enableSwipe && 'Deslize para navegar • '}
          {enableZoom && 'Toque duplo para zoom'}
        </div>
      )}

      {/* Main image container */}
      <div
        ref={imageContainerRef}
        className='relative w-full h-full flex items-center justify-center'
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
          <div className='absolute inset-0 flex items-center justify-center bg-black/20 z-40'>
            <div className='relative'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white'></div>
              <span className='sr-only'>Carregando imagem...</span>
            </div>
          </div>
        )}

        {/* Main image */}
        <img
          src={currentImage}
          alt={`${productName} - Imagem ${currentIndex + 1} de ${
            images.length
          }`}
          className={`
            max-w-full max-h-full object-contain select-none
            transition-transform duration-300
            ${isImageLoading ? 'opacity-0' : 'opacity-100'}
            ${customStyles.image || ''}
          `}
          style={{
            transform: `scale(${zoomLevel}) translate(${
              imagePosition.x / zoomLevel
            }px, ${imagePosition.y / zoomLevel}px)`,
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

        {/* Navigation arrows */}
        {!isZoomed && images.length > 1 && (
          <>
            <button
              onClick={e => {
                e.stopPropagation();
                goToPrevious();
              }}
              className={`
                absolute left-2 sm:left-4 top-1/2 -translate-y-1/2
                bg-white/90 rounded-full p-2 sm:p-3 shadow-lg
                hover:bg-white transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-primary
                ${currentIndex === 0 ? 'opacity-50' : ''}
                ${customStyles.navButton || ''}
              `}
              disabled={currentIndex === 0}
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
                goToNext();
              }}
              className={`
                absolute right-2 sm:right-4 top-1/2 -translate-y-1/2
                bg-white/90 rounded-full p-2 sm:p-3 shadow-lg
                hover:bg-white transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-primary
                ${currentIndex === images.length - 1 ? 'opacity-50' : ''}
                ${customStyles.navButton || ''}
              `}
              disabled={currentIndex === images.length - 1}
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

        {/* Keyboard hints (desktop only) */}
        {!isTouchDevice && !isZoomed && (
          <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black/50 px-4 py-2 rounded-lg opacity-0 hover:opacity-75 transition-opacity duration-200'>
            <span className='hidden sm:inline'>
              Use ← → para navegar •{enableZoom && ' Duplo clique para zoom • '}
              ESC para fechar
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {showThumbnails && !isZoomed && images.length > 1 && (
        <div className='absolute bottom-0 left-0 right-0 bg-black/70 p-2 sm:p-4'>
          <div className='flex gap-2 justify-center overflow-x-auto scrollbar-hide max-w-full px-4'>
            {images.map((image, index) => (
              <button
                key={`thumb-${index}`}
                onClick={e => {
                  e.stopPropagation();
                  goToImage(index);
                }}
                className={`
                  flex-shrink-0 border-2 transition-all duration-200
                  overflow-hidden rounded-md focus:outline-none focus:ring-2 
                  focus:ring-white focus:ring-opacity-50
                  ${
                    currentIndex === index
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-transparent opacity-70 hover:opacity-100 hover:border-white/50'
                  }
                  ${customStyles.thumbnail || ''}
                `}
                aria-label={`Ir para imagem ${index + 1}`}
                style={{
                  minWidth: isTouchDevice ? '48px' : '64px',
                  minHeight: isTouchDevice ? '48px' : '64px',
                }}
              >
                <img
                  src={image}
                  alt={`Miniatura ${index + 1}`}
                  className='w-12 h-12 sm:w-16 sm:h-16 object-cover'
                  loading='lazy'
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGalleryModal;
