import React from 'react';
import MainBanner from '../components/MainBanner';
import Categories from '../components/Categories';
import NewsLetter from '../components/NewsLetter';
import ReviewsCarousel from '../components/ReviewsCarousel';
import AllProducts from './AllProducts';

const Home = () => {
  return (
    <div className='mt-10'>
      <MainBanner />
      <Categories />
      <AllProducts />
      <ReviewsCarousel />
      <NewsLetter />
    </div>
  );
};

export default Home;


