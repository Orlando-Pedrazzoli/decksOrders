# 🏄‍♂️ Elite Surfing - E-commerce Platform

![Elite Surfing](https://img.shields.io/badge/Status-Live-success)
![Version](https://img.shields.io/badge/Version-2.0.0-blue)
![License](https://img.shields.io/badge/License-Private-red)
![Node](https://img.shields.io/badge/Node.js-18.x-green)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB)

## 🌊 Visão Geral

**Elite Surfing** é uma plataforma de e-commerce completa especializada em produtos de surf de alta qualidade. O projeto está atualmente em produção em [www.elitesurfing.pt](https://www.elitesurfing.pt), oferecendo uma experiência de compra moderna e intuitiva para surfistas em Portugal e Europa.

### 🎯 Características Principais

- 🛒 **Sistema de Carrinho Persistente** - Mantém produtos mesmo após logout
- 💳 **Pagamentos Seguros** - Integração com Stripe e opção de pagamento na entrega (COD)
- ⭐ **Sistema de Reviews** - Clientes podem avaliar produtos após compra verificada
- 📱 **Design Responsivo** - Otimizado para todos os dispositivos
- 🔒 **Autenticação Segura** - JWT com cookies httpOnly
- 👨‍💼 **Painel Administrativo** - Gestão completa de produtos e pedidos
- 📧 **Notificações por Email** - Confirmações de pedido automatizadas
- 🎁 **Sistema de Cupons** - Suporte para códigos promocionais
- 🚚 **Gestão de Endereços** - Múltiplos endereços de entrega
- 🔍 **Busca e Filtros** - Sistema avançado de pesquisa de produtos

## 🛠️ Stack Tecnológica

### Frontend

| Tecnologia               | Versão  | Descrição                  |
| ------------------------ | ------- | -------------------------- |
| **React**                | 19.1.0  | Framework principal        |
| **Vite**                 | 6.2.0   | Build tool e dev server    |
| **React Router**         | 7.6.0   | Roteamento SPA             |
| **Tailwind CSS**         | 4.1.6   | Estilização utility-first  |
| **Axios**                | 1.9.0   | Cliente HTTP               |
| **Swiper**               | 11.2.6  | Carousel de produtos       |
| **React Hot Toast**      | 2.5.2   | Notificações               |
| **EmailJS**              | 4.4.1   | Envio de emails do cliente |
| **Lucide React**         | 0.510.0 | Biblioteca de ícones       |
| **React Cookie Consent** | 9.0.0   | Banner de cookies GDPR     |

### Backend

| Tecnologia        | Versão | Descrição                   |
| ----------------- | ------ | --------------------------- |
| **Node.js**       | 18.x   | Runtime JavaScript          |
| **Express**       | 4.21.2 | Framework web               |
| **MongoDB**       | -      | Database NoSQL              |
| **Mongoose**      | 8.14.2 | ODM para MongoDB            |
| **JWT**           | 9.0.2  | Autenticação                |
| **Bcrypt.js**     | 3.0.2  | Hash de senhas              |
| **Stripe**        | 17.7.0 | Processamento de pagamentos |
| **Cloudinary**    | 2.6.1  | Armazenamento de imagens    |
| **Nodemailer**    | 7.0.4  | Envio de emails             |
| **Multer**        | 1.4.5  | Upload de arquivos          |
| **Cookie Parser** | 1.4.7  | Parsing de cookies          |
| **CORS**          | 2.8.5  | Cross-origin requests       |

## 📁 Estrutura do Projeto

```
elitesurfing/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── assets/           # Imagens e recursos estáticos
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── seller/       # Componentes do painel admin
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductReviews.jsx
│   │   │   └── ...
│   │   ├── context/          # Context API
│   │   │   └── AppContext.jsx
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── seller/       # Páginas do admin
│   │   │   ├── Home.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── MyOrders.jsx
│   │   │   └── ...
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/               # Arquivos públicos
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/                   # Backend Node.js
    ├── configs/              # Configurações
    │   ├── cloudinary.js
    │   ├── db.js
    │   └── multer.js
    ├── controllers/          # Lógica de negócio
    │   ├── userController.js
    │   ├── productController.js
    │   ├── orderController.js
    │   ├── reviewController.js
    │   └── ...
    ├── middlewares/          # Middleware
    │   ├── authUser.js
    │   └── authSeller.js
    ├── models/               # Modelos MongoDB
    │   ├── User.js
    │   ├── Product.js
    │   ├── Order.js
    │   ├── Review.js
    │   └── Address.js
    ├── routes/               # Rotas da API
    │   ├── userRoute.js
    │   ├── productRoute.js
    │   ├── orderRoute.js
    │   └── ...
    ├── services/             # Serviços
    │   └── emailService.js
    ├── emails/               # Templates de email
    ├── server.js             # Entry point
    └── package.json
```

## 🚀 Funcionalidades

### Para Clientes

- ✅ **Catálogo de Produtos**
  - Visualização por categorias
  - Sistema de busca avançado
  - Filtros por categoria
  - Carrossel de imagens do produto
- ✅ **Carrinho de Compras**
  - Adicionar/remover produtos
  - Atualizar quantidades
  - Persistência local e sincronização com servidor
  - Cálculo automático de totais
- ✅ **Sistema de Pedidos**
  - Checkout com múltiplas etapas
  - Pagamento via Stripe ou na entrega
  - Códigos promocionais
  - Histórico de pedidos
- ✅ **Reviews e Avaliações**
  - Escrever reviews após compra
  - Sistema de rating com estrelas
  - Reviews verificados
  - Carousel de reviews recentes
- ✅ **Gestão de Conta**
  - Registro e login
  - Múltiplos endereços de entrega
  - Histórico de pedidos
  - Perfil do usuário

### Para Administradores

- ✅ **Gestão de Produtos**
  - Adicionar novos produtos
  - Upload de múltiplas imagens
  - Controle de estoque
  - Edição de preços
- ✅ **Gestão de Pedidos**
  - Visualizar todos os pedidos
  - Status de pagamento
  - Detalhes de entrega

## ⚙️ Configuração e Instalação

### Pré-requisitos

- Node.js 18.x ou superior
- MongoDB 6.x ou superior
- Conta Stripe (para pagamentos)
- Conta Cloudinary (para imagens)
- Conta Gmail (para emails)

### Instalação Local

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/elitesurfing.git
cd elitesurfing
```

2. **Instale as dependências do Backend**

```bash
cd server
npm install
```

3. **Instale as dependências do Frontend**

```bash
cd ../client
npm install
```

4. **Configure as variáveis de ambiente**

### 🔐 Variáveis de Ambiente

#### Backend (.env)

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net

# JWT
JWT_SECRET=sua_chave_secreta_jwt

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Email (Gmail)
GMAIL_USER=seu_email@gmail.com
GMAIL_APP_PASSWORD=sua_app_password

# Admin
SELLER_EMAIL=admin@elitesurfing.pt
SELLER_PASSWORD=senha_admin_segura

# Server
PORT=4001
NODE_ENV=production
```

#### Frontend (.env)

```env
VITE_BACKEND_URL=https://api.elitesurfing.pt
VITE_CURRENCY=€

# EmailJS
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=public_key_xxxxx
```

### 🏃‍♂️ Executar Localmente

1. **Inicie o servidor backend**

```bash
cd server
npm run server
```

2. **Inicie o frontend**

```bash
cd client
npm run dev
```

3. **Acesse a aplicação**

- Frontend: http://localhost:5173
- Backend: http://localhost:4001
- Admin: http://localhost:5173/seller

## 🌐 Deploy

### Frontend (Vercel)

O frontend está configurado para deploy automático no Vercel:

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Backend (Vercel/Railway)

O backend pode ser deployado em:

- Vercel (serverless)
- Railway (container)
- Heroku
- DigitalOcean

## 📊 Modelos de Dados

### User

```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  cartItems: Object
}
```

### Product

```javascript
{
  name: String,
  description: Array,
  price: Number,
  offerPrice: Number,
  image: Array,
  category: String,
  inStock: Boolean
}
```

### Order

```javascript
{
  userId: String,
  items: Array,
  amount: Number,
  originalAmount: Number,
  discountAmount: Number,
  discountPercentage: Number,
  promoCode: String,
  address: String,
  status: String,
  paymentType: String,
  isPaid: Boolean
}
```

### Review

```javascript
{
  userId: String,
  orderId: String,
  productId: String,
  rating: Number (1-5),
  title: String,
  comment: String,
  userName: String,
  userLocation: String,
  isVerifiedPurchase: Boolean,
  isApproved: Boolean
}
```

## 🔒 Segurança

- ✅ Autenticação JWT com cookies httpOnly
- ✅ Senhas hasheadas com bcrypt
- ✅ Validação de dados no backend
- ✅ Proteção CORS configurada
- ✅ Rate limiting nas rotas críticas
- ✅ Sanitização de inputs
- ✅ HTTPS em produção
- ✅ Webhooks seguros do Stripe
- ✅ Cookies seguros com SameSite

## 📈 Performance

- ✅ Lazy loading de componentes
- ✅ Otimização de imagens via Cloudinary
- ✅ Cache de dados com React Context
- ✅ Minificação e bundling com Vite
- ✅ CDN para assets estáticos
- ✅ Índices MongoDB otimizados

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📱 Responsividade

A aplicação é totalmente responsiva:

- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

## 🚦 Status da API

Endpoints principais:

| Método | Endpoint              | Descrição                       |
| ------ | --------------------- | ------------------------------- |
| POST   | `/api/user/register`  | Registro de usuário             |
| POST   | `/api/user/login`     | Login de usuário                |
| GET    | `/api/product/list`   | Listar produtos                 |
| POST   | `/api/cart/update`    | Atualizar carrinho              |
| POST   | `/api/order/cod`      | Pedido com pagamento na entrega |
| POST   | `/api/order/stripe`   | Pedido com Stripe               |
| POST   | `/api/reviews/create` | Criar review                    |

## 👥 Contribuindo

Este é um projeto privado. Para contribuir:

1. Entre em contato com a equipe
2. Crie uma branch para sua feature
3. Faça commit seguindo conventional commits
4. Abra um Pull Request

## 📝 Licença

Projeto privado - Todos os direitos reservados © 2025 Elite Surfing

## 📧 Contato

- **Website**: [www.elitesurfing.pt](https://www.elitesurfing.pt)
- **Email**: suporte@elitesurfing.pt
- **Desenvolvedor**: Pedrazzoli.dev

## 🏆 Agradecimentos

Agradecimento especial a todos os surfistas que confiam na Elite Surfing para seus equipamentos de alta qualidade!

---

**Desenvolvido com ❤️ para a comunidade de surf portuguesa 🏄‍♂️**
