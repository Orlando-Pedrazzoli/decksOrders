import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

const ProductCard = ({ product }) => {
  const { currency, addToCart, navigate, products } = useAppContext();

  const [familyProducts, setFamilyProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(product);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 🎯 Buscar produtos da mesma família
  useEffect(() => {
    if (product.productFamily) {
      const family = products.filter(
        p => p.productFamily === product.productFamily
      );
      setFamilyProducts(family);
    } else {
      setFamilyProducts([]);
    }
  }, [product.productFamily, products]);

  // Reset quando o produto base muda
  useEffect(() => {
    setSelectedProduct(product);
  }, [product._id]);

  // 🎯 Trocar para outro produto da família COM TRANSIÇÃO
  const handleColorClick = (familyProduct, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (familyProduct._id === selectedProduct._id) return;
    
    // Iniciar transição
    setIsTransitioning(true);
    
    // Após fade-out, trocar produto
    setTimeout(() => {
      setSelectedProduct(familyProduct);
      // Após trocar, fade-in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 150);
  };

  // 🎯 Navegar para a página do produto selecionado
  const handleCardClick = () => {
    navigate(`/products/${selectedProduct.category.toLowerCase()}/${selectedProduct._id}`);
  };

  // 🎯 Adicionar ao carrinho
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (selectedProduct.stock <= 0) {
      return;
    }

    addToCart(selectedProduct._id);
  };

  // Dados do produto selecionado
  const displayProduct = selectedProduct;
  const stock = displayProduct.stock || 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 3;

  return (
    <div
      onClick={handleCardClick}
      className="border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white cursor-pointer group relative overflow-hidden"
    >
      {/* Imagem do Produto com Transição */}
      <div className="relative flex items-center justify-center px-2 overflow-hidden">
        <div className={`
          transition-all duration-300 ease-out
          ${isTransitioning 
            ? 'opacity-0 scale-95 blur-sm' 
            : 'opacity-100 scale-100 blur-0'
          }
        `}>
          <img
            className="group-hover:scale-105 transition-transform duration-300 max-w-26 md:max-w-36 aspect-square object-contain"
            src={displayProduct.image[0]}
            alt={displayProduct.name}
          />
        </div>

        {/* Badge de Stock */}
        {isOutOfStock && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg">
            Esgotado
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded shadow-lg">
            Últimas {stock}!
          </div>
        )}

        {/* Botão Adicionar ao Carrinho (hover) */}
        {!isOutOfStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 bg-primary hover:bg-primary-dull transition-all text-white text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5 rounded opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-200"
          >
            <img
              src={assets.cart_icon}
              alt="Adicionar"
              className="w-4 h-4 inline mr-1"
            />
            Adicionar
          </button>
        )}
      </div>

      {/* Informações do Produto */}
      <div className="text-gray-500/60 text-sm mt-2">
        <p>{displayProduct.category}</p>
        
        {/* Nome com transição */}
        <p className={`
          text-gray-700 font-medium text-lg truncate w-full
          transition-all duration-300
          ${isTransitioning ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0'}
        `}>
          {displayProduct.name}
        </p>

        {/* 🆕 Bolinhas de Cores (família de produtos) */}
        {familyProducts.length > 1 && (
          <div className="flex items-center gap-1.5 mt-2 mb-2 flex-wrap">
            {familyProducts.slice(0, 6).map((familyProduct) => {
              const isSelected = familyProduct._id === displayProduct._id;
              const familyStock = familyProduct.stock || 0;
              const familyOutOfStock = familyStock <= 0;

              return (
                <button
                  key={familyProduct._id}
                  onClick={(e) => handleColorClick(familyProduct, e)}
                  title={`${familyProduct.color || familyProduct.name}${familyOutOfStock ? ' (Esgotado)' : ''}`}
                  className={`
                    w-5 h-5 rounded-full border-2 transition-all duration-200 relative
                    transform hover:scale-110 active:scale-95
                    ${isSelected
                      ? 'ring-2 ring-primary ring-offset-1 border-primary scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${familyOutOfStock ? 'opacity-50' : ''}
                  `}
                  style={{
                    backgroundColor: familyProduct.colorCode || '#ccc',
                  }}
                >
                  {/* X para esgotado */}
                  {familyOutOfStock && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow">
                      ✕
                    </span>
                  )}
                </button>
              );
            })}
            {familyProducts.length > 6 && (
              <span className="text-xs text-gray-400">
                +{familyProducts.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Cor do produto atual (se definida mas sem família) */}
        {displayProduct.color && familyProducts.length <= 1 && (
          <div className="flex items-center gap-1.5 mt-1">
            <div
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: displayProduct.colorCode || '#ccc' }}
            />
            <span className="text-xs">{displayProduct.color}</span>
          </div>
        )}

        {/* Preço com transição */}
        <div className={`
          flex items-end justify-between mt-2
          transition-all duration-300
          ${isTransitioning ? 'opacity-0' : 'opacity-100'}
        `}>
          <p className="md:text-xl text-base font-semibold text-primary">
            {currency}
            {displayProduct.offerPrice}
          </p>
          {displayProduct.price !== displayProduct.offerPrice && (
            <p className="text-gray-400 text-sm line-through">
              {currency}
              {displayProduct.price}
            </p>
          )}
        </div>

        {/* Stock info */}
        <p className={`
          text-xs text-gray-400 mt-1
          transition-all duration-300
          ${isTransitioning ? 'opacity-0' : 'opacity-100'}
        `}>
          {isOutOfStock ? (
            <span className="text-red-500">Sem stock</span>
          ) : isLowStock ? (
            <span className="text-orange-500">Apenas {stock} em stock</span>
          ) : (
            <span>{stock} disponíveis</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;