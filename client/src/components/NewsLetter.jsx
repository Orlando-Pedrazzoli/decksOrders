import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast'; // Make sure to import toast

const NewsLetter = () => {
  const form = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- IMPORTANT ---
  // Using the SERVICE_ID and TEMPLATE_ID directly from your .env file.
  // If you later decide to have a separate EmailJS template/service for the newsletter
  // versus your contact form, you should then create distinct environment variables
  // like VITE_EMAILJS_NEWSLETTER_SERVICE_ID, etc.
  // For now, this uses the IDs you provided.
  // --- IMPORTANT ---
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID; // Changed to match your .env
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID; // Changed to match your .env
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const sendSubscriptionEmail = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Ensure the email input has a 'name' attribute, e.g., name='user_email'
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY);

      // Show success toast message
      toast.success(
        '🎉 Boas-vindas à nossa comunidade! Em breve, receberá ofertas e novidades exclusivas diretamente na sua caixa de entrada. Fique atento!',
        {
          duration: 6000, // Keep the toast visible a bit longer
          position: 'bottom-center', // Adjust position as needed
        }
      );

      form.current.reset(); // Clear the input field
    } catch (error) {
      console.error('Erro ao subscrever e-mail:', error);
      toast.error(
        '❌ Ops! Não foi possível subscrever neste momento. Por favor, tente novamente mais tarde.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center text-center space-y-2 mt-24 pb-14 px-6 md:px-16 lg:px-24 xl:px-32'>
      <h1 className='md:text-4xl text-2xl font-semibold'>
        Nunca percas uma oportunidade!
      </h1>
      <p className='md:text-lg text-gray-500/70 pb-8'>
        Subscreve para receberes as últimas ofertas, novidades e descontos
        exclusivos.
      </p>
      <form
        ref={form}
        onSubmit={sendSubscriptionEmail}
        className='flex items-center justify-between max-w-2xl w-full md:h-13 h-12'
      >
        <input
          className='border border-gray-300 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-gray-500'
          type='email' // Changed to type='email' for better validation
          name='user_email' // Added 'name' attribute for EmailJS to pick up the value
          placeholder='O seu email' // Updated placeholder to Portuguese
          required
        />
        <button
          type='submit'
          disabled={isSubmitting}
          className={`md:px-12 px-8 h-full text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer rounded-md rounded-l-none ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Subscrevendo...' : 'Subscrever'}
        </button>
      </form>
    </div>
  );
};

export default NewsLetter;