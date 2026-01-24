import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

const ShareProduct = ({ product, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen]);

  if (!product) return null;

  // Construir URL com UTM parameters
  const baseUrl = window.location.origin;
  const productUrl = `${baseUrl}/products/${product.category?.toLowerCase()}/${product._id}`;
  
  const getShareUrl = (source) => {
    const url = new URL(productUrl);
    url.searchParams.set('utm_source', source);
    url.searchParams.set('utm_medium', 'social');
    url.searchParams.set('utm_campaign', 'product_share');
    return url.toString();
  };

  // Texto para compartilhamento
  const shareTitle = product.name;
  const sharePrice = product.offerPrice?.toLocaleString('pt-PT', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  const shareText = `Vê este produto: ${product.name} por apenas ${sharePrice}€ na Elite Surfing! 🏄‍♂️`;
  const shareImage = product.image?.[0] || '';

  // Web Share API (mobile nativo)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: getShareUrl('native'),
        });
        toast.success('Partilhado com sucesso!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          // User cancelled - não mostrar erro
          setIsOpen(true); // Fallback para dropdown
        }
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  // WhatsApp
  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${getShareUrl('whatsapp')}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    toast.success('A abrir WhatsApp...');
  };

  // Facebook
  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl('facebook'))}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    setIsOpen(false);
  };

  // Twitter/X
  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getShareUrl('twitter'))}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    setIsOpen(false);
  };

  // Pinterest (ótimo para e-commerce visual)
  const sharePinterest = () => {
    const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(getShareUrl('pinterest'))}&media=${encodeURIComponent(shareImage)}&description=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=750,height=550');
    setIsOpen(false);
  };

  // Email
  const shareEmail = () => {
    const subject = encodeURIComponent(`Vê este produto na Elite Surfing: ${product.name}`);
    const body = encodeURIComponent(`Olá!\n\nEncontrei este produto que pode interessar-te:\n\n${product.name}\nPreço: ${sharePrice}€\n\nVê aqui: ${getShareUrl('email')}\n\n🏄‍♂️ Elite Surfing Portugal`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsOpen(false);
  };

  // Copiar Link
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl('copy'));
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback para browsers antigos
      const textArea = document.createElement('textarea');
      textArea.value = getShareUrl('copy');
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Ícones SVG inline para não depender de bibliotecas externas
  const icons = {
    share: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    whatsapp: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    pinterest: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
      </svg>
    ),
    email: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    copy: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    check: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  };

  const shareOptions = [
    { 
      name: 'WhatsApp', 
      icon: icons.whatsapp, 
      action: shareWhatsApp, 
      color: 'hover:bg-green-50 hover:text-green-600',
      iconColor: 'text-green-500'
    },
    { 
      name: 'Facebook', 
      icon: icons.facebook, 
      action: shareFacebook, 
      color: 'hover:bg-blue-50 hover:text-blue-600',
      iconColor: 'text-blue-600'
    },
    { 
      name: 'X (Twitter)', 
      icon: icons.twitter, 
      action: shareTwitter, 
      color: 'hover:bg-gray-100 hover:text-gray-900',
      iconColor: 'text-gray-900'
    },
    { 
      name: 'Pinterest', 
      icon: icons.pinterest, 
      action: sharePinterest, 
      color: 'hover:bg-red-50 hover:text-red-600',
      iconColor: 'text-red-600'
    },
    { 
      name: 'Email', 
      icon: icons.email, 
      action: shareEmail, 
      color: 'hover:bg-gray-100 hover:text-gray-700',
      iconColor: 'text-gray-600'
    },
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botão Principal de Share */}
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 active:scale-95 shadow-sm"
        aria-label="Partilhar produto"
        aria-expanded={isOpen}
      >
        {icons.share}
        <span className="hidden sm:inline">Partilhar</span>
      </button>

      {/* Dropdown de Opções */}
      {isOpen && (
        <>
          {/* Overlay para mobile */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 sm:left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Partilhar produto</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{product.name}</p>
            </div>

            {/* Opções de Share */}
            <div className="py-2">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors duration-150 ${option.color}`}
                >
                  <span className={option.iconColor}>{option.icon}</span>
                  <span>{option.name}</span>
                </button>
              ))}
            </div>

            {/* Separador */}
            <div className="border-t border-gray-100" />

            {/* Copiar Link */}
            <div className="p-3">
              <button
                onClick={copyLink}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  copied 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                }`}
              >
                {copied ? icons.check : icons.copy}
                <span>{copied ? 'Link copiado!' : 'Copiar link'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareProduct;