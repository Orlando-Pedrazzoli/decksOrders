import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
// No need to import './ReviewsCarousel.css' as per our previous discussion, styles are in index.css

// Updated ChevronLeftIcon with smaller size
const ChevronLeftIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={2.5}
    stroke='currentColor'
    className='w-6 h-6 md:w-8 md:h-8' // Made smaller: w-6 h-6 for mobile, w-8 h-8 for larger screens
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
    className='w-6 h-6 md:w-8 md:h-8' // Made smaller: w-6 h-6 for mobile, w-8 h-8 for larger screens
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M8.25 4.5 15.75 12 8.25 19.5'
    />
  </svg>
);

const reviews = [
  {
    name: 'João Silva',
    location: 'Cascais, Portugal',
    date: '10/02/2025',
    rating: 5,
    comment: 'Produto de alta qualidade, superou as minhas expectativas!',
  },
  {
    name: 'Mariana Lopes',
    location: 'Lisboa, Portugal',
    date: '18/02/2025',
    rating: 4,
    comment: 'Entrega rápida e atendimento excelente. Recomendo!',
  },
  {
    name: 'Miguel Fernandes',
    location: 'Porto, Portugal',
    date: '05/03/2025',
    rating: 5,
    comment: 'Perfeito para quem ama surf, produto durável e funcional.',
  },
  {
    name: 'Sofia Martins',
    location: 'Ericeira, Portugal',
    date: '12/03/2025',
    rating: 5,
    comment: 'Equipe muito atenciosa e produto entregue dentro do prazo.',
  },
  {
    name: 'Pedro Costa',
    location: 'Oeiras, Portugal',
    date: '07/04/2025',
    rating: 4,
    comment: 'Ótimo custo-benefício e qualidade garantida.',
  },
  {
    name: 'Ana Pereira',
    location: 'Sintra, Portugal',
    date: '19/04/2025',
    rating: 5,
    comment: 'Produto excelente, perfeito para as minhas necessidades no surf.',
  },
  {
    name: 'Rui Gonçalves',
    location: 'Matosinhos, Portugal',
    date: '11/05/2025',
    rating: 5,
    comment: 'Recomendo a todos os amantes do mar e do surf, sensacional!',
  },
  {
    name: 'Cláudia Almeida',
    location: 'Peniche, Portugal',
    date: '22/05/2025',
    rating: 4,
    comment: 'Entrega rápida, produto bem embalado e atendimento cordial.',
  },
  {
    name: 'Hugo Ribeiro',
    location: 'Albufeira, Portugal',
    date: '10/06/2025',
    rating: 5,
    comment: 'Ótima experiência de compra, voltarei a comprar com certeza.',
  },
  {
    name: 'Inês Silva',
    location: 'Sagres, Portugal',
    date: '18/06/2025',
    rating: 5,
    comment:
      'Produto de alta qualidade, perfeito para as ondas aqui da região.',
  },
];

export default function ReviewsCarousel() {
  return (
    <div className='relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50 mt-10'>
      <h2 className='text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12'>
        O que os nossos clientes dizem sobre a Elite Surfing
      </h2>

      <Swiper
        modules={[Autoplay, Navigation]}
        slidesPerView={1}
        spaceBetween={20}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 1.2, centeredSlides: true, spaceBetween: 15 },
          768: { slidesPerView: 2.2, centeredSlides: true, spaceBetween: 25 },
          1024: { slidesPerView: 3, spaceBetween: 30 },
          1280: { slidesPerView: 4, spaceBetween: 30 },
        }}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        className='mySwiper'
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={index}>
            <div className='bg-white border border-gray-200 rounded-xl p-6 h-full shadow-md flex flex-col justify-between'>
              <div>
                <p className='font-semibold text-lg text-gray-800'>
                  {review.name}
                </p>
                <p className='text-sm text-gray-600 mb-1'>{review.location}</p>
                <p className='text-xs text-gray-500 mb-3'>
                  Data: {review.date}
                </p>
                <div className='flex text-yellow-500 text-xl mb-3'>
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>
                <p className='text-base text-gray-700 leading-relaxed'>
                  {review.comment}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Arrows with updated sizes and mobile visibility */}
      <div className='swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 left-4 md:left-8 z-10 cursor-pointer bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors duration-200 hidden sm:block'>
        {' '}
        {/* hidden on small mobile, block on sm and up */}
        <ChevronLeftIcon />
      </div>
      <div className='swiper-button-next-custom absolute top-1/2 -translate-y-1/2 right-4 md:right-8 z-10 cursor-pointer bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors duration-200 hidden sm:block'>
        {' '}
        {/* hidden on small mobile, block on sm and up */}
        <ChevronRightIcon />
      </div>
    </div>
  );
}
