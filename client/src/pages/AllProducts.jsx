import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { categories } from '../assets/assets.js';

const AllProducts = () => {
  const { products, searchQuery } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    let result = products;

    // Apply search filter
    if (searchQuery.length > 0) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter if any categories are selected
    if (selectedCategories.length > 0) {
      result = result.filter(
        product => selectedCategories.includes(product.category) // Assuming your products have a 'category' field that matches the category paths
      );
    }

    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategories]);

  const handleCategoryChange = categoryPath => {
    setSelectedCategories(prev =>
      prev.includes(categoryPath)
        ? prev.filter(c => c !== categoryPath)
        : [...prev, categoryPath]
    );
  };

  return (
    <div className='mt-16 flex flex-col'>
      <div className='flex flex-col items-end w-max'>
        <p className='text-2xl font-medium uppercase'>All products</p>
        <div className='w-16 h-0.5 bg-primary rounded-full'></div>
      </div>

      {/* Category Filter Section */}
      <div className='mt-6 mb-4'>
        <h3 className='text-lg font-medium mb-2'>Filter by Category:</h3>
        <div className='flex flex-wrap gap-5'>
          {categories.map(category => (
            <label
              key={category.path}
              className='flex items-center space-x-2 cursor-pointer'
            >
              <input
                type='checkbox'
                checked={selectedCategories.includes(category.path)}
                onChange={() => handleCategoryChange(category.path)}
                className='form-checkbox h-4 w-4 text-primary rounded focus:ring-primary'
              />
              <span>{category.text}</span>
            </label>
          ))}
        </div>

        {/* Clear filters button on its own line below checkboxes */}
        {selectedCategories.length > 0 && (
          <button
            onClick={() => setSelectedCategories([])}
            className='text-lg text-primary hover:underline mt-2'
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Product Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-6 mt-6'>
        {filteredProducts
          .filter(product => product.inStock)
          .map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
      </div>
    </div>
  );
};

export default AllProducts;
