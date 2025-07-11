import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import toast from 'react-hot-toast';

const WriteReview = () => {
  const { axios, user, navigate, currency } = useAppContext();
  const [eligibleProducts, setEligibleProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 WriteReview mounted');
    console.log('👤 User:', user);
    console.log('🌐 Axios baseURL:', axios.defaults.baseURL);

    if (user) {
      fetchEligibleProducts();
    } else {
      console.log('❌ Usuário não encontrado, redirecionando...');
      navigate('/');
    }
  }, [user]);

  const fetchEligibleProducts = async () => {
    try {
      setLoading(true);
      console.log('🔍 Iniciando fetchEligibleProducts...');
      console.log(
        '🔗 URL completa que será chamada:',
        axios.defaults.baseURL + '/api/reviews/eligible-orders'
      );

      // ✅ TESTE 1: Verificar se a rota de teste funciona primeiro
      console.log('🧪 Testando rota de teste primeiro...');
      try {
        const testResponse = await axios.get('/api/reviews/test');
        console.log('✅ Rota de teste OK:', testResponse.data);
      } catch (testError) {
        console.error('❌ Rota de teste falhou:', testError);
        console.error('❌ Status:', testError.response?.status);
        console.error('❌ Data:', testError.response?.data);
        toast.error('Erro: Rotas de reviews não estão funcionando');
        return;
      }

      // ✅ TESTE 2: Verificar autenticação
      console.log('🔐 Verificando autenticação...');
      console.log('🍪 Cookies:', document.cookie);
      console.log('💾 Token localStorage:', localStorage.getItem('auth_token'));

      // ✅ TESTE 3: Chamar a rota protegida
      console.log('📦 Chamando /api/reviews/eligible-orders...');
      const response = await axios.post(
        '/api/reviews/eligible-orders',
        {},
        {
          withCredentials: true, // ✅ Garantir que cookies sejam enviados
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Resposta recebida:', response.data);

      if (response.data.success) {
        setEligibleProducts(response.data.eligibleProducts);
        console.log(
          '✅ Produtos carregados:',
          response.data.eligibleProducts.length
        );

        if (response.data.eligibleProducts.length === 0) {
          console.log('📝 Nenhum produto elegível encontrado');
        } else {
          console.log(
            '📝 Primeiro produto:',
            response.data.eligibleProducts[0]
          );
        }
      } else {
        console.log('❌ Resposta não foi sucesso:', response.data.message);
        toast.error(response.data.message || 'Erro ao carregar produtos');
      }
    } catch (error) {
      console.error('❌ Erro completo:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Request config:', error.config);

      // ✅ MELHORES MENSAGENS DE ERRO BASEADAS NO TIPO
      if (error.code === 'ERR_NETWORK') {
        toast.error('Erro de rede. Verifique se o servidor está rodando.');
      } else if (error.response?.status === 404) {
        toast.error(
          'Rota não encontrada. Verifique se as rotas de reviews estão registradas.'
        );
      } else if (error.response?.status === 401) {
        toast.error('Não autorizado. Faça login novamente.');
        navigate('/');
      } else if (error.response?.status === 500) {
        toast.error('Erro interno do servidor.');
      } else {
        toast.error(
          'Erro ao carregar produtos: ' +
            (error.response?.data?.message || error.message)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async e => {
    e.preventDefault();

    if (!selectedProduct) {
      return toast.error('Selecione um produto para avaliar');
    }

    if (rating === 0) {
      return toast.error('Selecione uma classificação');
    }

    if (!title.trim()) {
      return toast.error('Digite um título para o review');
    }

    if (!comment.trim()) {
      return toast.error('Digite um comentário');
    }

    setIsSubmitting(true);

    try {
      console.log('📝 Enviando review:', {
        orderId: selectedProduct.orderId,
        productId: selectedProduct.product._id,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      const response = await axios.post(
        '/api/reviews/create',
        {
          orderId: selectedProduct.orderId,
          productId: selectedProduct.product._id,
          rating,
          title: title.trim(),
          comment: comment.trim(),
        },
        {
          withCredentials: true,
        }
      );

      console.log('✅ Resposta do review:', response.data);

      if (response.data.success) {
        toast.success('Review enviado com sucesso!');

        // Reset form
        setSelectedProduct(null);
        setRating(0);
        setTitle('');
        setComment('');

        // Refresh eligible products
        fetchEligibleProducts();

        // Navigate to my orders or reviews
        setTimeout(() => {
          navigate('/my-orders');
        }, 2000);
      } else {
        toast.error(response.data.message || 'Erro ao enviar review');
      }
    } catch (error) {
      console.error('❌ Erro ao enviar review:', error);

      if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente');
        navigate('/');
      } else {
        toast.error(
          'Erro ao enviar review: ' +
            (error.response?.data?.message || error.message)
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, setRating, disabled = false }) => (
    <div className='flex gap-1'>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type='button'
          disabled={disabled}
          onClick={() => !disabled && setRating(star)}
          className={`text-2xl transition-colors ${
            star <= rating
              ? 'text-yellow-500'
              : 'text-gray-300 hover:text-yellow-400'
          } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
        >
          ★
        </button>
      ))}
    </div>
  );

  // ✅ VERIFICAÇÃO ADICIONAL: Se não há usuário, redirecionar
  if (!user) {
    return (
      <div className='flex justify-center items-center min-h-[50vh]'>
        <div className='text-center'>
          <p className='text-lg text-gray-600 mb-4'>
            Você precisa estar logado para escrever reviews
          </p>
          <button
            onClick={() => navigate('/')}
            className='bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dull transition'
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[50vh]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-gray-600'>Carregando produtos...</p>
          <p className='mt-2 text-sm text-gray-500'>
            Se demorar muito, verifique o console (F12) para mais detalhes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-10'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-800 mb-8 text-center'>
          Escrever Review
        </h1>

        {eligibleProducts.length === 0 ? (
          <div className='text-center py-12'>
            <img
              src={assets.empty_cart}
              alt='Sem produtos'
              className='w-48 mx-auto mb-6 opacity-75'
            />
            <h3 className='text-xl font-semibold mb-3 text-gray-700'>
              Nenhum produto disponível para review
            </h3>
            <p className='text-gray-600 mb-6'>
              Faça algumas compras primeiro para poder avaliar os produtos!
            </p>
            <div className='space-y-4'>
              <button
                onClick={() => navigate('/products')}
                className='bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dull transition mx-2'
              >
                Explorar Produtos
              </button>
              <button
                onClick={() => navigate('/my-orders')}
                className='bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition mx-2'
              >
                Ver Meus Pedidos
              </button>
              <button
                onClick={fetchEligibleProducts}
                className='bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition mx-2'
              >
                🔄 Tentar Novamente
              </button>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Lista de Produtos Elegíveis */}
            <div>
              <h2 className='text-xl font-semibold mb-4'>
                Produtos Comprados ({eligibleProducts.length})
              </h2>

              <div className='space-y-4 max-h-96 overflow-y-auto'>
                {eligibleProducts.map((item, index) => (
                  <div
                    key={`${item.orderId}-${item.product._id}-${index}`}
                    onClick={() => setSelectedProduct(item)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedProduct?.product._id === item.product._id &&
                      selectedProduct?.orderId === item.orderId
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <div className='flex items-center gap-4'>
                      <img
                        src={item.product.image[0]}
                        alt={item.product.name}
                        className='w-16 h-16 object-cover rounded'
                        onError={e => {
                          e.target.src =
                            assets.placeholder_image || '/placeholder.jpg';
                        }}
                      />
                      <div className='flex-grow'>
                        <h3 className='font-medium text-gray-800'>
                          {item.product.name}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          Pedido de{' '}
                          {new Date(item.orderDate).toLocaleDateString('pt-PT')}
                        </p>
                        <p className='text-sm text-gray-500'>
                          Quantidade: {item.quantity}
                        </p>
                      </div>
                      {selectedProduct?.product._id === item.product._id &&
                        selectedProduct?.orderId === item.orderId && (
                          <div className='text-primary'>
                            <svg
                              className='w-6 h-6'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path
                                fillRule='evenodd'
                                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulário de Review */}
            <div>
              <h2 className='text-xl font-semibold mb-4'>Escrever Review</h2>

              {selectedProduct ? (
                <form onSubmit={handleSubmitReview} className='space-y-6'>
                  {/* Produto Selecionado */}
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <div className='flex items-center gap-4'>
                      <img
                        src={selectedProduct.product.image[0]}
                        alt={selectedProduct.product.name}
                        className='w-20 h-20 object-cover rounded'
                        onError={e => {
                          e.target.src =
                            assets.placeholder_image || '/placeholder.jpg';
                        }}
                      />
                      <div>
                        <h3 className='font-medium text-gray-800'>
                          {selectedProduct.product.name}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          {selectedProduct.product.category}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Classificação *
                    </label>
                    <StarRating rating={rating} setRating={setRating} />
                    <p className='text-xs text-gray-500 mt-1'>
                      Clique nas estrelas para avaliar
                    </p>
                  </div>

                  {/* Título */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Título do Review *
                    </label>
                    <input
                      type='text'
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder='Ex: Produto excelente, superou expectativas'
                      maxLength={100}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                      required
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      {title.length}/100 caracteres
                    </p>
                  </div>

                  {/* Comentário */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Comentário *
                    </label>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder='Conte sobre sua experiência com o produto...'
                      maxLength={500}
                      rows={5}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                      required
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      {comment.length}/500 caracteres
                    </p>
                  </div>

                  {/* Botão Submit */}
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-dull'
                    } text-white`}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Review'}
                  </button>
                </form>
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  <p>Selecione um produto à esquerda para escrever um review</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteReview;
