const mongoose = require('mongoose');
const config = require('../config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);

    console.log(`MongoDB Connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error.message);
    console.log('⚠️  Mode développement : Continuons sans base de données...');
    // Ne pas arrêter le serveur en cas d'erreur de DB
  }
};

module.exports = connectDB;

