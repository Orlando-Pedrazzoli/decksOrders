import React, { useState, useEffect } from 'react';
import { X, MapPin, User, Mail, Phone, Home, Building, Hash, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

// Distritos de Portugal
const portugalDistricts = [
  { value: 'Aveiro', label: 'Aveiro' },
  { value: 'Beja', label: 'Beja' },
  { value: 'Braga', label: 'Braga' },
  { value: 'Bragança', label: 'Bragança' },
  { value: 'Castelo Branco', label: 'Castelo Branco' },
  { value: 'Coimbra', label: 'Coimbra' },
  { value: 'Évora', label: 'Évora' },
  { value: 'Faro', label: 'Faro' },
  { value: 'Guarda', label: 'Guarda' },
  { value: 'Leiria', label: 'Leiria' },
  { value: 'Lisboa', label: 'Lisboa' },
  { value: 'Portalegre', label: 'Portalegre' },
  { value: 'Porto', label: 'Porto' },
  { value: 'Santarém', label: 'Santarém' },
  { value: 'Setúbal', label: 'Setúbal' },
  { value: 'Viana do Castelo', label: 'Viana do Castelo' },
  { value: 'Vila Real', label: 'Vila Real' },
  { value: 'Viseu', label: 'Viseu' },
  { value: 'Açores', label: 'Açores' },
  { value: 'Madeira', label: 'Madeira' },
];

const AddressFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialAddress = null,
  isGuest = false,
  isLoading = false 
}) => {
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'Portugal',
    phone: '',
  });
  
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Animação de entrada
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 50);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Carregar morada inicial se existir
  useEffect(() => {
    if (initialAddress) {
      setAddress({
        firstName: initialAddress.firstName || '',
        lastName: initialAddress.lastName || '',
        email: initialAddress.email || '',
        street: initialAddress.street || '',
        city: initialAddress.city || '',
        state: initialAddress.state || '',
        zipcode: initialAddress.zipcode || '',
        country: initialAddress.country || 'Portugal',
        phone: initialAddress.phone || '',
      });
    }
  }, [initialAddress]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
    // Limpar erro ao digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!address.firstName.trim()) newErrors.firstName = 'Nome obrigatório';
    if (!address.lastName.trim()) newErrors.lastName = 'Apelido obrigatório';
    if (!address.email.trim()) {
      newErrors.email = 'Email obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!address.street.trim()) newErrors.street = 'Morada obrigatória';
    if (!address.city.trim()) newErrors.city = 'Cidade obrigatória';
    if (!address.state) newErrors.state = 'Distrito obrigatório';
    if (!address.zipcode.trim()) {
      newErrors.zipcode = 'Código postal obrigatório';
    } else if (!/^\d{4}-\d{3}$/.test(address.zipcode)) {
      newErrors.zipcode = 'Formato: 0000-000';
    }
    if (!address.phone.trim()) {
      newErrors.phone = 'Telemóvel obrigatório';
    } else if (!/^(\+351\s?)?[29]\d{8}$/.test(address.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Número inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    onSave(address);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 200);
  };

  if (!isOpen) return null;

  const inputClasses = (fieldName) => `
    w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400
    ${errors[fieldName] 
      ? 'border-red-300 bg-red-50' 
      : focusedField === fieldName
        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
    }
  `;

  const iconClasses = (fieldName) => `
    absolute left-4 top-1/2 -translate-y-1/2 transition-colors w-5 h-5
    ${errors[fieldName] ? 'text-red-400' : focusedField === fieldName ? 'text-primary' : 'text-gray-400'}
  `;

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`relative w-full max-w-lg max-h-[95vh] overflow-hidden bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className='bg-gradient-to-r from-primary to-primary/80 p-5 text-white'>
          <button
            onClick={handleClose}
            className='absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
          
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center'>
              <MapPin className='w-6 h-6' />
            </div>
            <div>
              <h2 className='text-xl font-bold'>
                {initialAddress ? 'Editar Morada' : 'Morada de Entrega'}
              </h2>
              <p className='text-white/80 text-sm'>
                {isGuest 
                  ? 'Adicione os seus dados para continuar' 
                  : 'Preencha os dados de entrega'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-5 overflow-y-auto max-h-[calc(95vh-180px)]'>
          <div className='space-y-4'>
            {/* Nome */}
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Primeiro Nome *
                </label>
                <div className='relative'>
                  <User className={iconClasses('firstName')} />
                  <input
                    type='text'
                    name='firstName'
                    value={address.firstName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField(null)}
                    placeholder='João'
                    className={inputClasses('firstName')}
                  />
                </div>
                {errors.firstName && (
                  <p className='text-xs text-red-500 mt-1'>{errors.firstName}</p>
                )}
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Apelido *
                </label>
                <div className='relative'>
                  <User className={iconClasses('lastName')} />
                  <input
                    type='text'
                    name='lastName'
                    value={address.lastName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField(null)}
                    placeholder='Silva'
                    className={inputClasses('lastName')}
                  />
                </div>
                {errors.lastName && (
                  <p className='text-xs text-red-500 mt-1'>{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Email *
              </label>
              <div className='relative'>
                <Mail className={iconClasses('email')} />
                <input
                  type='email'
                  name='email'
                  value={address.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder='joao@email.com'
                  className={inputClasses('email')}
                />
              </div>
              {errors.email && (
                <p className='text-xs text-red-500 mt-1'>{errors.email}</p>
              )}
            </div>

            {/* Morada */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Morada *
              </label>
              <div className='relative'>
                <Home className={iconClasses('street')} />
                <input
                  type='text'
                  name='street'
                  value={address.street}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('street')}
                  onBlur={() => setFocusedField(null)}
                  placeholder='Rua das Flores, 123, 2º Dto'
                  className={inputClasses('street')}
                />
              </div>
              {errors.street && (
                <p className='text-xs text-red-500 mt-1'>{errors.street}</p>
              )}
            </div>

            {/* Cidade e Distrito */}
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Cidade *
                </label>
                <div className='relative'>
                  <Building className={iconClasses('city')} />
                  <input
                    type='text'
                    name='city'
                    value={address.city}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('city')}
                    onBlur={() => setFocusedField(null)}
                    placeholder='Lisboa'
                    className={inputClasses('city')}
                  />
                </div>
                {errors.city && (
                  <p className='text-xs text-red-500 mt-1'>{errors.city}</p>
                )}
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Distrito *
                </label>
                <div className='relative'>
                  <MapPin className={iconClasses('state')} />
                  <select
                    name='state'
                    value={address.state}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('state')}
                    onBlur={() => setFocusedField(null)}
                    className={`${inputClasses('state')} cursor-pointer`}
                  >
                    <option value=''>Selecionar...</option>
                    {portugalDistricts.map((district) => (
                      <option key={district.value} value={district.value}>
                        {district.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.state && (
                  <p className='text-xs text-red-500 mt-1'>{errors.state}</p>
                )}
              </div>
            </div>

            {/* Código Postal e País */}
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Código Postal *
                </label>
                <div className='relative'>
                  <Hash className={iconClasses('zipcode')} />
                  <input
                    type='text'
                    name='zipcode'
                    value={address.zipcode}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('zipcode')}
                    onBlur={() => setFocusedField(null)}
                    placeholder='1000-001'
                    maxLength={8}
                    className={inputClasses('zipcode')}
                  />
                </div>
                {errors.zipcode && (
                  <p className='text-xs text-red-500 mt-1'>{errors.zipcode}</p>
                )}
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  País
                </label>
                <div className='relative'>
                  <MapPin className={iconClasses('country')} />
                  <input
                    type='text'
                    name='country'
                    value={address.country}
                    onChange={handleChange}
                    disabled
                    className='w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                  />
                </div>
              </div>
            </div>

            {/* Telemóvel */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Telemóvel *
              </label>
              <div className='relative'>
                <Phone className={iconClasses('phone')} />
                <input
                  type='tel'
                  name='phone'
                  value={address.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  placeholder='912 345 678'
                  className={inputClasses('phone')}
                />
              </div>
              {errors.phone && (
                <p className='text-xs text-red-500 mt-1'>{errors.phone}</p>
              )}
              <p className='text-xs text-gray-500 mt-1'>
                Para contacto sobre a entrega
              </p>
            </div>
          </div>

          {/* Guest info */}
          {isGuest && (
            <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl'>
              <p className='text-sm text-blue-700 flex items-start gap-2'>
                <span className='text-lg'>💡</span>
                <span>
                  Pode continuar sem conta. Será pedido login apenas no momento do pagamento para segurança.
                </span>
              </p>
            </div>
          )}

          {/* Botões */}
          <div className='mt-6 flex gap-3'>
            <button
              type='button'
              onClick={handleClose}
              className='flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='flex-1 py-3 px-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  <span>A guardar...</span>
                </>
              ) : (
                <>
                  <Check className='w-5 h-5' />
                  <span>{initialAddress ? 'Atualizar' : 'Confirmar'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressFormModal;