import React from 'react';
import MainBanner from '../components/MainBanner';
import Categories from '../components/Categories';
import NewsLetter from '../components/NewsLetter';
import ReviewsCarousel from '../components/ReviewsCarousel';
import AllProducts from './AllProducts';
import { SEO, OrganizationSchema, WebSiteSchema } from '../components/seo';
import seoConfig from '../components/seo/seoConfig';

const Home = () => {
  return (
    <>
      {/* SEO - Home é a página principal, inclui schemas de Organization e WebSite */}
      <SEO 
        title={seoConfig.home.title}
        description={seoConfig.home.description}
        url={seoConfig.home.url}
      >
        <OrganizationSchema />
        <WebSiteSchema />
      </SEO>

      <div className='mt-10'>
        <MainBanner />
        <Categories />
        <AllProducts />
        <ReviewsCarousel />
        <NewsLetter />
      </div>
    </>
  );
};

export default Home;