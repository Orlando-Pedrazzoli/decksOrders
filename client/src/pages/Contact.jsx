import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
// ✅ ATUALIZADO: Adicionado ContactPageSchema
import { SEO, LocalBusinessSchema, BreadcrumbSchema, ContactPageSchema } from '../components/seo';
import seoConfig from '../components/seo/seoConfig';

const Contact = () => {
  const form = useRef();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Variáveis de ambiente
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const sendEmail = e => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);
    setError(false);

    emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY).then(
      () => {
        setSuccess(true);
        setError(false);
        form.current.reset();
        setIsSubmitting(false);
      },
      err => {
        setSuccess(false);
        setError(true);
        setIsSubmitting(false);
        console.error('Erro ao enviar e-mail:', err.text);
      }
    );
  };

  return (
    <>
      {/* ✅ SEO - Página de Contacto com LocalBusiness + ContactPage Schemas */}
      <SEO 
        title={seoConfig.contact.title}
        description={seoConfig.contact.description}
        url={seoConfig.contact.url}
      >
        <LocalBusinessSchema />
        <ContactPageSchema />
        <BreadcrumbSchema items={[
          { name: 'Home', url: '/' },
          { name: 'Contacto' }
        ]} />
      </SEO>

      <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
        <div className='bg-white rounded-lg shadow-md p-6 sm:p-8'>
          <div className='mb-8'>
            <div className='flex flex-col items-start w-max'>
              <h2 className='text-2xl md:text-3xl font-medium'>
                Entre em contacto
              </h2>
              <div className='w-full h-1 bg-primary rounded-full mt-2'></div>
            </div>
            <p className='text-gray-600 mt-4'>
              Preencha o formulário abaixo e entraremos em contacto o mais breve
              possível.
            </p>
          </div>

          <form ref={form} onSubmit={sendEmail} className='space-y-6'>
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Seu nome
              </label>
              <input
                type='text'
                id='name'
                name='name'
                placeholder='Ex: João Silva'
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition duration-200'
              />
            </div>

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Seu e-mail
              </label>
              <input
                type='email'
                id='email'
                name='email'
                placeholder='Ex: joao@exemplo.com'
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition duration-200'
              />
            </div>

            <div>
              <label
                htmlFor='message'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Sua mensagem
              </label>
              <textarea
                id='message'
                name='message'
                placeholder='Escreva sua mensagem aqui...'
                required
                rows={5}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition duration-200'
              ></textarea>
            </div>

            <div className='pt-2'>
              <button
                type='submit'
                disabled={isSubmitting}
                style={{ backgroundColor: 'var(--color-primary)' }}
                className={`w-full px-6 py-3 text-white font-medium rounded-lg hover:brightness-90 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar mensagem'}
              </button>
            </div>
          </form>

          {success && (
            <div className='mt-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
              <p className='text-green-700 font-medium'>
                ✓ Mensagem enviada com sucesso!
              </p>
              <p className='text-green-600 mt-1'>
                Entraremos em contacto em breve.
              </p>
            </div>
          )}

          {error && (
            <div className='mt-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-red-700 font-medium'>Erro ao enviar mensagem</p>
              <p className='text-red-600 mt-1'>
                Por favor, tente novamente mais tarde.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Contact;