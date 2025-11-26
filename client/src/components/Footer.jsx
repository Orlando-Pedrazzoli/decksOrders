import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';
import { 
  Facebook, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  Shield,
  Lock,
  Truck,
  RotateCcw,
  CreditCard,
  CheckCircle
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className='bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200'>
      
      {/* Trust Badges Bar - Garantias */}
      <div className='bg-white border-b border-gray-200'>
        <div className='px-6 md:px-16 lg:px-24 xl:px-32 py-6'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8'>
            {/* Pagamento Seguro */}
            <div className='flex items-center gap-3 justify-center md:justify-start'>
              <div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0'>
                <Lock className='w-6 h-6 text-primary' />
              </div>
              <div>
                <p className='font-bold text-gray-800 text-sm'>Pagamento Seguro</p>
                <p className='text-xs text-gray-500'>Encriptação SSL 256-bit</p>
              </div>
            </div>

            {/* Envio Rápido */}
            <div className='flex items-center gap-3 justify-center md:justify-start'>
              <div className='w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0'>
                <Truck className='w-6 h-6 text-blue-600' />
              </div>
              <div>
                <p className='font-bold text-gray-800 text-sm'>Envio Rápido</p>
                <p className='text-xs text-gray-500'>Entrega em 2-5 dias úteis</p>
              </div>
            </div>

            {/* Devolução Fácil */}
            <div className='flex items-center gap-3 justify-center md:justify-start'>
              <div className='w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0'>
                <RotateCcw className='w-6 h-6 text-orange-500' />
              </div>
              <div>
                <p className='font-bold text-gray-800 text-sm'>Devolução Fácil</p>
                <p className='text-xs text-gray-500'>14 dias para devolver</p>
              </div>
            </div>

            {/* Suporte */}
            <div className='flex items-center gap-3 justify-center md:justify-start'>
              <div className='w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0'>
                <Phone className='w-6 h-6 text-purple-600' />
              </div>
              <div>
                <p className='font-bold text-gray-800 text-sm'>Apoio ao Cliente</p>
                <p className='text-xs text-gray-500'>Seg-Sex 9h-18h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className='px-6 md:px-16 lg:px-24 xl:px-32 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8'>
          
          {/* Coluna 1 - Logo e Redes Sociais */}
          <div className='lg:col-span-1'>
            <Link to='/' className='inline-block mb-5'>
              <img 
                className='w-28 hover:opacity-80 transition-opacity' 
                src={assets.logo_es} 
                alt='Elite Surfing' 
              />
            </Link>

            <p className='text-sm text-gray-600 mb-4'>
              A tua loja de surf em Portugal. Qualidade e paixão pelo mar desde 2010.
            </p>

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
              A Minha Conta
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

      {/* Payment Methods & Security Bar */}
      <div className='border-t border-gray-200 bg-white'>
        <div className='px-6 md:px-16 lg:px-24 xl:px-32 py-6'>
          <div className='flex flex-col lg:flex-row items-center justify-between gap-6'>
            
            {/* Métodos de Pagamento */}
            <div className='flex flex-col items-center lg:items-start gap-3'>
              <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                Métodos de Pagamento
              </p>
              <div className='flex items-center gap-3 flex-wrap justify-center lg:justify-start'>
                {/* Visa */}
                <div className='h-8 px-3 bg-white border border-gray-200 rounded flex items-center justify-center shadow-sm'>
                  <svg viewBox="0 0 48 16" className="h-4" fill="none">
                    <path d="M19.616 15.453h-3.766l2.356-14.453h3.766l-2.356 14.453z" fill="#00579F"/>
                    <path d="M33.734 1.324c-.746-.295-1.916-.608-3.375-.608-3.72 0-6.343 1.973-6.363 4.8-.04 2.085 1.867 3.25 3.29 3.945 1.463.713 1.956 1.178 1.956 1.81-.02.973-1.183 1.42-2.264 1.42-1.503 0-2.308-.227-3.536-.761l-.497-.233-.53 3.278c.886.402 2.517.761 4.216.78 3.96 0 6.53-1.953 6.57-4.968.019-1.655-.992-2.918-3.168-3.963-1.32-.668-2.132-1.12-2.132-1.81.02-.627.687-1.273 2.177-1.273 1.236-.039 2.136.264 2.827.559l.35.156.518-3.132z" fill="#00579F"/>
                    <path d="M39.227 10.113c.31-.832 1.503-4.063 1.503-4.063-.02.039.31-.851.503-1.4l.253 1.264s.726 3.474.876 4.2h-3.135zm4.658-9.113h-2.914c-.907 0-1.58.264-1.975 1.214l-5.602 13.24h3.96l.79-2.183h4.84c.117.51.466 2.183.466 2.183h3.5L43.886 1z" fill="#00579F"/>
                    <path d="M15.63 1L11.93 10.68l-.398-2.027c-.69-2.34-2.847-4.874-5.262-6.14L9.63 15.433h3.99L19.62 1h-3.99z" fill="#00579F"/>
                    <path d="M7.73 1H1.848l-.05.264c4.73 1.205 7.86 4.118 9.165 7.618l-1.322-6.677C9.39 1.303 8.697 1.02 7.73 1z" fill="#FAA61A"/>
                  </svg>
                </div>

                {/* Mastercard */}
                <div className='h-8 px-3 bg-white border border-gray-200 rounded flex items-center justify-center shadow-sm'>
                  <svg viewBox="0 0 48 30" className="h-5" fill="none">
                    <circle cx="18" cy="15" r="12" fill="#EB001B"/>
                    <circle cx="30" cy="15" r="12" fill="#F79E1B"/>
                    <path d="M24 5.5c2.8 2.2 4.5 5.6 4.5 9.5s-1.7 7.3-4.5 9.5c-2.8-2.2-4.5-5.6-4.5-9.5s1.7-7.3 4.5-9.5z" fill="#FF5F00"/>
                  </svg>
                </div>

                {/* MB Way */}
                <div className='h-8 px-2 bg-white border border-gray-200 rounded flex items-center justify-center shadow-sm'>
                  <img 
                    src='/mbway.png' 
                    alt='MB Way' 
                    className='h-5 object-contain'
                  />
                </div>

                {/* Multibanco */}
                <div className='h-8 px-2 bg-white border border-gray-200 rounded flex items-center justify-center shadow-sm'>
                  <img 
                    src='/multibanco.png' 
                    alt='Multibanco' 
                    className='h-5 object-contain'
                  />
                </div>
              </div>
            </div>

            {/* Segurança */}
            <div className='flex flex-col items-center lg:items-end gap-3'>
              <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                Compra Segura
              </p>
              <div className='flex items-center gap-4'>
                {/* SSL Badge */}
                <div className='flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full'>
                  <Lock className='w-4 h-4 text-green-600' />
                  <span className='text-xs font-semibold text-green-700'>SSL Seguro</span>
                </div>

                {/* Stripe Badge */}
                <div className='flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full'>
                  <svg viewBox="0 0 60 25" className="h-4" fill="none">
                    <path d="M5 10.5c0-.83.68-1.5 1.5-1.5h5c.83 0 1.5.68 1.5 1.5v5c0 .83-.68 1.5-1.5 1.5h-5c-.83 0-1.5-.68-1.5-1.5v-5z" fill="#635BFF"/>
                    <path d="M59.64 10.12c0-3.3-1.6-5.9-4.65-5.9-3.07 0-4.92 2.6-4.92 5.88 0 3.88 2.19 5.84 5.33 5.84 1.53 0 2.69-.35 3.56-.84v-2.59c-.87.43-1.87.7-3.14.7-1.24 0-2.35-.44-2.49-1.94h6.28c0-.17.03-.83.03-1.15zm-6.35-1.22c0-1.44.88-2.04 1.69-2.04.79 0 1.62.6 1.62 2.04h-3.31zm-6.48-4.68c-1.25 0-2.06.59-2.51 1l-.17-.8h-2.82v15.14l3.2-.68.01-3.67c.46.34 1.14.81 2.27.81 2.29 0 4.38-1.84 4.38-5.91 0-3.72-2.13-5.89-4.36-5.89zm-.77 9.06c-.76 0-1.2-.27-1.51-.61l-.02-4.81c.33-.37.79-.64 1.53-.64 1.17 0 1.98 1.31 1.98 3.02 0 1.74-.8 3.04-1.98 3.04zm-9.9-9.72l3.22-.69V0l-3.22.69v2.87zm0 .9h3.22v11.19h-3.22V4.46zm-3.7.87l-.2-.87h-2.77v11.19h3.2V8.24c.76-.99 2.04-.81 2.44-.67V4.46c-.41-.15-1.92-.44-2.67 1.17v-.3zm-6.4-2.32l-3.13.67-.01 10.25c0 1.89 1.42 3.29 3.32 3.29 1.05 0 1.82-.19 2.24-.42v-2.6c-.41.17-2.43.76-2.43-1.14V7.4h2.43V4.46h-2.43l.01-1.45zm-8.8 5.51c0-.5.41-.69.69-.69.63 0 1.43.19 2.06.53V5.23c-.69-.27-1.37-.38-2.06-.38-1.69 0-2.82 0.88-2.82 2.36 0 2.3 3.16 1.93 3.16 2.92 0 .59-.51.78-.97.78-.84 0-1.91-.35-2.75-.81v2.59c.94.4 1.88.57 2.75.57 1.73 0 2.92-.85 2.92-2.36-.01-2.49-3.18-2.04-3.18-2.99z" fill="#635BFF"/>
                  </svg>
                  <span className='text-xs font-semibold text-indigo-700'>Powered by Stripe</span>
                </div>

                {/* Dados Protegidos */}
                <div className='hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full'>
                  <Shield className='w-4 h-4 text-blue-600' />
                  <span className='text-xs font-semibold text-blue-700'>Dados Protegidos</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Bar - Copyright */}
      <div className='border-t border-gray-200 bg-gray-50'>
        <div className='px-6 md:px-16 lg:px-24 xl:px-32 py-5'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
            <div className='flex flex-col md:flex-row items-center gap-2 md:gap-4'>
              <p className='text-sm text-gray-500 text-center md:text-left'>
                © {new Date().getFullYear()} Elite Surfing. Todos os direitos reservados.
              </p>
              <span className='hidden md:inline text-gray-300'>|</span>
              <p className='text-xs text-gray-400'>
                NIF: 292650094
              </p>
            </div>
            <div className='flex items-center gap-2 text-sm text-gray-500'>
              <span>Desenvolvido por</span>
              <a
                href='https://orlandopedrazzoli.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary hover:underline font-semibold inline-flex items-center gap-1'
              >
                orlandopedrazzoli.com
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