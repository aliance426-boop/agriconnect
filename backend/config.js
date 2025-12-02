// Charger les variables d'environnement
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Valeurs par défaut pour le développement local uniquement
const getMongoURI = () => {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  if (isProduction) throw new Error('MONGODB_URI must be set in production environment');
  return 'mongodb+srv://dili:Al55450@cluster0.jbqemdq.mongodb.net/agriconnect?retryWrites=true&w=majority';
};

const getJWTSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (isProduction) throw new Error('JWT_SECRET must be set in production environment');
  return 'agriconnect_super_secret_key_2024_very_long_and_secure';
};

module.exports = {
  // En production, toutes ces valeurs DOIVENT être définies via les variables d'environnement
  // En développement local, les valeurs par défaut sont utilisées si .env n'existe pas
  MONGODB_URI: getMongoURI(),
  JWT_SECRET: getJWTSecret(),
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  GROQ_API_KEY: process.env.GROQ_API_KEY || null // Clé API Groq pour l'IA
};
