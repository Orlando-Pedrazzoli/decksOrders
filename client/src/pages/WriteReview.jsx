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

  // Opções pré-definidas de títulos (organizados por rating)
  const titleSuggestions = {
    positive: [
      'Excelente produto!',
      'Superou as expectativas',
      'Recomendo muito!',
      'Qualidade top',
      'Adorei! Voltarei a comprar',
      'Perfeito para surf',
      'Melhor custo-benefício',
      'Produto de qualidade',
    ],
    neutral: [
      'Bom produto',
      'Cumpre o prometido',
      'Satisfaz as necessidades',
      'Produto razoável',
    ],
    negative: [
      'Podia ser melhor',
      'Expectativas não atendidas',
      'Qualidade abaixo do esperado',
    ],
  };

  // Templates de comentários pré-definidos
  const commentTemplates = [
    {
      label: 'Satisfeito',
      text: 'Produto chegou bem embalado e dentro do prazo. A qualidade é excelente e correspondeu às minhas expectativas. Recomendo!',
    },
    {
      label: 'Perfeito para surf',
      text: 'Exatamente o que precisava para as minhas sessões de surf. Material de qualidade, resistente e com ótimo acabamento. Já testei no mar e aprovo!',
    },
    {
      label: 'Superou expectativas',
      text: 'Fiquei surpreendido positivamente! O produto é ainda melhor do que aparece nas fotos. Entrega rápida e atendimento impecável. Com certeza voltarei a comprar.',
    },
    {
      label: 'Custo-benefício',
      text: 'Pelo preço que paguei, o produto superou as expectativas. Boa qualidade e funciona perfeitamente. Vale muito a pena!',
    },
    {
      label: 'Presente',
      text: 'Comprei para oferecer e foi um sucesso! Produto de qualidade, bem embalado e chegou a tempo. Quem recebeu adorou!',
    },
    {
      label: 'Recomendo',
      text: 'Produto conforme descrito, boa qualidade e entrega dentro do prazo. Loja de confiança, recomendo a outros surfistas!',
    },
    {
      label: 'Razoável',
      text: 'O produto é razoável, cumpre a sua função básica. Nada de extraordinário, mas também não tenho queixas graves.',
    },
    {
      label: 'Escrever próprio',
      text: '',
    },
  ];

  // Determinar sugestões de título baseadas no rating
  const getTitleSuggestions = () => {
    if (rating >= 4) return titleSuggestions.positive;
    if (rating === 3) return titleSuggestions.neutral;
    if (rating > 0) return titleSuggestions.negative;
    return titleSuggestions.positive;
  };

  useEffect(() => {
    if (user) {
      fetchEligibleProducts();
    } else {
      navigate('/');
    }
  }, [user]);

  const fetchEligibleProducts = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        '/api/reviews/eligible-orders',
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setEligibleProducts(response.data.eligibleProducts);
      } else {
        toast.error(response.data.message || 'Erro ao carregar produtos');
      }
    } catch (error) {
      console.error('Erro:', error);

      if (error.code === 'ERR_NETWORK') {
        toast.error('Erro de rede. Verifique a conexão.');
      } else if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
        navigate('/');
      } else {
        toast.error('Erro ao carregar produtos');
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
      return toast.error('Selecione ou digite um título');
    }
    if (!comment.trim()) {
      return toast.error('Selecione ou escreva um comentário');
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        '/api/reviews/create',
        {
          orderId: selectedProduct.orderId,
          productId: selectedProduct.product._id,
          rating,
          title: title.trim(),
          comment: comment.trim(),
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Review enviado com sucesso!');
        setSelectedProduct(null);
        setRating(0);
        setTitle('');
        setComment('');
        fetchEligibleProducts();
        setTimeout(() => navigate('/my-orders'), 2000);
      } else {
        toast.error(response.data.message || 'Erro ao enviar review');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente');
        navigate('/');
      } else {
        toast.error('Erro ao enviar review');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Componente de Star Rating
  const StarRating = ({ rating, setRating, disabled = false }) => (
    <div className='flex gap-1'>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type='button'
          disabled={disabled}
          onClick={() => !disabled && setRating(star)}
          className={`text-3xl transition-all duration-200 ${
            star <= rating
              ? 'text-yellow-500 scale-110'
              : 'text-gray-300 hover:text-yellow-400 hover:scale-105'
          } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
        >
          ★
        </button>
      ))}
      {rating > 0 && (
        <span className='ml-2 text-sm text-gray-600 self-center'>
          {rating === 5 && 'Excelente!'}
          {rating === 4 && 'Muito bom'}
          {rating === 3 && 'Bom'}
          {rating === 2 && 'Razoável'}
          {rating === 1 && 'Fraco'}
        </span>
      )}
    </div>
  );

  // Componente de Chips Selecionáveis
  const SelectableChips = ({ options, selectedValue, onSelect, label }) => (
    <div>
      <label className='block text-sm font-medium text-gray-700 mb-2'>
        {label}
      </label>
      <div className='flex flex-wrap gap-2'>
        {options.map((option, index) => (
          <button
            key={index}
            type='button'
            onClick={() => onSelect(option)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedValue === option
                ? 'bg-primary text-white shadow-md scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  // Componente de Templates de Comentário
  const CommentTemplates = ({ templates, onSelect, currentComment }) => (
    <div>
      <label className='block text-sm font-medium text-gray-700 mb-2'>
        Escolha um template ou escreva o seu:
      </label>
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3'>
        {templates.map((template, index) => (
          <button
            key={index}
            type='button'
            onClick={() => onSelect(template.text)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 text-center ${
              currentComment === template.text && template.text !== ''
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow'
            }`}
          >
            {template.label}
          </button>
        ))}
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className='flex justify-center items-center min-h-[50vh]'>
        <div className='text-center'>
          <p className='text-lg text-gray-600 mb-4'>
            Precisa estar logado para escrever reviews
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
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-10'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2 text-center'>
          Escrever Review
        </h1>
        <p className='text-gray-500 text-center mb-8'>
          A sua opinião ajuda outros surfistas a escolher melhor!
        </p>

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
            <div className='space-x-4'>
              <button
                onClick={() => navigate('/products')}
                className='bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dull transition'
              >
                Explorar Produtos
              </button>
              <button
                onClick={() => navigate('/my-orders')}
                className='bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition'
              >
                Ver Meus Pedidos
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

              <div className='space-y-4 max-h-[500px] overflow-y-auto pr-2'>
                {eligibleProducts.map((item, index) => (
                  <div
                    key={`${item.orderId}-${item.product._id}-${index}`}
                    onClick={() => {
                      setSelectedProduct(item);
                      setRating(0);
                      setTitle('');
                      setComment('');
                    }}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedProduct?.product._id === item.product._id &&
                      selectedProduct?.orderId === item.orderId
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-gray-200 hover:border-primary/50 hover:shadow'
                    }`}
                  >
                    <div className='flex items-center gap-4'>
                      <img
                        src={item.product.image[0]}
                        alt={item.product.name}
                        className='w-16 h-16 object-cover rounded'
                        onError={e => {
                          e.target.src = '/placeholder.jpg';
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
                <form onSubmit={handleSubmitReview} className='space-y-5'>
                  {/* Produto Selecionado */}
                  <div className='bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg'>
                    <div className='flex items-center gap-4'>
                      <img
                        src={selectedProduct.product.image[0]}
                        alt={selectedProduct.product.name}
                        className='w-20 h-20 object-cover rounded shadow'
                        onError={e => {
                          e.target.src = '/placeholder.jpg';
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
                  </div>

                  {/* Títulos pré-definidos */}
                  <SelectableChips
                    options={getTitleSuggestions()}
                    selectedValue={title}
                    onSelect={setTitle}
                    label='Título do Review * (clique para selecionar)'
                  />

                  {/* Input para título personalizado */}
                  <input
                    type='text'
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder='Ou escreva o seu próprio título...'
                    maxLength={100}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm'
                  />

                  {/* Templates de comentário */}
                  <CommentTemplates
                    templates={commentTemplates}
                    onSelect={setComment}
                    currentComment={comment}
                  />

                  {/* Textarea para comentário */}
                  <div>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder='Ou escreva a sua própria experiência...'
                      maxLength={500}
                      rows={4}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      {comment.length}/500 caracteres
                    </p>
                  </div>

                  {/* Botão Submit */}
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-dull hover:shadow-lg'
                    } text-white`}
                  >
                    {isSubmitting ? (
                      <span className='flex items-center justify-center gap-2'>
                        <svg
                          className='animate-spin h-5 w-5'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                            fill='none'
                          />
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          />
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      'Enviar Review'
                    )}
                  </button>
                </form>
              ) : (
                <div className='text-center py-12 bg-gray-50 rounded-lg'>
                  <p className='text-gray-500'>
                    Selecione um produto à esquerda para escrever um review
                  </p>
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