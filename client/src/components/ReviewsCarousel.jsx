// ReviewsCarousel.jsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const reviews = [
  {
    name: 'Vitor Scopel',
    location: 'Florianópolis/SC',
    date: '08/05/2025',
    rating: 5,
    comment:
      'comprei poucos produtos até agora na loja mas gostei muito do atendimento e da atenciosidade deles e a loja tem muita variedade de produtos (gringos...)',
  },
  {
    name: 'Andre Crizel',
    location: 'São José do Norte/RS',
    date: '07/05/2025',
    rating: 5,
    comment: 'Excelente trabalho de todos de uma equipe que entende de surf!',
  },
  {
    name: 'Ana Lis Melgaço',
    location: 'Mogi das Cruzes/SP',
    date: '07/05/2025',
    rating: 5,
    comment: 'Ótimo atendimento e entrega',
  },
  {
    name: 'THIAGO MICHELON',
    location: 'Florianópolis/SC',
    date: '05/05/2025',
    rating: 5,
    comment: 'Preços bons e entrega rápida. Recomendo a loja.',
  },
  {
    name: 'Luciano De jesus',
    location: 'Serra/ES',
    date: '03/05/2025',
    rating: 5,
    comment:
      'otimo jogo de quilhas, estou revezando elas entre a pranchinha, e em maiores maiores as utilizo como estabilizadoras no longbord progressivo.',
  },
];

export default function ReviewsCarousel() {
  return (
    <div className='px-6 py-20'>
      <p className='text-2xl md:text-3xl font-medium mb-8'>
        O que estão falando da Elite Surfing
      </p>
      <Swiper
        modules={[Autoplay, Navigation]}
        slidesPerView={1}
        spaceBetween={20}
        navigation
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={index}>
            <div className='bg-white border rounded-lg p-4 h-full shadow-sm'>
              <div className='font-semibold'>{review.name}</div>
              <div className='text-sm text-gray-500'>{review.location}</div>
              <div className='text-xs text-gray-400 mb-2'>
                Data: {review.date}
              </div>
              <div className='flex text-yellow-500 mb-2'>
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </div>
              <p className='text-sm text-gray-700'>{review.comment}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
