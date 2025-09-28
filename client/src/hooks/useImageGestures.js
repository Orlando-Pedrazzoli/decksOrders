// useImageGestures.js - Hook personalizado para gestos de imagem
import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook personalizado para gerenciar gestos em imagens
 * Suporta: swipe, pinch-to-zoom, double-tap, drag
 */
export const useImageGestures = ({
  totalImages,
  onImageChange,
  onZoomChange,
  minSwipeDistance = 50,
  maxZoomLevel = 3,
  doubleTapDelay = 300,
}) => {
  // Estados principais
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  // Estados de touch
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Refs
  const lastTap = useRef(0);
  const pinchStartDistance = useRef(0);
  const animationFrame = useRef(null);

  /**
   * Reset zoom state
   */
  const resetZoom = useCallback(() => {
    setIsZoomed(false);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    onZoomChange?.(false, 1);
  }, [onZoomChange]);

  /**
   * Handle swipe start
   */
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

  /**
   * Handle swipe move
   */
  const handleTouchMove = useCallback(
    e => {
      if (e.touches.length === 2) {
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
          onZoomChange?.(newZoom > 1, newZoom);
        }
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];

        if (isZoomed && isDragging) {
          // Handle drag when zoomed
          const deltaX = touch.clientX - dragStart.x;
          const deltaY = touch.clientY - dragStart.y;

          if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
          }

          animationFrame.current = requestAnimationFrame(() => {
            setImagePosition({
              x: deltaX,
              y: deltaY,
            });
          });
        } else if (!isZoomed) {
          // Handle swipe
          setTouchEnd(touch.clientX);
        }
      }
    },
    [isZoomed, isDragging, zoomLevel, maxZoomLevel, dragStart, onZoomChange]
  );

  /**
   * Handle swipe end
   */
  const handleTouchEnd = useCallback(() => {
    pinchStartDistance.current = 0;

    if (!touchStart || !touchEnd || isZoomed) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < totalImages - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onImageChange?.(newIndex);
    } else if (isRightSwipe && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onImageChange?.(newIndex);
    }

    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
  }, [
    touchStart,
    touchEnd,
    isZoomed,
    currentIndex,
    totalImages,
    minSwipeDistance,
    onImageChange,
  ]);

  /**
   * Handle double tap for zoom
   */
  const handleDoubleTap = useCallback(
    e => {
      const currentTime = Date.now();
      const tapLength = currentTime - lastTap.current;

      if (tapLength < doubleTapDelay && tapLength > 0) {
        e.preventDefault();

        if (isZoomed) {
          resetZoom();
        } else {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          setIsZoomed(true);
          setZoomLevel(2);

          // Center zoom on tap position
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const offsetX = (centerX - x) * 2;
          const offsetY = (centerY - y) * 2;

          setImagePosition({ x: offsetX, y: offsetY });
          onZoomChange?.(true, 2);
        }
      }

      lastTap.current = currentTime;
    },
    [isZoomed, resetZoom, doubleTapDelay, onZoomChange]
  );

  /**
   * Handle mouse wheel zoom
   */
  const handleWheel = useCallback(
    e => {
      e.preventDefault();

      const delta = e.deltaY * -0.01;
      const newZoom = Math.min(Math.max(1, zoomLevel + delta), maxZoomLevel);

      setZoomLevel(newZoom);
      setIsZoomed(newZoom > 1);

      if (newZoom === 1) {
        setImagePosition({ x: 0, y: 0 });
      }

      onZoomChange?.(newZoom > 1, newZoom);
    },
    [zoomLevel, maxZoomLevel, onZoomChange]
  );

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback(
    e => {
      if (!isZoomed) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      setIsDragging(true);
      setDragStart({
        x: clientX - imagePosition.x,
        y: clientY - imagePosition.y,
      });
    },
    [isZoomed, imagePosition]
  );

  /**
   * Handle drag move
   */
  const handleDragMove = useCallback(
    e => {
      if (!isDragging || !isZoomed) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }

      animationFrame.current = requestAnimationFrame(() => {
        setImagePosition({
          x: clientX - dragStart.x,
          y: clientY - dragStart.y,
        });
      });
    },
    [isDragging, isZoomed, dragStart]
  );

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Navigate to next image
   */
  const goToNext = useCallback(() => {
    if (currentIndex < totalImages - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onImageChange?.(newIndex);
      resetZoom();
    }
  }, [currentIndex, totalImages, onImageChange, resetZoom]);

  /**
   * Navigate to previous image
   */
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onImageChange?.(newIndex);
      resetZoom();
    }
  }, [currentIndex, onImageChange, resetZoom]);

  /**
   * Go to specific image
   */
  const goToImage = useCallback(
    index => {
      if (index >= 0 && index < totalImages) {
        setCurrentIndex(index);
        onImageChange?.(index);
        resetZoom();
      }
    },
    [totalImages, onImageChange, resetZoom]
  );

  /**
   * Keyboard navigation
   */
  useEffect(() => {
    const handleKeyDown = e => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          resetZoom();
          break;
        case '+':
        case '=':
          setZoomLevel(prev => Math.min(prev + 0.5, maxZoomLevel));
          break;
        case '-':
        case '_':
          setZoomLevel(prev => Math.max(prev - 0.5, 1));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, resetZoom, maxZoomLevel]);

  /**
   * Cleanup animation frames
   */
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return {
    // States
    currentIndex,
    isZoomed,
    zoomLevel,
    imagePosition,
    isDragging,

    // Handlers
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleDoubleTap,
    handleWheel,
    handleDragStart,
    handleDragMove,
    handleDragEnd,

    // Navigation
    goToNext,
    goToPrevious,
    goToImage,

    // Utilities
    resetZoom,
    setCurrentIndex,
  };
};

/**
 * Hook para detectar se é dispositivo touch
 */
export const useIsTouchDevice = () => {
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
 * Hook para detectar orientação do dispositivo
 */
export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState(
    window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      );
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return orientation;
};

/**
 * Hook para lazy loading de imagens
 */
export const useImageLazyLoad = (imageUrls, preloadCount = 2) => {
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [loadingImages, setLoadingImages] = useState(new Set());

  const preloadImage = useCallback(
    url => {
      if (loadedImages.has(url) || loadingImages.has(url)) return;

      setLoadingImages(prev => new Set(prev).add(url));

      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(url));
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(url);
          return newSet;
        });
      };
      img.onerror = () => {
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(url);
          return newSet;
        });
      };
      img.src = url;
    },
    [loadedImages, loadingImages]
  );

  const preloadSurroundingImages = useCallback(
    currentIndex => {
      // Preload current image
      if (imageUrls[currentIndex]) {
        preloadImage(imageUrls[currentIndex]);
      }

      // Preload surrounding images
      for (let i = 1; i <= preloadCount; i++) {
        // Next images
        if (imageUrls[currentIndex + i]) {
          preloadImage(imageUrls[currentIndex + i]);
        }
        // Previous images
        if (imageUrls[currentIndex - i]) {
          preloadImage(imageUrls[currentIndex - i]);
        }
      }
    },
    [imageUrls, preloadCount, preloadImage]
  );

  const isImageLoaded = useCallback(
    url => {
      return loadedImages.has(url);
    },
    [loadedImages]
  );

  const isImageLoading = useCallback(
    url => {
      return loadingImages.has(url);
    },
    [loadingImages]
  );

  return {
    preloadImage,
    preloadSurroundingImages,
    isImageLoaded,
    isImageLoading,
    loadedImages: Array.from(loadedImages),
    loadingImages: Array.from(loadingImages),
  };
};

export default useImageGestures;
