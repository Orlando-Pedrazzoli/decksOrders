// ReviewsCarousel.jsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

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
    <div className='px-6 py-20'>
      <p className='text-2xl md:text-3xl font-medium mb-8'>
        O que os nossos clientes dizem sobre a Elite Surfing
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
