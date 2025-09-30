const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    console.log('Tentative de connexion à MongoDB...');
    console.log('URL:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté avec succès !');
    
    // Test simple
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections existantes:', collections.map(c => c.name));
    
    mongoose.connection.close();
    console.log('Connexion fermée.');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

connectDB();


