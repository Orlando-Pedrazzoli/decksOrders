import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertCircle } from 'lucide-react';
import { SEO, BreadcrumbSchema } from '../components/seo';
import seoConfig from '../components/seo/seoConfig';

const Terms = () => {
  return (
    <>
      {/* SEO - Página de Termos e Condições */}
      <SEO 
        title={seoConfig.terms.title}
        description={seoConfig.terms.description}
        url={seoConfig.terms.url}
      >
        <BreadcrumbSchema items={[
          { name: 'Home', url: '/' },
          { name: 'Termos e Condições' }
        ]} />
      </SEO>

      <div className='min-h-screen bg-gray-50'>
        {/* Hero Section */}
        <div className='bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white py-16'>
          <div className='max-w-4xl mx-auto px-4'>
            <div className='flex items-center gap-3 mb-4'>
              <FileText className='w-10 h-10' />
              <h1 className='text-3xl md:text-4xl font-bold'>
                Termos e Condições
              </h1>
            </div>
            <p className='text-white/90 text-lg'>
              Condições gerais de venda e utilização da Elite Surfing
            </p>
            <p className='text-white/80 text-sm mt-2'>
              Última atualização: {new Date().toLocaleDateString('pt-PT', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className='max-w-4xl mx-auto px-4 py-12'>
          <div className='bg-white rounded-xl shadow-sm p-8 space-y-8'>
            
            {/* Introdução */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                1. Introdução
              </h2>
              <p className='text-gray-700 leading-relaxed'>
                Bem-vindo à Elite Surfing. Ao aceder e utilizar este website, aceita 
                estar vinculado a estes termos e condições de utilização. Se não concordar 
                com alguma parte destes termos, não deve utilizar o nosso website.
              </p>
            </section>

            {/* Identificação */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                2. Identificação
              </h2>
              <div className='bg-gray-50 rounded-lg p-6 space-y-2'>
                <p className='text-gray-700'>
                  <strong>Nome:</strong> Elite Surfing
                </p>
                <p className='text-gray-700'>
                  <strong>Sede:</strong> Avenida Doutor Francisco de Sá Carneiro 3, Apartamento 3D, 
                  2780-241 Oeiras, Portugal
                </p>
                <p className='text-gray-700'>
                  <strong>Email:</strong> pedrazzoliorlando@gmail.com
                </p>
                <p className='text-gray-700'>
                  <strong>Telefone:</strong> +351 912 164 220
                </p>
              </div>
            </section>

            {/* Objeto */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                3. Objeto
              </h2>
              <p className='text-gray-700 leading-relaxed'>
                Os presentes termos e condições regulam a utilização do website Elite Surfing 
                e a aquisição de produtos através da nossa loja online. Ao efetuar uma compra, 
                o cliente declara ter lido, compreendido e aceite os presentes termos e condições.
              </p>
            </section>

            {/* Encomendas */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                4. Encomendas e Pagamento
              </h2>
              <div className='space-y-4'>
                <div>
                  <h3 className='font-semibold text-gray-900 mb-2'>4.1. Processo de Encomenda</h3>
                  <p className='text-gray-700'>
                    Ao efetuar uma encomenda, o cliente receberá um email de confirmação com 
                    todos os detalhes. A encomenda só será processada após confirmação do pagamento.
                  </p>
                </div>

                <div>
                  <h3 className='font-semibold text-gray-900 mb-2'>4.2. Prazo de Pagamento</h3>
                  <p className='text-gray-700'>
                    O cliente tem 24 horas para efetuar o pagamento. Caso contrário, a encomenda 
                    será automaticamente cancelada.
                  </p>
                </div>

                <div>
                  <h3 className='font-semibold text-gray-900 mb-2'>4.3. Métodos de Pagamento</h3>
                  <ul className='list-disc list-inside text-gray-700 space-y-1'>
                    <li>Cartão de Crédito/Débito (Visa, Mastercard, American Express)</li>
                    <li>PayPal</li>
                    <li>MB WAY</li>
                    <li>Multibanco</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Preços */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                5. Preços e Promoções
              </h2>
              <p className='text-gray-700 leading-relaxed mb-4'>
                Todos os preços apresentados no website incluem IVA à taxa legal em vigor. 
                Os preços podem ser alterados sem aviso prévio, mas a alteração não afetará 
                encomendas já confirmadas.
              </p>
              <p className='text-gray-700 leading-relaxed'>
                As promoções são válidas durante o período indicado e sujeitas a stock disponível.
              </p>
            </section>

            {/* Envio */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                6. Envio e Entrega
              </h2>
              <div className='space-y-4'>
                <div>
                  <h3 className='font-semibold text-gray-900 mb-2'>6.1. Custos de Envio</h3>
                  <ul className='list-disc list-inside text-gray-700 space-y-1'>
                    <li>Portugal Continental: 6€ (grátis para compras acima de 59€)</li>
                    <li>Açores e Madeira: Consultar</li>
                    <li>Envios internacionais: Consultar</li>
                  </ul>
                </div>

                <div>
                  <h3 className='font-semibold text-gray-900 mb-2'>6.2. Prazos de Entrega</h3>
                  <ul className='list-disc list-inside text-gray-700 space-y-1'>
                    <li>Portugal Continental: Até 3 dias úteis</li>
                    <li>Açores e Madeira: Até 14 dias úteis</li>
                  </ul>
                  <p className='text-gray-600 text-sm mt-2'>
                    Os prazos começam a contar após confirmação do pagamento e expedição da encomenda.
                  </p>
                </div>

                <div>
                  <h3 className='font-semibold text-gray-900 mb-2'>6.3. Responsabilidade</h3>
                  <p className='text-gray-700'>
                    Não nos responsabilizamos por atrasos causados por fatores externos 
                    (greves, condições meteorológicas, moradas incorretas, etc.).
                  </p>
                </div>
              </div>
            </section>

            {/* Devoluções */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                7. Direito de Devolução
              </h2>
              <p className='text-gray-700 leading-relaxed mb-4'>
                De acordo com a legislação portuguesa e europeia, tem direito a devolver os 
                produtos adquiridos no prazo de 30 dias após a receção, sem necessidade de 
                justificação.
              </p>
              <div className='bg-blue-50 border-l-4 border-primary rounded p-4'>
                <p className='text-sm text-gray-700'>
                  Para mais informações, consulte a nossa{' '}
                  <Link to='/refund-policy' className='text-primary hover:underline font-semibold'>
                    Política de Reembolso
                  </Link>
                  .
                </p>
              </div>
            </section>

            {/* Garantias */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                8. Garantias
              </h2>
              <p className='text-gray-700 leading-relaxed'>
                Todos os produtos comercializados pela Elite Surfing dispõem de garantia legal 
                de 2 anos, conforme previsto na legislação portuguesa. Em caso de defeito, 
                o cliente pode solicitar reparação, substituição, redução do preço ou resolução 
                do contrato.
              </p>
            </section>

            {/* Propriedade Intelectual */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                9. Propriedade Intelectual
              </h2>
              <p className='text-gray-700 leading-relaxed'>
                Todos os conteúdos presentes neste website (textos, imagens, logótipos, design) 
                são propriedade da Elite Surfing e estão protegidos por direitos de autor. 
                É proibida a reprodução, distribuição ou utilização sem autorização prévia.
              </p>
            </section>

            {/* Proteção de Dados */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                10. Proteção de Dados Pessoais
              </h2>
              <p className='text-gray-700 leading-relaxed mb-4'>
                Os dados pessoais recolhidos são tratados de acordo com o Regulamento Geral 
                de Proteção de Dados (RGPD) e a legislação portuguesa aplicável.
              </p>
              <div className='bg-blue-50 border-l-4 border-primary rounded p-4'>
                <p className='text-sm text-gray-700'>
                  Para mais informações, consulte a nossa{' '}
                  <Link to='/privacy' className='text-primary hover:underline font-semibold'>
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </div>
            </section>

            {/* Resolução de Litígios */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                11. Resolução de Litígios
              </h2>
              <p className='text-gray-700 leading-relaxed mb-4'>
                Em caso de litígio, o consumidor pode recorrer a uma Entidade de Resolução 
                Alternativa de Litígios de Consumo ou à plataforma europeia de resolução de 
                litígios online (Regulamento UE n.º 524/2013).
              </p>
              <div className='bg-gray-50 rounded-lg p-4'>
                <p className='text-sm text-gray-700'>
                  <strong>Plataforma RLL:</strong>{' '}
                  <a 
                    href='https://ec.europa.eu/consumers/odr' 
                    target='_blank' 
                    rel='noopener noreferrer'
                    className='text-primary hover:underline'
                  >
                    https://ec.europa.eu/consumers/odr
                  </a>
                </p>
              </div>
            </section>

            {/* Lei Aplicável */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                12. Lei Aplicável e Foro
              </h2>
              <p className='text-gray-700 leading-relaxed'>
                Os presentes termos e condições regem-se pela lei portuguesa. Para resolução 
                de qualquer litígio, será competente o foro da comarca da área de residência 
                do consumidor.
              </p>
            </section>

            {/* Alterações */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                <AlertCircle className='w-6 h-6 text-yellow-600' />
                13. Alterações aos Termos
              </h2>
              <p className='text-gray-700 leading-relaxed'>
                A Elite Surfing reserva-se o direito de alterar estes termos e condições a 
                qualquer momento. As alterações entram em vigor no momento da sua publicação 
                no website.
              </p>
            </section>

            {/* CTA */}
            <div className='text-center pt-8 border-t'>
              <Link
                to='/'
                className='inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dull text-white rounded-lg font-semibold transition-colors'
              >
                Voltar à Página Inicial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;