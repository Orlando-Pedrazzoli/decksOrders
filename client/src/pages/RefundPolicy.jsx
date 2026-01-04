import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Package, Clock, AlertCircle } from 'lucide-react';
import { SEO, BreadcrumbSchema } from '../components/seo';
import seoConfig from '../components/seo/seoConfig';

const RefundPolicy = () => {
  return (
    <>
      {/* SEO - Página de Política de Reembolso */}
      <SEO 
        title={seoConfig.refund.title}
        description={seoConfig.refund.description}
        url={seoConfig.refund.url}
      >
        <BreadcrumbSchema items={[
          { name: 'Home', url: '/' },
          { name: 'Política de Reembolso' }
        ]} />
      </SEO>

      <div className='min-h-screen bg-gray-50'>
        {/* Hero Section */}
        <div className='bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white py-16'>
          <div className='max-w-4xl mx-auto px-4'>
            <div className='flex items-center gap-3 mb-4'>
              <Package className='w-10 h-10' />
              <h1 className='text-3xl md:text-4xl font-bold'>
                Política de Reembolso
              </h1>
            </div>
            <p className='text-white/90 text-lg'>
              Política de devolução de 30 dias - Sua satisfação é a nossa prioridade
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
            
            {/* Política de Devolução */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                Política de Devolução de 30 Dias
              </h2>
              <p className='text-gray-700 leading-relaxed mb-4'>
                Temos uma política de devolução de 30 dias, por isso, tem 30 dias após 
                receber o seu item para solicitar uma devolução.
              </p>
              <div className='bg-blue-50 border-l-4 border-primary rounded p-4'>
                <p className='text-sm text-gray-700'>
                  <strong>Importante:</strong> Para ser elegível para uma devolução, o seu 
                  item tem de estar nas condições em que o recebeu, não usado e sem desgaste, 
                  com as respetivas etiquetas e na embalagem original. Também terá de apresentar 
                  o recibo ou comprovativo de compra.
                </p>
              </div>
            </section>

            {/* Como Iniciar Devolução */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                Como Iniciar uma Devolução
              </h2>
              <p className='text-gray-700 mb-4'>
                Para iniciar uma devolução, contacte-nos através de:
              </p>
              <div className='bg-gray-50 rounded-lg p-6 space-y-3'>
                <div className='flex items-start gap-3'>
                  <Mail className='w-5 h-5 text-primary mt-1 flex-shrink-0' />
                  <div>
                    <p className='font-semibold text-gray-900'>Email</p>
                    <a 
                      href='mailto:pedrazzoliorlando@gmail.com' 
                      className='text-primary hover:underline'
                    >
                      pedrazzoliorlando@gmail.com
                    </a>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <Package className='w-5 h-5 text-primary mt-1 flex-shrink-0' />
                  <div>
                    <p className='font-semibold text-gray-900'>Endereço de Devolução</p>
                    <p className='text-gray-600'>
                      Avenida Doutor Francisco de Sá Carneiro 3, Apartamento 3D<br />
                      2780-241 Oeiras<br />
                      Portugal
                    </p>
                  </div>
                </div>
              </div>
              <div className='mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded'>
                <p className='text-sm text-gray-700'>
                  <strong>Atenção:</strong> Os itens que nos forem devolvidos sem uma 
                  solicitação prévia de devolução não serão aceites.
                </p>
              </div>
            </section>

            {/* Processo de Devolução */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                Processo de Devolução
              </h2>
              <div className='space-y-4'>
                <div className='flex items-start gap-4'>
                  <div className='w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0'>
                    1
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900 mb-1'>
                      Contacte-nos
                    </h3>
                    <p className='text-gray-600 text-sm'>
                      Envie um email para pedrazzoliorlando@gmail.com com o número do pedido 
                      e motivo da devolução.
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0'>
                    2
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900 mb-1'>
                      Aguarde Aprovação
                    </h3>
                    <p className='text-gray-600 text-sm'>
                      Se a sua devolução for aceite, enviar-lhe-emos instruções sobre como 
                      enviar a embalagem.
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0'>
                    3
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900 mb-1'>
                      Envie o Produto
                    </h3>
                    <p className='text-gray-600 text-sm'>
                      Envie o artigo para o endereço indicado. O processo pode demorar até 
                      10 dias úteis.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Danos e Problemas */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                Danos e Problemas
              </h2>
              <p className='text-gray-700 leading-relaxed'>
                Inspecione a sua encomenda no momento da receção e contacte-nos imediatamente 
                se o item apresentar defeitos, estiver danificado ou se receber um item incorreto, 
                para podermos avaliar o problema e corrigi-lo.
              </p>
            </section>

            {/* Exceções */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                <AlertCircle className='w-6 h-6 text-red-600' />
                Exceções - Itens que Não Podem Ser Devolvidos
              </h2>
              <p className='text-gray-700 mb-4'>
                Certos tipos de itens não podem ser devolvidos:
              </p>
              <ul className='space-y-2'>
                <li className='flex items-start gap-2'>
                  <span className='text-red-600'>•</span>
                  <span className='text-gray-700'>
                    Bens perecíveis (comida, flores ou plantas)
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-red-600'>•</span>
                  <span className='text-gray-700'>
                    Produtos personalizados ou encomendas especiais
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-red-600'>•</span>
                  <span className='text-gray-700'>
                    Produtos de cuidados pessoais (produtos de beleza)
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-red-600'>•</span>
                  <span className='text-gray-700'>
                    Materiais perigosos, líquidos ou gases inflamáveis
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-red-600'>•</span>
                  <span className='text-gray-700'>
                    <strong>Itens em saldos ou cartões de oferta</strong>
                  </span>
                </li>
              </ul>
            </section>

            {/* Trocas */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                Trocas
              </h2>
              <p className='text-gray-700 leading-relaxed'>
                A forma mais rápida de garantir que recebe os itens que pretende é devolver 
                o item e, após a aceitação da devolução, efetuar uma compra separada de um 
                novo item.
              </p>
            </section>

            {/* Período UE */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                Período de Cancelamento de 14 Dias da União Europeia
              </h2>
              <p className='text-gray-700 leading-relaxed'>
                Independentemente do que é referido acima, se os artigos forem enviados para 
                a União Europeia, tem o direito de cancelar ou devolver a sua encomenda dentro 
                de um período de 14 dias, por qualquer motivo e sem obrigatoriedade de fornecer 
                uma justificação.
              </p>
            </section>

            {/* Reembolsos */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                <Clock className='w-6 h-6 text-green-600' />
                Reembolsos
              </h2>
              <p className='text-gray-700 mb-4'>
                Iremos notificá-lo após recebermos e inspecionarmos a sua devolução e iremos 
                informá-lo se o reembolso foi aprovado ou não.
              </p>
              <div className='bg-green-50 border-l-4 border-green-500 rounded p-4 space-y-2'>
                <p className='text-sm text-gray-700'>
                  <strong>Prazo de Reembolso:</strong> Se aprovado, será automaticamente 
                  reembolsado através do seu método de pagamento original dentro de 10 dias úteis.
                </p>
                <p className='text-sm text-gray-700'>
                  Lembre-se de que também pode ser necessário algum tempo até o seu banco ou 
                  empresa de cartão de crédito processar e publicar o reembolso.
                </p>
              </div>
              <div className='mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded'>
                <p className='text-sm text-gray-700'>
                  <strong>Importante:</strong> Se passarem mais de 15 dias úteis após a aprovação 
                  da sua devolução, contacte-nos através de pedrazzoliorlando@gmail.com.
                </p>
              </div>
            </section>

            {/* Contacto */}
            <section className='border-t pt-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                Contacte-nos
              </h2>
              <p className='text-gray-700 mb-6'>
                Se tiver questões sobre a nossa política de reembolso, contacte-nos:
              </p>
              
              <div className='bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 space-y-4'>
                <div className='flex items-center gap-3'>
                  <Mail className='w-5 h-5 text-primary' />
                  <a 
                    href='mailto:pedrazzoliorlando@gmail.com'
                    className='text-primary hover:underline font-medium'
                  >
                    pedrazzoliorlando@gmail.com
                  </a>
                </div>
                <div className='flex items-center gap-3'>
                  <Shield className='w-5 h-5 text-primary' />
                  <span className='text-gray-700'>
                    Tempo de resposta: até 48 horas
                  </span>
                </div>
              </div>
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

export default RefundPolicy;