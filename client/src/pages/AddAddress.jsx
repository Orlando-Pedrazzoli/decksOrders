import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
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

// Input Field Component
const InputField = ({
  type,
  placeholder,
  name,
  handleChange,
  address,
  options,
}) => {
  if (type === 'select') {
    return (
      <select
        className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-700 focus:border-primary transition bg-white'
        onChange={handleChange}
        name={name}
        value={address[name]}
        required
        aria-label={placeholder}
      >
        <option value=''>{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-700 focus:border-primary transition'
      type={type}
      placeholder={placeholder}
      onChange={handleChange}
      name={name}
      value={address[name]}
      required
      aria-label={placeholder}
      autoComplete='on'
      inputMode={type === 'tel' ? 'numeric' : undefined}
    />
  );
};

const AddAddress = () => {
  const { axios, user, navigate } = useAppContext();

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

  const handleChange = e => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const validatePostalCode = postalCode => /^\d{4}-\d{3}$/.test(postalCode);
  const validatePhone = phone => /^(\+351\s?)?[29]\d{8}$/.test(phone);

  const onSubmitHandler = async e => {
    e.preventDefault();

    if (!validatePostalCode(address.zipcode)) {
      return toast.error('Código postal deve estar no formato 0000-000');
    }

    if (!validatePhone(address.phone)) {
      return toast.error('Número inválido. Ex: 912345678 ou +351 912345678');
    }

    try {
      const { data } = await axios.post('/api/address/add', { address });

      if (data.success) {
        toast.success(data.message);
        navigate('/cart');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!user) navigate('/cart');
  }, []);

  useEffect(() => {
    if (user?.email) {
      setAddress(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  return (
    <div className='mt-16 pb-16'>
      <p className='text-2xl md:text-3xl text-gray-500'>
        Adicionar Endereço de{' '}
        <span className='font-semibold text-primary'>Entrega</span>
      </p>

      <div className='flex flex-col-reverse md:flex-row justify-between mt-10'>
        <div className='flex-1 max-w-md'>
          <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm'>
            <div className='grid grid-cols-2 gap-4'>
              <InputField
                {...{
                  handleChange,
                  address,
                  name: 'firstName',
                  type: 'text',
                  placeholder: 'Primeiro Nome',
                }}
              />
              <InputField
                {...{
                  handleChange,
                  address,
                  name: 'lastName',
                  type: 'text',
                  placeholder: 'Último Nome',
                }}
              />
            </div>

            <InputField
              {...{
                handleChange,
                address,
                name: 'email',
                type: 'email',
                placeholder: 'Email',
              }}
            />
            <InputField
              {...{
                handleChange,
                address,
                name: 'street',
                type: 'text',
                placeholder: 'Rua e número (ex: Rua das Flores, 123)',
              }}
            />

            <div className='grid grid-cols-2 gap-4'>
              <InputField
                {...{
                  handleChange,
                  address,
                  name: 'city',
                  type: 'text',
                  placeholder: 'Cidade',
                }}
              />
              <InputField
                {...{
                  handleChange,
                  address,
                  name: 'state',
                  type: 'select',
                  placeholder: 'Selecione o Distrito',
                  options: portugalDistricts,
                }}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <InputField
                {...{
                  handleChange,
                  address,
                  name: 'zipcode',
                  type: 'text',
                  placeholder: 'Código Postal (0000-000)',
                }}
              />
              <InputField
                {...{
                  handleChange,
                  address,
                  name: 'country',
                  type: 'text',
                  placeholder: 'Portugal',
                }}
              />
            </div>

            <InputField
              {...{
                handleChange,
                address,
                name: 'phone',
                type: 'tel',
                placeholder: 'Telemóvel (912345678)',
              }}
            />

            <div className='text-xs text-gray-500 mt-2'>
              <p>• Código postal: formato 0000-000</p>
              <p>• Telemóvel: 9 dígitos (912345678) ou com +351</p>
            </div>

            <button className='w-full mt-6 bg-primary text-white py-3 hover:bg-primary-dull transition cursor-pointer uppercase rounded'>
              Guardar Endereço
            </button>
          </form>
        </div>

        <img
          className='md:mr-16 mb-16 md:mt-0'
          src={assets.add_address_iamge}
          alt='Adicionar Endereço'
        />
      </div>
    </div>
  );
};

export default AddAddress;
