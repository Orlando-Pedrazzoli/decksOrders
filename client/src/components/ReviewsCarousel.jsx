import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { useAppContext } from '../context/AppContext';
import 'swiper/css';
import 'swiper/css/navigation';

// Updated ChevronLeftIcon with smaller size
const ChevronLeftIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={2.5}
    stroke='currentColor'
    className='w-6 h-6 md:w-8 md:h-8'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M15.75 19.5 8.25 12 15.75 4.5'
    />
  </svg>
);

// Updated ChevronRightIcon with smaller size
const ChevronRightIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={2.5}
    stroke='currentColor'
    className='w-6 h-6 md:w-8 md:h-8'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M8.25 4.5 15.75 12 8.25 19.5'
    />
  </svg>
);

// Fallback reviews se não houver reviews reais
const fallbackReviews = [
  {
    userName: 'João Silva',
    userLocation: 'Cascais, Portugal',
    createdAt: '2025-02-10T10:30:00Z',
    rating: 5,
    title: 'Produto de alta qualidade',
    comment: 'Produto de alta qualidade, superou as minhas expectativas!',
    isVerifiedPurchase: true,
  },
  {
    userName: 'Mariana Lopes',
    userLocation: 'Lisboa, Portugal',
    createdAt: '2025-02-18T14:20:00Z',
    rating: 4,
    title: 'Entrega rápida',
    comment: 'Entrega rápida e atendimento excelente. Recomendo!',
    isVerifiedPurchase: true,
  },
  {
    userName: 'Miguel Fernandes',
    userLocation: 'Porto, Portugal',
    createdAt: '2025-03-05T09:15:00Z',
    rating: 5,
    title: 'Perfeito para surf',
    comment: 'Perfeito para quem ama surf, produto durável e funcional.',
    isVerifiedPurchase: true,
  },
  {
    userName: 'Sofia Martins',
    userLocation: 'Ericeira, Portugal',
    createdAt: '2025-03-12T16:45:00Z',
    rating: 5,
    title: 'Equipe atenciosa',
    comment: 'Equipe muito atenciosa e produto entregue dentro do prazo.',
    isVerifiedPurchase: true,
  },
  {
    userName: 'Pedro Costa',
    userLocation: 'Oeiras, Portugal',
    createdAt: '2025-04-07T11:30:00Z',
    rating: 4,
    title: 'Ótimo custo-benefício',
    comment: 'Ótimo custo-benefício e qualidade garantida.',
    isVerifiedPurchase: true,
  },
];

export default function ReviewsCarousel() {
  const { axios } = useAppContext();
  const [reviews, setReviews] = useState(fallbackReviews);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentReviews();
  }, []);

  const fetchRecentReviews = async () => {
    try {
      setLoading(true);

      // ✅ BUSCAR REVIEWS REAIS DA API
      const response = await axios.get('/api/reviews/recent?limit=10');

      if (response.data.success && response.data.reviews.length > 0) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.log('Usando reviews padrão:', error);
      // Mantém os reviews fallback se der erro
    } finally {
      setLoading(false);
    }
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const renderStars = rating => {
    return (
      <div className='flex text-yellow-500 text-xl mb-3'>
        {'★'.repeat(rating)}
        {'☆'.repeat(5 - rating)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className='relative py-16 bg-gray-50 mt-10 px-6 md:px-16 lg:px-24 xl:px-32 overflow-hidden w-full max-w-full'>
        <div className='flex justify-center items-center h-40'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='relative py-16 bg-gray-50 mt-10 px-6 md:px-16 lg:px-24 xl:px-32 overflow-hidden w-full max-w-full'>
      <h2 className='text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12'>
        O que os nossos clientes dizem sobre a Elite Surfing
      </h2>

      <Swiper
        modules={[Autoplay, Navigation]}
        slidesPerView={1}
        spaceBetween={20}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 1.2, centeredSlides: true, spaceBetween: 15 },
          768: { slidesPerView: 2.2, centeredSlides: true, spaceBetween: 25 },
          1024: { slidesPerView: 3, centeredSlides: false, spaceBetween: 30 },
          1280: { slidesPerView: 4, centeredSlides: false, spaceBetween: 30 },
        }}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        className='mySwiper !overflow-hidden'
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={index}>
            <div className='bg-white border border-gray-200 rounded-xl p-6 h-full shadow-md flex flex-col justify-between'>
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <p className='font-semibold text-lg text-gray-800'>
                    {review.userName}
                  </p>
                  {review.isVerifiedPurchase && (
                    <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full'>
                      ✓ Compra verificada
                    </span>
                  )}
                </div>

                <p className='text-sm text-gray-600 mb-1'>
                  {review.userLocation}
                </p>
                <p className='text-xs text-gray-500 mb-3'>
                  {formatDate(review.createdAt)}
                </p>

                {renderStars(review.rating)}

                {review.title && (
                  <h4 className='font-medium text-gray-800 mb-2'>
                    {review.title}
                  </h4>
                )}

                <p className='text-base text-gray-700 leading-relaxed'>
                  {review.comment}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Arrows - posicionadas dentro do padding */}
      <div className='swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 left-8 md:left-20 lg:left-28 xl:left-36 z-10 cursor-pointer bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors duration-200 hidden sm:block'>
        <ChevronLeftIcon />
      </div>
      <div className='swiper-button-next-custom absolute top-1/2 -translate-y-1/2 right-8 md:right-20 lg:right-28 xl:right-36 z-10 cursor-pointer bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors duration-200 hidden sm:block'>
        <ChevronRightIcon />
      </div>
    </div>
  );
}