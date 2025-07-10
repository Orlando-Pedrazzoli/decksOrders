import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const ProductReviews = ({ productId }) => {
  const { axios } = useAppContext();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/reviews/product/${productId}?page=${currentPage}&limit=5`
      );

      if (response.data.success) {
        if (currentPage === 1) {
          setReviews(response.data.reviews);
        } else {
          setReviews(prev => [...prev, ...response.data.reviews]);
        }

        setStats(response.data.stats);
        setHasMore(response.data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Erro ao buscar reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = rating => {
    return (
      <div className='flex text-yellow-500 text-sm'>
        {'★'.repeat(rating)}
        {'☆'.repeat(5 - rating)}
      </div>
    );
  };

  const renderRatingBar = (stars, count) => {
    const percentage =
      stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

    return (
      <div className='flex items-center gap-2 text-sm'>
        <span className='w-8'>{stars}★</span>
        <div className='flex-1 bg-gray-200 rounded-full h-2'>
          <div
            className='bg-yellow-500 h-2 rounded-full transition-all duration-300'
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className='w-8 text-gray-600'>{count}</span>
      </div>
    );
  };

  const loadMoreReviews = () => {
    setCurrentPage(prev => prev + 1);
  };

  return (
    <div className='mt-16'>
      <div className='border-t border-gray-200 pt-8'>
        <h3 className='text-2xl font-bold text-gray-800 mb-6'>
          Avaliações dos Clientes
        </h3>

        {stats.totalReviews > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-8'>
            {/* Rating Summary */}
            <div className='text-center'>
              <div className='text-4xl font-bold text-gray-800 mb-2'>
                {stats.averageRating.toFixed(1)}
              </div>
              <div className='flex justify-center mb-2'>
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <p className='text-sm text-gray-600'>
                {stats.totalReviews} avaliação
                {stats.totalReviews !== 1 ? 'ões' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className='md:col-span-2'>
              <div className='space-y-2'>
                {[5, 4, 3, 2, 1].map(stars => (
                  <div key={stars}>
                    {renderRatingBar(stars, stats.distribution[stars] || 0)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className='text-center py-8 text-gray-500'>
            <p className='text-lg mb-2'>
              Ainda não há avaliações para este produto
            </p>
            <p className='text-sm'>Seja o primeiro a avaliar após comprar!</p>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 && (
          <div className='space-y-6'>
            {reviews.map((review, index) => (
              <div
                key={index}
                className='border-b border-gray-100 pb-6 last:border-b-0'
              >
                <div className='flex items-start justify-between mb-3'>
                  <div>
                    <div className='flex items-center gap-3 mb-1'>
                      <h4 className='font-semibold text-gray-800'>
                        {review.userName}
                      </h4>
                      {review.isVerifiedPurchase && (
                        <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full'>
                          ✓ Compra verificada
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-gray-500'>
                      {review.userLocation} • {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    {renderStars(review.rating)}
                  </div>
                </div>

                {review.title && (
                  <h5 className='font-medium text-gray-800 mb-2'>
                    {review.title}
                  </h5>
                )}

                <p className='text-gray-700 leading-relaxed'>
                  {review.comment}
                </p>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className='text-center pt-4'>
                <button
                  onClick={loadMoreReviews}
                  disabled={loading}
                  className='px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-50'
                >
                  {loading ? 'Carregando...' : 'Ver mais avaliações'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
