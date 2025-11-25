import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';
import { Facebook, Instagram, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className='bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200'>
      <div className='px-6 md:px-16 lg:px-24 xl:px-32 py-16'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8'>
          
          {/* Coluna 1 - Logo e Redes Sociais */}
          <div className='lg:col-span-1'>
            <Link to='/' className='inline-block mb-6'>
              <img 
                className='w-28 hover:opacity-80 transition-opacity' 
                src={assets.logo_es} 
                alt='Elite Surfing' 
              />
            </Link>

            <div className='space-y-3'>
              <h3 className='font-bold text-gray-900 text-xs uppercase tracking-wide'>
                Segue-nos
              </h3>
              <div className='flex items-center gap-2'>
                <a
                  href='https://www.instagram.com/elitesurfingeurope'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='group relative w-9 h-9 bg-white rounded-lg flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 hover:border-transparent overflow-hidden'
                  aria-label='Instagram'
                >
                  <div className='absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                  <Instagram className='w-4 h-4 relative z-10' />
                </a>
                <a
                  href='https://web.facebook.com/elitesurfingeurope'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='group relative w-9 h-9 bg-white rounded-lg flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 hover:border-transparent overflow-hidden'
                  aria-label='Facebook'
                >
                  <div className='absolute inset-0 bg-[#1877F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                  <Facebook className='w-4 h-4 relative z-10' />
                </a>
              </div>
            </div>
          </div>

          {/* Coluna 2 - Navegação */}
          <div>
            <h3 className='font-bold text-gray-900 text-sm uppercase tracking-wide mb-5 pb-2 border-b-2 border-primary/20'>
              Navegação
            </h3>
            <ul className='space-y-3'>
              <li>
                <Link
                  to='/'
                  className='text-gray-600 hover:text-primary transition-colors text-sm flex items-center gap-2 group'
                >
                  <span className='w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary transition-colors'></span>
                  Início
                </Link>
              </li>
              <li>
                <Link
                  to='/products'
                  className='text-gray-600 hover:text-primary transition-colors text-sm flex items-center gap-2 group'
                >
                  <span className='w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary transition-colors'></span>
                  Produtos
                </Link>
              </li>
              <li>
                <Link
                  to='/contact'
                  className='text-gray-600 hover:text-primary transition-colors text-sm flex items-center gap-2 group'
                >
                  <span className='w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary transition-colors'></span>
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3 - Informação Legal */}
          <div>
            <h3 className='font-bold text-gray-900 text-sm uppercase tracking-wide mb-5 pb-2 border-b-2 border-primary/20'>
              Informação Legal
            </h3>
            <ul className='space-y-3'>
              <li>
                <Link
                  to='/privacy'
                  className='text-gray-600 hover:text-primary transition-colors text-sm flex items-center gap-2 group'
                >
                  <span className='w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary transition-colors'></span>
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  to='/refund-policy'
                  className='text-gray-600 hover:text-primary transition-colors text-sm flex items-center gap-2 group'
                >
                  <span className='w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary transition-colors'></span>
                  Política de Reembolso
                </Link>
              </li>
              <li>
                <Link
                  to='/terms'
                  className='text-gray-600 hover:text-primary transition-colors text-sm flex items-center gap-2 group'
                >
                  <span className='w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary transition-colors'></span>
                  Termos e Condições
                </Link>
              </li>
              <li>
                <Link
                  to='/faq'
                  className='text-gray-600 hover:text-primary transition-colors text-sm flex items-center gap-2 group'
                >
                  <span className='w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary transition-colors'></span>
                  Perguntas Frequentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4 - Conta */}
          <div>
            <h3 className='font-bold text-gray-900 text-sm uppercase tracking-wide mb-5 pb-2 border-b-2 border-primary/20'>
              Conta
            </h3>
            <ul className='space-y-3'>
              <li>
                <Link
                  to='/my-orders'
                  className='text-gray-600 hover:text-primary transition-colors text-sm flex items-center gap-2 group'
                >
                  <span className='w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary transition-colors'></span>
                  Os Meus Pedidos
                </Link>
              </li>
              <li>
                <Link
                  to='/cart'
                  className='text-gray-600 hover:text-primary transition-colors text-sm flex items-center gap-2 group'
                >
                  <span className='w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary transition-colors'></span>
                  Carrinho
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 5 - Contactos */}
          <div className='lg:col-span-2'>
            <h3 className='font-bold text-gray-900 text-sm uppercase tracking-wide mb-5 pb-2 border-b-2 border-primary/20'>
              Contactos
            </h3>
            <ul className='space-y-3'>
              <li>
                <a
                  href='mailto:pedrazzoliorlando@gmail.com'
                  className='text-gray-600 hover:text-primary transition-colors text-sm flex items-start gap-2 group'
                >
                  <Mail className='w-4 h-4 mt-0.5 flex-shrink-0 text-primary' />
                  <span className='break-all'>pedrazzoliorlando@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href='tel:+351912164220'
                  className='text-gray-600 hover:text-primary transition-colors text-sm flex items-start gap-2 group'
                >
                  <Phone className='w-4 h-4 mt-0.5 flex-shrink-0 text-primary' />
                  <span>+351 912 164 220</span>
                </a>
              </li>
              <li className='flex items-start gap-2 text-gray-600 text-sm'>
                <MapPin className='w-4 h-4 mt-0.5 flex-shrink-0 text-primary' />
                <span>
                  Av. Dr. Francisco de Sá Carneiro 3, Apartamento 3D, 2780-241 Oeiras, Portugal
                </span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className='border-t border-gray-200 bg-white'>
        <div className='px-6 md:px-16 lg:px-24 xl:px-32 py-6'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
            <p className='text-sm text-gray-500 text-center md:text-left'>
              © {new Date().getFullYear()} Elite Surfing. Todos os direitos reservados.
            </p>
            <div className='flex items-center gap-2 text-sm text-gray-500'>
              <span>Desenvolvido por</span>
              <a
                href='https://orlandopedrazzoli.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary hover:underline font-semibold inline-flex items-center gap-1'
              >
                Pedrazzoli.dev
                <ExternalLink className='w-3 h-3' />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;