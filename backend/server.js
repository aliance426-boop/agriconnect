const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');

const connectDB = require('./config/database');

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const chatbotRoutes = require('./routes/chatbot');
const userRoutes = require('./routes/users');
const favoriteRoutes = require('./routes/favorites');

const app = express();

// Connexion à la base de données
connectDB();

// Middleware CORS - Configuré pour accepter les requêtes depuis Vercel en production
const corsOptions = {
  origin: function (origin, callback) {
    // En développement, accepter toutes les origines
    if (config.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // En production, accepter le frontend Vercel et localhost
      const allowedOrigins = [
        config.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:5173'
      ];
      
      // Si pas d'origin (requêtes depuis Postman, curl, etc.), autoriser
      if (!origin) {
        return callback(null, true);
      }
      
      // Vérifier si l'origin correspond exactement
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Vérifier si l'origin est un domaine Vercel (*.vercel.app)
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      
      // Log pour déboguer
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoriteRoutes);

// Route de santé pour le déploiement
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AgriConnect API is running',
    timestamp: new Date().toISOString()
  });
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API AgriConnect fonctionne !' });
});

// Route racine - Informations sur l'API
app.get('/', (req, res) => {
  res.json({
    name: 'AgriConnect API',
    version: '1.0.0',
    status: 'running',
    message: 'Bienvenue sur l\'API AgriConnect',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      products: {
        list: 'GET /api/products',
        create: 'POST /api/products',
        myProducts: 'GET /api/products/my-products'
      },
      orders: {
        list: 'GET /api/orders/my-orders',
        create: 'POST /api/orders'
      },
      users: {
        producers: 'GET /api/users/producers',
        merchants: 'GET /api/users/merchants'
      },
      chatbot: {
        conversations: 'GET /api/chatbot/conversations',
        create: 'POST /api/chatbot/conversations'
      }
    },
    documentation: 'Consultez le README pour plus d\'informations',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Erreur CORS
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      message: 'Accès refusé par CORS',
      origin: req.headers.origin,
      allowedOrigins: config.NODE_ENV === 'production' ? [config.FRONTEND_URL, '*.vercel.app'] : 'all'
    });
  }
  
  res.status(500).json({ 
    message: 'Erreur serveur interne',
    error: config.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Route 404 - Doit être la dernière route
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    hint: 'Les routes API commencent par /api. Visitez / pour voir la liste des endpoints disponibles.'
  });
});

const PORT = config.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur AgriConnect démarré sur le port ${PORT}`);
  console.log(`📱 API disponible sur http://localhost:${PORT}/api`);
});

