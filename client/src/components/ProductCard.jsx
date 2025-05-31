import React from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';

const ProductCard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } =
    useAppContext();

  if (!product) return null;

  return (
    <div
      onClick={() => {
        navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
        window.scrollTo(0, 0);
      }}
      className='border border-gray-500/20 rounded-md p-3 bg-white w-full hover:shadow-md transition-shadow cursor-pointer'
    >
      {/* Image Container */}
      <div className='group flex items-center justify-center mb-3'>
        <img
          className='group-hover:scale-105 transition w-full aspect-square object-contain'
          src={product.image[0]}
          alt={product.name}
        />
      </div>

      {/* Product Info */}
      <div className='text-gray-500/60 text-sm'>
        <p className='text-xs md:text-sm'>{product.category}</p>
        <p className='text-gray-700 font-medium text-base md:text-lg line-clamp-2 h-[3em]'>
          {product.name}
        </p>

        {/* Rating */}
        <div className='flex items-center gap-0.5 mt-1'>
          {Array(5)
            .fill('')
            .map((_, i) => (
              <img
                key={i}
                className='w-3 md:w-3.5'
                src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                alt=''
              />
            ))}
          <p className='text-xs md:text-sm'>(4)</p>
        </div>

        {/* Price and Add to Cart */}
        <div className='flex items-end justify-between mt-3'>
          <div>
            <p className='text-lg md:text-xl font-medium text-gray-700'>
              {currency}
              {product.offerPrice}
            </p>
            {product.offerPrice < product.price && (
              <p className='text-gray-500/60 text-xs md:text-sm line-through'>
                {currency}
                {product.price}
              </p>
            )}
          </div>

          <div
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className='text-primary'
          >
            {!cartItems[product._id] ? (
              <button
                className='flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 w-16 md:w-20 h-8 md:h-9 rounded hover:bg-primary/20 transition-colors'
                onClick={e => {
                  e.stopPropagation();
                  addToCart(product._id);
                }}
              >
                <img
                  src={assets.cart_icon}
                  alt='cart_icon'
                  className='w-3 md:w-4'
                />
                Add
              </button>
            ) : (
              <div className='flex items-center justify-center gap-2 w-16 md:w-20 h-8 md:h-9 bg-primary/10 border border-primary/20 rounded select-none'>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    removeFromCart(product._id);
                  }}
                  className='cursor-pointer text-md px-1 md:px-2 h-full flex items-center hover:bg-primary/20 rounded-l'
                >
                  -
                </button>
                <span className='w-4 md:w-5 text-center text-sm md:text-base'>
                  {cartItems[product._id]}
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    addToCart(product._id);
                  }}
                  className='cursor-pointer text-md px-1 md:px-2 h-full flex items-center hover:bg-primary/20 rounded-r'
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
