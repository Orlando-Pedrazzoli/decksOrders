import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { SEO, BreadcrumbSchema } from '../components/seo';
import seoConfig from '../components/seo/seoConfig';

const Privacy = () => {
  return (
    <>
      {/* SEO - Página de Privacidade */}
      <SEO 
        title={seoConfig.privacy.title}
        description={seoConfig.privacy.description}
        url={seoConfig.privacy.url}
      >
        <BreadcrumbSchema items={[
          { name: 'Home', url: '/' },
          { name: 'Política de Privacidade' }
        ]} />
      </SEO>

      <div className='min-h-screen bg-gray-50'>
        {/* Hero Section */}
        <div className='bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white py-16'>
          <div className='max-w-4xl mx-auto px-4'>
            <div className='flex items-center gap-3 mb-4'>
              <Shield className='w-10 h-10' />
              <h1 className='text-3xl md:text-4xl font-bold'>
                Política de Privacidade
              </h1>
            </div>
            <p className='text-white/90 text-lg'>
              Comprometidos com a proteção dos seus dados pessoais
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
                A Elite Surfing, com sede em Portugal, respeita a sua privacidade e está 
                comprometida em proteger os seus dados pessoais. Esta política de privacidade 
                informa-o sobre como tratamos os seus dados pessoais quando visita o nosso 
                website (independentemente de onde nos visita) e informa-o sobre os seus 
                direitos de privacidade e como a lei o protege.
              </p>
              <div className='mt-4 p-4 bg-blue-50 border-l-4 border-primary rounded'>
                <p className='text-sm text-gray-700'>
                  <strong>RGPD:</strong> Esta política está em conformidade com o Regulamento 
                  Geral sobre a Proteção de Dados (RGPD - UE 2016/679) e a Lei n.º 58/2019, 
                  de 8 de agosto, que garante a execução do RGPD em Portugal.
                </p>
              </div>
            </section>

            {/* Responsável pelo Tratamento */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                2. Responsável pelo Tratamento de Dados
              </h2>
              <p className='text-gray-700 mb-4'>
                O responsável pelo tratamento dos seus dados pessoais é:
              </p>
              <div className='bg-gray-50 rounded-lg p-6 space-y-3'>
                <div className='flex items-start gap-3'>
                  <MapPin className='w-5 h-5 text-primary mt-1 flex-shrink-0' />
                  <div>
                    <p className='font-semibold text-gray-900'>Elite Surfing</p>
                    <p className='text-gray-600'>Lisboa, Portugal</p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <Mail className='w-5 h-5 text-primary mt-1 flex-shrink-0' />
                  <div>
                    <p className='text-gray-600'>
                      Email: <a href='mailto:pedrazzoliorlando@gmail.com' className='text-primary hover:underline'>
                        pedrazzoliorlando@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <Phone className='w-5 h-5 text-primary mt-1 flex-shrink-0' />
                  <div>
                    <p className='text-gray-600'>Telefone: +351 912 164 220</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Dados que Recolhemos */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                3. Dados Pessoais que Recolhemos
              </h2>
              <p className='text-gray-700 mb-4'>
                Podemos recolher, usar, armazenar e transferir diferentes tipos de dados 
                pessoais sobre si, que agrupámos da seguinte forma:
              </p>
              
              <div className='space-y-4'>
                <div className='border-l-4 border-primary pl-4'>
                  <h3 className='font-semibold text-gray-900 mb-2'>
                    a) Dados de Identidade
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    Nome, apelido, nome de utilizador ou identificador similar.
                  </p>
                </div>

                <div className='border-l-4 border-primary pl-4'>
                  <h3 className='font-semibold text-gray-900 mb-2'>
                    b) Dados de Contacto
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    Endereço de e-mail, morada de entrega, números de telefone.
                  </p>
                </div>

                <div className='border-l-4 border-primary pl-4'>
                  <h3 className='font-semibold text-gray-900 mb-2'>
                    c) Dados de Transação
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    Detalhes sobre pagamentos e outros detalhes de produtos e serviços 
                    que adquiriu de nós.
                  </p>
                </div>

                <div className='border-l-4 border-primary pl-4'>
                  <h3 className='font-semibold text-gray-900 mb-2'>
                    d) Dados Técnicos
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    Endereço de protocolo de internet (IP), dados de login, tipo e versão 
                    do navegador, configuração de fuso horário e localização, tipos e versões 
                    de plug-in do navegador, sistema operativo e plataforma.
                  </p>
                </div>

                <div className='border-l-4 border-primary pl-4'>
                  <h3 className='font-semibold text-gray-900 mb-2'>
                    e) Dados de Utilização
                  </h3>
                  <p className='text-gray-600 text-sm'>
                    Informações sobre como usa o nosso website, produtos e serviços.
                  </p>
                </div>
              </div>
            </section>

            {/* Como Usamos os Dados */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                4. Como Usamos os Seus Dados Pessoais
              </h2>
              <p className='text-gray-700 mb-4'>
                Utilizamos os seus dados pessoais apenas quando a lei nos permite. 
                Mais comumente, usaremos os seus dados pessoais nas seguintes circunstâncias:
              </p>
              
              <ul className='space-y-3'>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>
                    <strong>Execução de contrato:</strong> Para processar e entregar a sua 
                    encomenda, gerir pagamentos e comunicar consigo sobre a sua encomenda.
                  </p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>
                    <strong>Interesses legítimos:</strong> Para melhorar o nosso website, 
                    produtos/serviços, marketing e experiência do cliente.
                  </p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>
                    <strong>Consentimento:</strong> Para lhe enviar comunicações de marketing 
                    (apenas se nos der o seu consentimento).
                  </p>
                </li>
                <li className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0'></div>
                  <p className='text-gray-700'>
                    <strong>Obrigação legal:</strong> Para cumprir com obrigações legais e 
                    regulamentares.
                  </p>
                </li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                5. Cookies
              </h2>
              <p className='text-gray-700 mb-4'>
                Utilizamos cookies e tecnologias semelhantes para:
              </p>
              <ul className='space-y-2 mb-4'>
                <li className='flex items-start gap-2'>
                  <span className='text-primary'>•</span>
                  <span className='text-gray-700'>
                    <strong>Cookies Estritamente Necessários:</strong> Essenciais para o 
                    funcionamento do website (ex: carrinho de compras, autenticação).
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary'>•</span>
                  <span className='text-gray-700'>
                    <strong>Cookies de Desempenho:</strong> Analisam como os visitantes usam 
                    o website para melhorar o seu funcionamento.
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary'>•</span>
                  <span className='text-gray-700'>
                    <strong>Cookies de Funcionalidade:</strong> Reconhecem-no quando regressa 
                    ao nosso website e permitem-nos personalizar o conteúdo.
                  </span>
                </li>
              </ul>
              <p className='text-gray-700'>
                Pode gerir as suas preferências de cookies através do banner de cookies que 
                aparece quando visita o nosso website pela primeira vez.
              </p>
            </section>

            {/* Partilha de Dados */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                6. Partilha dos Seus Dados Pessoais
              </h2>
              <p className='text-gray-700 mb-4'>
                Podemos partilhar os seus dados pessoais com:
              </p>
              <ul className='space-y-2'>
                <li className='flex items-start gap-2'>
                  <span className='text-primary'>•</span>
                  <span className='text-gray-700'>
                    <strong>Prestadores de serviços:</strong> Empresas que prestam serviços 
                    de TI, processamento de pagamentos, entrega de encomendas e marketing.
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary'>•</span>
                  <span className='text-gray-700'>
                    <strong>Autoridades:</strong> Quando exigido por lei ou para proteger os 
                    nossos direitos legais.
                  </span>
                </li>
              </ul>
              <div className='mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded'>
                <p className='text-sm text-gray-700'>
                  <strong>Garantia:</strong> Exigimos que todas as terceiras partes respeitem 
                  a segurança dos seus dados pessoais e os tratem de acordo com a lei. Não 
                  permitimos que os nossos prestadores de serviços terceiros usem os seus dados 
                  pessoais para os seus próprios fins.
                </p>
              </div>
            </section>

            {/* Segurança */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                7. Segurança dos Dados
              </h2>
              <p className='text-gray-700'>
                Implementámos medidas de segurança adequadas para evitar que os seus dados 
                pessoais sejam perdidos, usados ou acedidos de forma não autorizada, alterados 
                ou divulgados acidentalmente. Limitamos o acesso aos seus dados pessoais 
                àqueles funcionários, agentes, contratantes e outras terceiras partes que 
                tenham uma necessidade comercial de conhecê-los.
              </p>
            </section>

            {/* Retenção de Dados */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                8. Retenção de Dados
              </h2>
              <p className='text-gray-700'>
                Apenas reteremos os seus dados pessoais pelo tempo necessário para cumprir 
                os fins para os quais os recolhemos, incluindo para fins de satisfazer 
                quaisquer requisitos legais, contabilísticos ou de relatório. Após este período, 
                os seus dados serão eliminados ou anonimizados de forma segura.
              </p>
            </section>

            {/* Direitos do Titular */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                9. Os Seus Direitos Legais
              </h2>
              <p className='text-gray-700 mb-4'>
                De acordo com o RGPD, tem os seguintes direitos:
              </p>
              
              <div className='grid md:grid-cols-2 gap-4'>
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h3 className='font-semibold text-gray-900 mb-2'>
                    ✓ Direito de Acesso
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Aceder aos seus dados pessoais que detemos.
                  </p>
                </div>

                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h3 className='font-semibold text-gray-900 mb-2'>
                    ✓ Direito de Retificação
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Corrigir dados pessoais incorretos ou incompletos.
                  </p>
                </div>

                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h3 className='font-semibold text-gray-900 mb-2'>
                    ✓ Direito ao Apagamento
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Solicitar a eliminação dos seus dados pessoais.
                  </p>
                </div>

                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h3 className='font-semibold text-gray-900 mb-2'>
                    ✓ Direito de Oposição
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Opor-se ao processamento dos seus dados pessoais.
                  </p>
                </div>

                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h3 className='font-semibold text-gray-900 mb-2'>
                    ✓ Direito à Portabilidade
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Receber os seus dados num formato estruturado.
                  </p>
                </div>

                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h3 className='font-semibold text-gray-900 mb-2'>
                    ✓ Direito de Limitação
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Restringir o processamento dos seus dados.
                  </p>
                </div>
              </div>

              <div className='mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded'>
                <p className='text-sm text-gray-700'>
                  <strong>Como exercer os seus direitos:</strong> Para exercer qualquer um 
                  destes direitos, por favor contacte-nos através de{' '}
                  <a href='mailto:pedrazzoliorlando@gmail.com' className='text-primary hover:underline'>
                    pedrazzoliorlando@gmail.com
                  </a>. Responderemos no prazo de 30 dias.
                </p>
              </div>
            </section>

            {/* Reclamações */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                10. Direito de Reclamação
              </h2>
              <p className='text-gray-700 mb-4'>
                Se não estiver satisfeito com a forma como tratamos os seus dados pessoais, 
                tem o direito de apresentar uma reclamação junto da autoridade de supervisão:
              </p>
              <div className='bg-gray-50 rounded-lg p-6'>
                <h3 className='font-semibold text-gray-900 mb-3'>
                  Comissão Nacional de Proteção de Dados (CNPD)
                </h3>
                <div className='space-y-2 text-sm text-gray-700'>
                  <p><strong>Morada:</strong> Av. D. Carlos I, 134 - 1.º, 1200-651 Lisboa</p>
                  <p><strong>Telefone:</strong> +351 213 928 400</p>
                  <p><strong>Email:</strong> geral@cnpd.pt</p>
                  <p><strong>Website:</strong>{' '}
                    <a 
                      href='https://www.cnpd.pt' 
                      target='_blank' 
                      rel='noopener noreferrer'
                      className='text-primary hover:underline'
                    >
                      www.cnpd.pt
                    </a>
                  </p>
                </div>
              </div>
            </section>

            {/* Alterações */}
            <section>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                11. Alterações a Esta Política
              </h2>
              <p className='text-gray-700'>
                Podemos atualizar esta política de privacidade periodicamente. Quaisquer 
                alterações serão publicadas nesta página com uma data de "última atualização" 
                revista. Recomendamos que consulte esta página regularmente para se manter 
                informado sobre como protegemos os seus dados.
              </p>
            </section>

            {/* Contacto */}
            <section className='border-t pt-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                12. Contacte-nos
              </h2>
              <p className='text-gray-700 mb-6'>
                Se tiver questões sobre esta política de privacidade ou sobre o tratamento 
                dos seus dados pessoais, por favor contacte-nos:
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
                  <Phone className='w-5 h-5 text-primary' />
                  <span className='text-gray-700 font-medium'>+351 912 164 220</span>
                </div>
                <div className='flex items-center gap-3'>
                  <Clock className='w-5 h-5 text-primary' />
                  <span className='text-gray-700'>
                    Tempo de resposta: até 30 dias
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

export default Privacy;