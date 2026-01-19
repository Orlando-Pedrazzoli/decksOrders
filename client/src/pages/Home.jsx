import React from 'react';
import MainBanner from '../components/MainBanner';
import CollectionsGrid from '../components/CollectionsGrid';
import FeatureBanners from '../components/FeatureBanners';
import NewsLetter from '../components/NewsLetter';
import ReviewsCarousel from '../components/ReviewsCarousel';
import { SEO, OrganizationSchema, WebSiteSchema, SiteNavigationSchema } from '../components/seo';
import seoConfig from '../components/seo/seoConfig';

const Home = () => {
  return (
    <>
      <SEO 
        title={seoConfig.home.title}
        description={seoConfig.home.description}
        url={seoConfig.home.url}
      >
        <OrganizationSchema />
        <WebSiteSchema />
        <SiteNavigationSchema />
      </SEO>
      
      {/* Removido mt-10 - O MainBanner agora vai edge-to-edge */}
      <div>
        <MainBanner />
        <CollectionsGrid />
        <FeatureBanners />
        <ReviewsCarousel />
        <NewsLetter />
      </div>
    </>
  );
};

export default Home;