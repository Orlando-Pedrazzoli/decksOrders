import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'Como fazer uma encomenda?',
      answer: `Escolhe o artigo que queres comprar, seleciona o tamanho ou a cor, se disponível e clica em "Adicionar ao Carrinho".

Serás encaminhado para o carrinho de compras. Se quiseres adicionar mais artigos, clica em "Continuar Compras". Quando o carrinho tiver tudo o que precisas, basta clicar em "Finalizar Encomenda".

Depois, escolhe se queres finalizar como convidado ou como utilizador registado e clica em "Continuar". Introduz os dados de envio com atenção (morada, email válido e contacto). Assim que estiver tudo certo, finaliza a compra.

Receberás um email de confirmação com os detalhes da encomenda. Após o pagamento ser confirmado, só precisas de aguardar a entrega.`
    },
    {
      question: 'É necessário registar para efetuar uma encomenda?',
      answer: 'O registo não é obrigatório, mas sugerimos que o faças, porque ter uma conta connosco não só torna as próximas compras mais rápidas, mas também permite-te acumular pontos para descontos futuros.'
    },
    {
      question: 'Quais são os métodos de pagamento disponíveis?',
      answer: `• Cartão de Crédito e PayPal: Aceitamos Visa, Mastercard e American Express. Podes ainda pagar via PayPal, um método rápido e seguro.

• MB WAY: Deves confirmar o pagamento na app MB WAY. Certifica-te de que tens a app instalada, configurada e que tens acesso à internet.

• Multibanco: Paga em qualquer caixa MB ou através do teu Home Banking. Após a encomenda, receberás os dados (Entidade, Referência e Valor). O pagamento é confirmado no prazo de 24h.`
    },
    {
      question: 'Porque razão o meu pagamento pode ser recusado?',
      answer: `Existem várias razões possíveis:

• O cartão pode estar expirado. Confirma a validade.
• O limite do cartão pode ter sido atingido. Contacta o teu banco.
• Os dados introduzidos podem estar errados. Verifica se preencheste tudo corretamente.
• O sistema 3DS pode não estar ativado. Confirma com o teu banco.`
    },
    {
      question: 'É seguro pagar com cartão de crédito?',
      answer: 'Sim, utilizamos encriptação SSL. Para garantir segurança, precisas de inserir o CVV do cartão.'
    },
    {
      question: 'Até quando posso pagar a minha encomenda?',
      answer: 'Tens 24 horas para efetuar o pagamento. Caso contrário, a encomenda será cancelada.'
    },
    {
      question: 'Como é feita a entrega?',
      answer: 'As encomendas são enviadas por transportadora e entregues em mão. Se ninguém estiver em casa, será deixado um aviso para agendar nova entrega. Em alguns casos a encomenda poderá ser entregue num ponto de recolha.'
    },
    {
      question: 'Quais são os prazos de entrega?',
      answer: `• Até 3 dias úteis para Portugal Continental
• Até 14 dias úteis para Açores e Madeira
• Entregas em loja: até 7 dias úteis para Portugal Continental e até 14 dias úteis para a loja na Madeira

Os prazos começam a contar a partir do momento da expedição e podem variar devido a fatores externos, como moradas incorretas ou greves.

Se a encomenda não chegar no prazo, faremos uma investigação junto da transportadora.`
    },
    {
      question: 'Existem taxas alfandegárias?',
      answer: 'Podem haver taxas alfandegárias, se a morada de envio estiver fora da União Europeia ou zona Schengen. Não nos responsabilizamos por eventuais taxas alfandegárias ou outras despesas adicionais.'
    },
    {
      question: 'Quais são os custos dos portes de envio?',
      answer: 'Os portes para Portugal Continental custam 6€, mas são grátis para compras acima de 59€. Para consultar os custos para outras regiões, contacta-nos.'
    },
    {
      question: 'Posso trocar um artigo?',
      answer: `Claro que sim! Tens 30 dias após a receção da encomenda para efetuar trocas.

Para iniciar uma troca, contacta-nos através de pedrazzoliorlando@gmail.com e envia os artigos para:

Avenida Doutor Francisco de Sá Carneiro 3, Apartamento 3D
2780-241 Oeiras
Portugal

O processo pode demorar até 10 dias úteis.`
    },
    {
      question: 'Posso devolver um artigo?',
      answer: `Claro que sim! Tens 30 dias após a receção da encomenda para efetuar uma devolução.

Para iniciar uma devolução, contacta-nos através de pedrazzoliorlando@gmail.com e envia os artigos para:

Avenida Doutor Francisco de Sá Carneiro 3, Apartamento 3D
2780-241 Oeiras
Portugal

O processo pode demorar até 10 dias úteis.`
    },
    {
      question: 'Como funcionam os reembolsos?',
      answer: `Se a encomenda não corresponder às tuas expectativas ou se não houver stock, podes optar por:

• Troca por outro artigo ou crédito para usares numa compra futura
• Reembolso, que será processado pelo mesmo método de pagamento e pode demorar até 15 dias úteis

Nota: Os portes de envio não são reembolsáveis.`
    },
    {
      question: 'Como funcionam os códigos de desconto?',
      answer: 'Se tiveres um código de desconto, insere-o antes de finalizar a compra no campo "Código Promocional" e clica em "Aplicar".'
    },
    {
      question: 'Resolução de conflitos',
      answer: `Se tiveres uma reclamação sobre uma compra online, podes apresentá-la através da plataforma de Resolução Alternativa de Litígios.

Nos termos do Regulamento (UE) n.º 524/2013 do Parlamento Europeu e do Conselho, de 21 de maio de 2013, sobre a resolução de litígios de consumo Online (Regulamento RLL), as empresas devem informar os consumidores da existência da plataforma RLL.

Para apresentar o teu caso ou reclamação, segue este link: https://ec.europa.eu/consumers/odr`
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero Section */}
      <div className='bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white py-16'>
        <div className='max-w-4xl mx-auto px-4'>
          <div className='flex items-center gap-3 mb-4'>
            <HelpCircle className='w-10 h-10' />
            <h1 className='text-3xl md:text-4xl font-bold'>
              Perguntas Mais Frequentes
            </h1>
          </div>
          <p className='text-white/90 text-lg'>
            Dá uma vista de olhos nas respostas às dúvidas mais frequentes para 
            esclarecer qualquer questão sobre os nossos produtos e serviços.
          </p>
          <p className='text-white/80 text-sm mt-2'>
            Se não encontrares a informação que procuras, fala connosco – estamos aqui para ajudar!
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
          {faqs.map((faq, index) => (
            <div key={index} className='border-b border-gray-200 last:border-b-0'>
              <button
                onClick={() => toggleFAQ(index)}
                className='w-full text-left p-6 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4'
              >
                <h3 className='text-lg font-semibold text-gray-900 pr-4'>
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className='w-5 h-5 text-primary flex-shrink-0' />
                ) : (
                  <ChevronDown className='w-5 h-5 text-gray-400 flex-shrink-0' />
                )}
              </button>
              
              {openIndex === index && (
                <div className='px-6 pb-6'>
                  <div className='text-gray-700 leading-relaxed whitespace-pre-line'>
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className='mt-12 bg-white rounded-xl shadow-sm p-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>
            Ainda tens dúvidas?
          </h2>
          <p className='text-gray-700 mb-6'>
            Se não encontraste a resposta que procuravas, contacta-nos diretamente:
          </p>
          
          <div className='grid md:grid-cols-2 gap-4'>
            <div className='bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6'>
              <div className='flex items-center gap-3 mb-2'>
                <Mail className='w-5 h-5 text-primary' />
                <h3 className='font-semibold text-gray-900'>Email</h3>
              </div>
              <a 
                href='mailto:pedrazzoliorlando@gmail.com'
                className='text-primary hover:underline font-medium'
              >
                pedrazzoliorlando@gmail.com
              </a>
              <p className='text-sm text-gray-600 mt-2'>
                Resposta em até 48 horas
              </p>
            </div>

            <div className='bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6'>
              <div className='flex items-center gap-3 mb-2'>
                <Phone className='w-5 h-5 text-primary' />
                <h3 className='font-semibold text-gray-900'>Telefone</h3>
              </div>
              <a 
                href='tel:+351912164220'
                className='text-primary hover:underline font-medium'
              >
                +351 912 164 220
              </a>
              <p className='text-sm text-gray-600 mt-2'>
                Seg-Sex: 9h às 18h
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className='text-center mt-8'>
          <Link
            to='/'
            className='inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dull text-white rounded-lg font-semibold transition-colors'
          >
            Voltar à Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;