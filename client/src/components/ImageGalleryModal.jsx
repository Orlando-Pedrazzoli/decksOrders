// ImageGalleryModal.jsx - Componente de galeria de imagens reutilizável
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  useImageGestures,
  useIsTouchDevice,
  useImageLazyLoad,
} from '../hooks/useImageGestures';
import { assets } from '../assets/assets';
import '../styles/ProductDetails.css';

/**
 * Componente de galeria de imagens com modal
 * Suporta swipe, zoom, navegação por teclado e touch gestures
 *
 * @param {Object} props
 * @param {Array} props.images - Array de URLs das imagens
 * @param {boolean} props.isOpen - Estado do modal (aberto/fechado)
 * @param {Function} props.onClose - Callback para fechar o modal
 * @param {number} props.initialIndex - Índice inicial da imagem
 * @param {string} props.productName - Nome do produto para alt text
 * @param {boolean} props.showThumbnails - Mostrar thumbnails no modal
 * @param {boolean} props.showCounter - Mostrar contador de imagens
 * @param {boolean} props.enableZoom - Habilitar zoom
 * @param {boolean} props.enableSwipe - Habilitar swipe em mobile
 * @param {Object} props.customStyles - Estilos customizados
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

  // Estados locais
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Lazy loading de imagens
  const { preloadSurroundingImages, isImageLoaded, isImageLoading } =
    useImageLazyLoad(images, 2);

  // Gestures hook
  const {
    currentIndex,
    isZoomed,
    zoomLevel,
    imagePosition,
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleDoubleTap,
    handleWheel,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    goToNext,
    goToPrevious,
    goToImage,
    resetZoom,
    setCurrentIndex,
  } = useImageGestures({
    totalImages: images.length,
    onImageChange: index => {
      setIsImageLoading(true);
      preloadSurroundingImages(index);
    },
    onZoomChange: (zoomed, level) => {
      if (zoomed && showInstructions) {
        setShowInstructions(false);
      }
    },
  });

  // Sincronizar com initialIndex
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      preloadSurroundingImages(initialIndex);
      document.body.style.overflow = 'hidden';

      // Ocultar instruções após 3 segundos
      const timer = setTimeout(() => {
        setShowInstructions(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = 'auto';
      resetZoom();
    }
  }, [
    isOpen,
    initialIndex,
    setCurrentIndex,
    resetZoom,
    preloadSurroundingImages,
  ]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isOpen) {
        if (isZoomed) {
          resetZoom();
        } else {
          onClose?.();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isZoomed, onClose, resetZoom]);

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
  const imageLoadingState = isImageLoading(currentImage) || isImageLoading;

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
        onTouchMove={enableSwipe ? handleTouchMove : undefined}
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
        {imageLoadingState && (
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
            transition-transform duration-300 gpu-accelerated
            ${imageLoadingState ? 'opacity-0' : 'opacity-100 image-loading'}
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
                hover:bg-white transition-all duration-200 nav-button
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
                hover:bg-white transition-all duration-200 nav-button
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
        <div className='absolute bottom-0 left-0 right-0 bg-black/70 p-2 sm:p-4 safe-area-padding'>
          <div className='flex gap-2 justify-center overflow-x-auto scrollbar-hide max-w-full px-4'>
            {images.map((image, index) => (
              <button
                key={`thumb-${index}`}
                onClick={e => {
                  e.stopPropagation();
                  goToImage(index);
                }}
                className={`
                  flex-shrink-0 border-2 transition-all duration-200 thumbnail-hover
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
