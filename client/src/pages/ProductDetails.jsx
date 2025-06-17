import { useEffect, useState } from 'react';
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

  const product = products.find(item => item._id === id);

  useEffect(() => {
    if (product && products.length > 0) {
      const productsCopy = [...products].filter(
        item => product.category === item.category && item._id !== product._id
      );
      setRelatedProducts(productsCopy);
    }
  }, [products, product]);

  const nextImage = () => {
    const newIndex = (currentImageIndex + 1) % product.image.length;
    setCurrentImageIndex(newIndex);
    // Auto-scroll thumbnails if needed
    if (newIndex >= thumbStartIndex + 4) {
      setThumbStartIndex(prev => prev + 1);
    }
  };

  const prevImage = () => {
    const newIndex =
      (currentImageIndex - 1 + product.image.length) % product.image.length;
    setCurrentImageIndex(newIndex);
    // Auto-scroll thumbnails if needed
    if (newIndex < thumbStartIndex) {
      setThumbStartIndex(prev => prev - 1);
    }
  };

  const scrollThumbsUp = () => {
    if (thumbStartIndex > 0) {
      setThumbStartIndex(prev => prev - 1);
    }
  };

  const scrollThumbsDown = () => {
    if (thumbStartIndex < product.image.length - 4) {
      setThumbStartIndex(prev => prev + 1);
    }
  };

  const selectThumbnail = index => {
    setCurrentImageIndex(index);
    // Adjust thumbnail window if needed
    if (index >= thumbStartIndex + 4) {
      setThumbStartIndex(index - 3);
    } else if (index < thumbStartIndex) {
      setThumbStartIndex(index);
    }
  };

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className='mt-12'>
      {/* Full Image Modal with Navigation and Close Options */}
      {isModalOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'
          onClick={() => setIsModalOpen(false)} // Close when clicking overlay
        >
          <div
            className='relative max-w-4xl w-full p-4'
            onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {/* Close Button (X) */}
            <button
              className='absolute -top-10 -right-10 text-white text-3xl hover:text-gray-300 transition z-50'
              onClick={() => setIsModalOpen(false)}
              aria-label='Close modal'
            >
              &times;
            </button>

            {/* Image with Navigation */}
            <div className='relative'>
              <img
                src={product.image[currentImageIndex]}
                alt='Selected product'
                className='w-full h-full object-contain max-h-screen cursor-pointer'
                onClick={() => setIsModalOpen(false)} // Also close when clicking image
              />

              {product.image.length > 1 && (
                <>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className='absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-3 shadow-md hover:bg-white transition'
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
                    className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-3 shadow-md hover:bg-white transition'
                  >
                    <img
                      src={assets.arrow_right}
                      alt='Next'
                      className='w-5 h-5'
                    />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <p>
        <Link to={'/'}>Home</Link> /<Link to={'/products'}> Products</Link> /
        <Link to={`/products/${product.category.toLowerCase()}`}>
          {' '}
          {product.category}
        </Link>{' '}
        /<span className='text-primary'> {product.name}</span>
      </p>

      <div className='flex flex-col md:flex-row gap-16 mt-4'>
        {/* Images Container */}
        <div className='flex flex-col md:flex-row gap-3'>
          {/* Vertical Thumbnail Carousel */}
          <div className='relative flex flex-col items-center justify-center gap-2'>
            {/* Up Arrow - Adjusted positioning */}
            {product.image.length > 4 && (
              <button
                onClick={scrollThumbsUp}
                disabled={thumbStartIndex === 0}
                className={`p-1.5 rounded-full bg-white/90 shadow-md hover:bg-white transition ${
                  thumbStartIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
                }`}
              >
                <img src={assets.arrow_up} alt='Up' className='w-4 h-4' />
              </button>
            )}

            {/* Visible Thumbnails (4 items) */}
            <div className='flex md:flex-col gap-3'>
              {product.image
                .slice(thumbStartIndex, thumbStartIndex + 4)
                .map((image, index) => (
                  <div
                    key={thumbStartIndex + index}
                    onClick={() => selectThumbnail(thumbStartIndex + index)}
                    className={`border w-20 h-20 border-gray-500/30 rounded overflow-hidden cursor-pointer transition ${
                      currentImageIndex === thumbStartIndex + index
                        ? 'ring-2 ring-primary scale-105'
                        : 'hover:scale-105'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${thumbStartIndex + index + 1}`}
                      className='w-full h-full object-cover'
                    />
                  </div>
                ))}
            </div>

            {/* Down Arrow - Adjusted positioning */}
            {product.image.length > 4 && (
              <button
                onClick={scrollThumbsDown}
                disabled={thumbStartIndex >= product.image.length - 4}
                className={`p-1.5 rounded-full bg-white/90 shadow-md hover:bg-white transition ${
                  thumbStartIndex >= product.image.length - 4
                    ? 'opacity-30 cursor-not-allowed'
                    : ''
                }`}
              >
                <img src={assets.arrow_down} alt='Down' className='w-4 h-4' />
              </button>
            )}
          </div>

          {/* Main Image with Carousel */}
          <div className='flex-1'>
            <div className='relative border border-gray-500/30 w-full max-w-[400px] h-[400px] rounded overflow-hidden'>
              <img
                src={product.image[currentImageIndex]}
                alt='Selected product'
                className='w-full h-full object-contain cursor-pointer'
                onClick={() => setIsModalOpen(true)}
              />

              {product.image.length > 1 && (
                <>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className='absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition'
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
                    className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition'
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
          </div>
        </div>

        {/* Product Details */}
        <div className='text-sm w-full md:w-1/2 mt-6 md:mt-0'>
          <h1 className='text-3xl font-medium'>{product.name}</h1>

          <div className='flex items-center gap-0.5 mt-1'>
            {Array(5)
              .fill('')
              .map((_, i) => (
                <img
                  key={i}
                  src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                  alt=''
                  className='md:w-4 w-3.5'
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

          <p className='text-base font-medium mt-6'>About Product</p>
          <ul className='list-disc ml-4 text-gray-500/70'>
            {product.description.map((desc, index) => (
              <li key={index}>{desc}</li>
            ))}
          </ul>

          <div className='flex items-center mt-10 gap-4 text-base'>
            <button
              onClick={() => addToCart(product._id)}
              className='w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition'
            >
              Add to Cart
            </button>
            <button
              onClick={() => {
                addToCart(product._id);
                navigate('/cart');
              }}
              className='w-full py-3.5 cursor-pointer font-medium bg-primary text-white hover:bg-primary-dull transition'
            >
              Buy now
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className='flex flex-col items-center mt-20'>
        <div className='flex flex-col items-center w-max'>
          <p className='text-3xl font-medium'>Related Products</p>
          <div className='w-20 h-0.5 bg-primary rounded-full mt-2'></div>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6 w-full'>
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
          className='mx-auto cursor-pointer px-12 my-16 py-2.5 border rounded text-primary hover:bg-primary/10 transition'
        >
          See more
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
