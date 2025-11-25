import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Banknote,
  ChevronDown,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  User,
  ShoppingBag,
  Loader2,
  Eye,
  X,
  Printer,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ShippingLabel from '../../components/seller/ShippingLabel';

const Orders = () => {
  const { currency, axios } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [labelOrder, setLabelOrder] = useState(null);

  // Status options
  const statusOptions = [
    { value: 'Order Placed', label: 'Pedido Recebido', color: 'blue', icon: Package },
    { value: 'Processing', label: 'Em Processamento', color: 'yellow', icon: Clock },
    { value: 'Shipped', label: 'Enviado', color: 'indigo', icon: Truck },
    { value: 'Out for Delivery', label: 'Saiu para Entrega', color: 'purple', icon: Truck },
    { value: 'Delivered', label: 'Entregue', color: 'green', icon: CheckCircle },
    { value: 'Cancelled', label: 'Cancelado', color: 'red', icon: XCircle },
  ];

  const getStatusConfig = status => {
    return (
      statusOptions.find(s => s.value === status) || {
        value: status,
        label: status,
        color: 'gray',
        icon: Package,
      }
    );
  };

  const getStatusBadgeClasses = color => {
    const classes = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return classes[color] || classes.gray;
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/api/order/seller');
      if (data.success) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao carregar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const { data } = await axios.post('/api/order/status', {
        orderId,
        status: newStatus,
      });

      if (data.success) {
        toast.success(data.message, { icon: '✅' });
        // Atualizar lista local
        setOrders(prev =>
          prev.map(order =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        setFilteredOrders(prev =>
          prev.map(order =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao atualizar status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filtrar pedidos
  useEffect(() => {
    let result = orders;

    // Filtro por status
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Filtro por pesquisa
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        order =>
          order._id.toLowerCase().includes(query) ||
          order.address?.firstName?.toLowerCase().includes(query) ||
          order.address?.lastName?.toLowerCase().includes(query) ||
          order.address?.email?.toLowerCase().includes(query) ||
          order.items.some(item =>
            item.product?.name?.toLowerCase().includes(query)
          )
      );
    }

    setFilteredOrders(result);
  }, [orders, statusFilter, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Estatísticas
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Order Placed').length,
    processing: orders.filter(o => o.status === 'Processing').length,
    shipped: orders.filter(o => ['Shipped', 'Out for Delivery'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
  };

  if (isLoading) {
    return (
      <div className='flex-1 h-[95vh] flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 animate-spin text-primary mx-auto mb-4' />
          <p className='text-gray-600'>A carregar pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 h-[95vh] overflow-y-auto bg-gray-50'>
      <div className='p-4 md:p-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
                Gestão de Pedidos
              </h1>
              <p className='text-gray-500 mt-1'>
                Gerencie e acompanhe todos os pedidos da loja
              </p>
            </div>
            <button
              onClick={fetchOrders}
              className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm'
            >
              <RefreshCw className='w-4 h-4' />
              Atualizar
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
          <div className='bg-white rounded-xl p-4 border border-gray-200 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center'>
                <ShoppingBag className='w-5 h-5 text-gray-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-gray-900'>{stats.total}</p>
                <p className='text-xs text-gray-500'>Total</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-4 border border-blue-200 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Package className='w-5 h-5 text-blue-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-blue-600'>{stats.pending}</p>
                <p className='text-xs text-gray-500'>Novos</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-4 border border-yellow-200 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center'>
                <Clock className='w-5 h-5 text-yellow-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-yellow-600'>{stats.processing}</p>
                <p className='text-xs text-gray-500'>Processando</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-4 border border-indigo-200 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center'>
                <Truck className='w-5 h-5 text-indigo-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-indigo-600'>{stats.shipped}</p>
                <p className='text-xs text-gray-500'>Enviados</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-4 border border-green-200 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                <CheckCircle className='w-5 h-5 text-green-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-green-600'>{stats.delivered}</p>
                <p className='text-xs text-gray-500'>Entregues</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-4 border border-red-200 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center'>
                <XCircle className='w-5 h-5 text-red-600' />
              </div>
              <div>
                <p className='text-2xl font-bold text-red-600'>{stats.cancelled}</p>
                <p className='text-xs text-gray-500'>Cancelados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
              <input
                type='text'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Pesquisar por ID, cliente ou produto...'
                className='w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all'
              />
            </div>

            {/* Status Filter */}
            <div className='relative'>
              <Filter className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className='pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-white cursor-pointer min-w-[200px]'
              >
                <option value='all'>Todos os Status</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center'>
            <Package className='w-16 h-16 text-gray-300 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Nenhum pedido encontrado
            </h3>
            <p className='text-gray-500'>
              {searchQuery || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Os pedidos aparecerão aqui quando forem criados'}
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {filteredOrders.map(order => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              const isUpdating = updatingOrderId === order._id;

              return (
                <div
                  key={order._id}
                  className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow'
                >
                  {/* Order Header */}
                  <div className='p-4 md:p-5 border-b border-gray-100 bg-gray-50/50'>
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-3'>
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusBadgeClasses(
                            statusConfig.color
                          )}`}
                        >
                          <StatusIcon className='w-5 h-5' />
                        </div>
                        <div>
                          <p className='font-semibold text-gray-900'>
                            Pedido #{order._id.slice(-8).toUpperCase()}
                          </p>
                          <div className='flex items-center gap-2 text-sm text-gray-500'>
                            <Calendar className='w-3.5 h-3.5' />
                            {new Date(order.createdAt).toLocaleDateString('pt-PT', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        {/* Payment Badge */}
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                            order.paymentType === 'COD'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {order.paymentType === 'COD' ? (
                            <Banknote className='w-3.5 h-3.5' />
                          ) : (
                            <CreditCard className='w-3.5 h-3.5' />
                          )}
                          {order.paymentType === 'COD' ? 'COD' : 'Online'}
                          {order.isPaid && (
                            <CheckCircle className='w-3.5 h-3.5 ml-1' />
                          )}
                        </div>

                        {/* Status Dropdown */}
                        <div className='relative'>
                          <select
                            value={order.status}
                            onChange={e => updateStatus(order._id, e.target.value)}
                            disabled={isUpdating}
                            className={`pl-3 pr-8 py-2 border rounded-lg text-sm font-medium cursor-pointer transition-all appearance-none ${getStatusBadgeClasses(
                              statusConfig.color
                            )} ${
                              isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {statusOptions.map(status => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                          {isUpdating ? (
                            <Loader2 className='absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin' />
                          ) : (
                            <ChevronDown className='absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none' />
                          )}
                        </div>

                        {/* View Details Button */}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className='p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors'
                          title='Ver detalhes'
                        >
                          <Eye className='w-5 h-5' />
                        </button>

                        {/* Print Label Button */}
                        <button
                          onClick={() => setLabelOrder(order)}
                          className='p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                          title='Imprimir etiqueta de envio'
                        >
                          <Printer className='w-5 h-5' />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className='p-4 md:p-5'>
                    <div className='flex flex-col lg:flex-row gap-6'>
                      {/* Products */}
                      <div className='flex-1'>
                        <h4 className='text-sm font-medium text-gray-500 mb-3'>
                          Produtos ({order.items.length})
                        </h4>
                        <div className='space-y-3'>
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'
                            >
                              {/* Product Image */}
                              <div className='w-16 h-16 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0'>
                                {item.product?.image?.[0] ? (
                                  <img
                                    src={item.product.image[0]}
                                    alt={item.product.name}
                                    className='w-full h-full object-contain'
                                  />
                                ) : (
                                  <div className='w-full h-full flex items-center justify-center'>
                                    <Package className='w-6 h-6 text-gray-300' />
                                  </div>
                                )}
                              </div>

                              {/* Product Info */}
                              <div className='flex-1 min-w-0'>
                                <p className='font-medium text-gray-900 truncate'>
                                  {item.product?.name || 'Produto não encontrado'}
                                </p>
                                <p className='text-sm text-gray-500'>
                                  {item.product?.category || 'Sem categoria'}
                                </p>
                                <div className='flex items-center gap-3 mt-1'>
                                  <span className='text-sm text-gray-600'>
                                    Qtd:{' '}
                                    <span className='font-semibold text-primary'>
                                      {item.quantity}
                                    </span>
                                  </span>
                                  <span className='text-sm text-gray-600'>
                                    Preço:{' '}
                                    <span className='font-semibold'>
                                      {currency}
                                      {item.product?.offerPrice?.toFixed(2) || '0.00'}
                                    </span>
                                  </span>
                                </div>
                              </div>

                              {/* Item Total */}
                              <div className='text-right'>
                                <p className='font-bold text-gray-900'>
                                  {currency}
                                  {(
                                    (item.product?.offerPrice || 0) * item.quantity
                                  ).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer & Address */}
                      <div className='lg:w-72'>
                        <h4 className='text-sm font-medium text-gray-500 mb-3'>
                          Cliente & Entrega
                        </h4>
                        <div className='bg-gray-50 rounded-lg p-4 space-y-3'>
                          <div className='flex items-center gap-2'>
                            <User className='w-4 h-4 text-gray-400' />
                            <span className='font-medium text-gray-900'>
                              {order.address?.firstName} {order.address?.lastName}
                            </span>
                          </div>

                          {order.address?.email && (
                            <div className='flex items-center gap-2 text-sm text-gray-600'>
                              <Mail className='w-4 h-4 text-gray-400' />
                              <span className='truncate'>{order.address.email}</span>
                            </div>
                          )}

                          {order.address?.phone && (
                            <div className='flex items-center gap-2 text-sm text-gray-600'>
                              <Phone className='w-4 h-4 text-gray-400' />
                              <span>{order.address.phone}</span>
                            </div>
                          )}

                          <div className='flex items-start gap-2 text-sm text-gray-600 pt-2 border-t border-gray-200'>
                            <MapPin className='w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0' />
                            <div>
                              <p>{order.address?.street}</p>
                              <p>
                                {order.address?.zipcode} {order.address?.city}
                              </p>
                              <p>
                                {order.address?.state}, {order.address?.country}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className='p-4 md:p-5 border-t border-gray-100 bg-gray-50/50'>
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-3'>
                      <div className='flex flex-wrap gap-4 text-sm'>
                        {order.promoCode && (
                          <span className='text-green-600 font-medium'>
                            🎫 Código: {order.promoCode} (-{order.discountPercentage}%)
                          </span>
                        )}
                        {order.discountAmount > 0 && (
                          <span className='text-green-600'>
                            Desconto: -{currency}{order.discountAmount.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className='flex items-center gap-4'>
                        {order.originalAmount && order.originalAmount !== order.amount && (
                          <span className='text-sm text-gray-400 line-through'>
                            {currency}{order.originalAmount.toFixed(2)}
                          </span>
                        )}
                        <span className='text-xl font-bold text-gray-900'>
                          Total: {currency}{order.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className='sticky top-0 bg-white border-b border-gray-200 p-5 flex items-center justify-between'>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>
                  Detalhes do Pedido
                </h2>
                <p className='text-sm text-gray-500'>
                  #{selectedOrder._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Modal Content */}
            <div className='p-5 space-y-6'>
              {/* Status & Payment */}
              <div className='flex flex-wrap gap-3'>
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusBadgeClasses(
                    getStatusConfig(selectedOrder.status).color
                  )}`}
                >
                  {getStatusConfig(selectedOrder.status).label}
                </span>
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    selectedOrder.isPaid
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {selectedOrder.isPaid ? '✅ Pago' : '⏳ Pendente'}
                </span>
                <span className='px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800'>
                  {selectedOrder.paymentType === 'COD'
                    ? '💵 Pagamento na Entrega'
                    : '💳 Pagamento Online'}
                </span>
              </div>

              {/* Products */}
              <div>
                <h3 className='font-semibold text-gray-900 mb-3'>Produtos</h3>
                <div className='space-y-2'>
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg'
                    >
                      <div className='w-14 h-14 bg-white rounded-lg border overflow-hidden'>
                        {item.product?.image?.[0] ? (
                          <img
                            src={item.product.image[0]}
                            alt={item.product.name}
                            className='w-full h-full object-contain'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center'>
                            <Package className='w-5 h-5 text-gray-300' />
                          </div>
                        )}
                      </div>
                      <div className='flex-1'>
                        <p className='font-medium'>{item.product?.name}</p>
                        <p className='text-sm text-gray-500'>
                          {item.quantity}x {currency}
                          {item.product?.offerPrice?.toFixed(2)}
                        </p>
                      </div>
                      <p className='font-semibold'>
                        {currency}
                        {((item.product?.offerPrice || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className='font-semibold text-gray-900 mb-3'>Endereço de Entrega</h3>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <p className='font-medium'>
                    {selectedOrder.address?.firstName} {selectedOrder.address?.lastName}
                  </p>
                  <p className='text-gray-600 mt-1'>{selectedOrder.address?.street}</p>
                  <p className='text-gray-600'>
                    {selectedOrder.address?.zipcode} {selectedOrder.address?.city}
                  </p>
                  <p className='text-gray-600'>
                    {selectedOrder.address?.state}, {selectedOrder.address?.country}
                  </p>
                  {selectedOrder.address?.phone && (
                    <p className='text-gray-600 mt-2'>📞 {selectedOrder.address.phone}</p>
                  )}
                  {selectedOrder.address?.email && (
                    <p className='text-gray-600'>✉️ {selectedOrder.address.email}</p>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className='bg-gray-50 rounded-lg p-4'>
                {selectedOrder.originalAmount !== selectedOrder.amount && (
                  <>
                    <div className='flex justify-between text-gray-600'>
                      <span>Subtotal</span>
                      <span>{currency}{selectedOrder.originalAmount?.toFixed(2)}</span>
                    </div>
                    {selectedOrder.promoCode && (
                      <div className='flex justify-between text-green-600'>
                        <span>Desconto ({selectedOrder.promoCode})</span>
                        <span>-{currency}{selectedOrder.discountAmount?.toFixed(2)}</span>
                      </div>
                    )}
                    <hr className='my-2' />
                  </>
                )}
                <div className='flex justify-between text-lg font-bold'>
                  <span>Total</span>
                  <span>{currency}{selectedOrder.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Label Modal */}
      {labelOrder && (
        <ShippingLabel
          order={labelOrder}
          onClose={() => setLabelOrder(null)}
        />
      )}
    </div>
  );
};

export default Orders;