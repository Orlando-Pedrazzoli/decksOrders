import React, { useRef } from 'react';
import { X, Printer, Package, MapPin, Phone, Mail } from 'lucide-react';

const ShippingLabel = ({ order, onClose }) => {
  const labelRef = useRef(null);

  // Dados do remetente (fixos)
  const sender = {
    name: 'Elite Surfing',
    address: 'Avenida Doutor Francisco de Sá Carneiro 3',
    apartment: 'Apartamento 3D',
    zipcode: '2780-241',
    city: 'Oeiras',
    country: 'Portugal',
    phone: '+351 912 164 220',
    email: 'pedrazzoliorlando@gmail.com',
  };

  // Dados do destinatário (do pedido)
  const recipient = {
    name: `${order.address?.firstName || ''} ${order.address?.lastName || ''}`.trim(),
    address: order.address?.street || '',
    zipcode: order.address?.zipcode || '',
    city: order.address?.city || '',
    state: order.address?.state || '',
    country: order.address?.country || '',
    phone: order.address?.phone || '',
    email: order.address?.email || '',
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Modal Overlay */}
      <div
        className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden'
        onClick={onClose}
      >
        <div
          className='bg-white rounded-2xl shadow-2xl max-w-3xl w-full'
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className='flex items-center justify-between p-5 border-b border-gray-200'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center'>
                <Package className='w-5 h-5 text-primary' />
              </div>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>
                  Etiqueta de Envio CTT
                </h2>
                <p className='text-sm text-gray-500'>
                  Pedido #{order._id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <button
                onClick={handlePrint}
                className='flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dull text-white rounded-lg font-medium transition-colors'
              >
                <Printer className='w-4 h-4' />
                Imprimir
              </button>
              <button
                onClick={onClose}
                className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className='p-6 bg-gray-50 flex justify-center overflow-auto max-h-[70vh]'>
            <div className='bg-white p-2 rounded-lg shadow-lg'>
              <div ref={labelRef}>
                {/* A etiqueta em si será renderizada aqui e também na impressão */}
                <LabelContent sender={sender} recipient={recipient} order={order} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only version */}
      <div className='hidden print:block'>
        <LabelContent sender={sender} recipient={recipient} order={order} />
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
          @page {
            size: A6 landscape;
            margin: 0;
          }
        }
      `}</style>
    </>
  );
};

// Componente da etiqueta em si
const LabelContent = ({ sender, recipient, order }) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString('pt-PT');
  const orderId = order._id.slice(-8).toUpperCase();

  return (
    <div
      className='relative bg-white'
      style={{
        width: '148mm',
        height: '105mm',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Container principal com padding */}
      <div className='w-full h-full p-4 flex flex-col'>
        
        {/* Header com logo CTT simulado */}
        <div className='flex items-center justify-between mb-3 pb-3 border-b-2 border-gray-300'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center'>
              <Package className='w-7 h-7 text-white' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>CTT</h1>
              <p className='text-xs text-gray-500'>Correio Expresso</p>
            </div>
          </div>
          <div className='text-right'>
            <p className='text-xs text-gray-500'>Data de envio</p>
            <p className='text-sm font-semibold'>{orderDate}</p>
          </div>
        </div>

        {/* Main content - 2 colunas */}
        <div className='flex-1 grid grid-cols-2 gap-4'>
          
          {/* Coluna Esquerda - REMETENTE */}
          <div className='flex flex-col'>
            <div className='bg-gray-50 rounded-lg p-3 border-2 border-gray-200 flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='w-6 h-6 bg-blue-100 rounded flex items-center justify-center'>
                  <MapPin className='w-4 h-4 text-blue-600' />
                </div>
                <h3 className='text-xs font-bold text-gray-700 uppercase'>
                  Remetente
                </h3>
              </div>

              <div className='space-y-1'>
                <p className='text-sm font-bold text-gray-900'>{sender.name}</p>
                <p className='text-xs text-gray-700'>{sender.address}</p>
                <p className='text-xs text-gray-700'>{sender.apartment}</p>
                <p className='text-xs text-gray-700'>
                  {sender.zipcode} {sender.city}
                </p>
                <p className='text-xs text-gray-700 font-medium'>{sender.country}</p>
                
                <div className='pt-2 mt-2 border-t border-gray-200'>
                  <p className='text-xs text-gray-600 flex items-center gap-1'>
                    <Phone className='w-3 h-3' />
                    {sender.phone}
                  </p>
                  <p className='text-xs text-gray-600 flex items-center gap-1'>
                    <Mail className='w-3 h-3' />
                    {sender.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Informações do pedido */}
            <div className='mt-3 p-2 bg-yellow-50 rounded border border-yellow-200'>
              <p className='text-xs text-gray-600'>
                <span className='font-semibold'>Pedido:</span> #{orderId}
              </p>
              <p className='text-xs text-gray-600'>
                <span className='font-semibold'>Itens:</span> {order.items.length} produto(s)
              </p>
              {order.paymentType === 'COD' && (
                <p className='text-xs text-red-600 font-bold mt-1'>
                  ⚠️ COBRANÇA À ENTREGA: €{order.amount.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Coluna Direita - DESTINATÁRIO (DESTAQUE) */}
          <div className='flex flex-col'>
            <div className='bg-white rounded-lg p-4 border-4 border-red-600 flex-1 relative'>
              {/* Badge "PARA" no canto */}
              <div className='absolute -top-3 left-3 bg-red-600 text-white px-3 py-1 rounded text-xs font-bold'>
                DESTINATÁRIO
              </div>

              <div className='mt-2 space-y-2'>
                <p className='text-lg font-bold text-gray-900 leading-tight'>
                  {recipient.name || 'Nome não informado'}
                </p>
                
                <div className='space-y-1'>
                  <p className='text-sm text-gray-800 leading-tight'>
                    {recipient.address || 'Endereço não informado'}
                  </p>
                  
                  <p className='text-base font-bold text-gray-900'>
                    {recipient.zipcode} {recipient.city}
                  </p>
                  
                  {recipient.state && (
                    <p className='text-sm text-gray-700'>{recipient.state}</p>
                  )}
                  
                  <p className='text-sm font-semibold text-gray-900 uppercase'>
                    {recipient.country || 'País não informado'}
                  </p>
                </div>

                <div className='pt-3 mt-3 border-t-2 border-gray-200 space-y-1'>
                  {recipient.phone && (
                    <p className='text-sm text-gray-700 flex items-center gap-2'>
                      <Phone className='w-4 h-4 text-red-600' />
                      <span className='font-medium'>{recipient.phone}</span>
                    </p>
                  )}
                  {recipient.email && (
                    <p className='text-xs text-gray-600 flex items-center gap-2'>
                      <Mail className='w-3 h-3' />
                      {recipient.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Código de barras simulado */}
            <div className='mt-3 p-2 bg-white rounded border-2 border-gray-300 flex flex-col items-center'>
              <div className='flex gap-0.5 mb-1'>
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className='w-1 bg-black'
                    style={{
                      height: `${Math.random() * 20 + 15}px`,
                    }}
                  />
                ))}
              </div>
              <p className='text-xs font-mono font-semibold tracking-wider'>
                PT{orderId}{Date.now().toString().slice(-6)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer com instruções */}
        <div className='mt-3 pt-3 border-t-2 border-gray-300 flex justify-between items-end text-xs text-gray-500'>
          <div>
            <p className='font-semibold'>Instruções de manuseamento:</p>
            <p>• Manter em local seco e arejado</p>
            <p>• Não empilhar mais de 3 volumes</p>
          </div>
          <div className='text-right'>
            <p className='font-semibold'>CTT - Correios de Portugal</p>
            <p>www.ctt.pt | 707 26 26 26</p>
          </div>
        </div>
      </div>

      {/* Linhas de corte (apenas no preview) */}
      <div className='print:hidden absolute inset-0 pointer-events-none'>
        <div className='absolute top-0 left-0 right-0 h-px bg-gray-300 border-t-2 border-dashed border-gray-400'></div>
        <div className='absolute bottom-0 left-0 right-0 h-px bg-gray-300 border-b-2 border-dashed border-gray-400'></div>
        <div className='absolute top-0 bottom-0 left-0 w-px bg-gray-300 border-l-2 border-dashed border-gray-400'></div>
        <div className='absolute top-0 bottom-0 right-0 w-px bg-gray-300 border-r-2 border-dashed border-gray-400'></div>
      </div>
    </div>
  );
};

export default ShippingLabel;