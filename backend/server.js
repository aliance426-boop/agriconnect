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
      // En production, accepter uniquement le frontend Vercel
      const allowedOrigins = [
        config.FRONTEND_URL,
        'https://*.vercel.app',
        'http://localhost:3000'
      ];
      
      // Si pas d'origin (requêtes depuis Postman, curl, etc.), autoriser
      if (!origin) return callback(null, true);
      
      // Vérifier si l'origin est autorisé
      const isAllowed = allowedOrigins.some(allowed => {
        if (allowed.includes('*')) {
          return origin.includes(allowed.replace('*.', ''));
        }
        return origin === allowed;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
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

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur interne' });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

const PORT = config.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur AgriConnect démarré sur le port ${PORT}`);
  console.log(`📱 API disponible sur http://localhost:${PORT}/api`);
});

