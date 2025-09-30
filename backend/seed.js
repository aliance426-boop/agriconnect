const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agriconnect');
    console.log('MongoDB connecté pour le seeding');
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Nettoyer les données existantes
    await User.deleteMany({});
    await Product.deleteMany({});

    // Créer des utilisateurs de démonstration
    const producer1 = new User({
      firstName: 'Amadou',
      lastName: 'Traoré',
      email: 'producteur@demo.com',
      password: 'demo123',
      phone: '+226 70 12 34 56',
      location: 'Ouagadougou, Centre',
      role: 'PRODUCER'
    });

    const producer2 = new User({
      firstName: 'Fatou',
      lastName: 'Ouédraogo',
      email: 'fatou@demo.com',
      password: 'demo123',
      phone: '+226 76 23 45 67',
      location: 'Bobo-Dioulasso, Hauts-Bassins',
      role: 'PRODUCER'
    });

    const merchant1 = new User({
      firstName: 'Ibrahim',
      lastName: 'Sawadogo',
      email: 'commercant@demo.com',
      password: 'demo123',
      phone: '+226 70 98 76 54',
      location: 'Ouagadougou, Centre',
      role: 'MERCHANT',
      companyName: 'AgriCommerce BF'
    });

    const merchant2 = new User({
      firstName: 'Aïcha',
      lastName: 'Kaboré',
      email: 'aicha@demo.com',
      password: 'demo123',
      phone: '+226 76 54 32 10',
      location: 'Koudougou, Centre-Ouest',
      role: 'MERCHANT',
      companyName: 'Marché Vert Koudougou'
    });

    // Sauvegarder les utilisateurs
    await producer1.save();
    await producer2.save();
    await merchant1.save();
    await merchant2.save();

    console.log('Utilisateurs créés avec succès');

    // Créer des produits de démonstration
    const products = [
      {
        title: 'Riz local de qualité',
        price: 800,
        quantity: 100,
        category: 'Céréales',
        description: 'Riz cultivé localement, sans pesticides, excellent goût',
        producerId: producer1._id
      },
      {
        title: 'Tomates fraîches',
        price: 500,
        quantity: 50,
        category: 'Légumes',
        description: 'Tomates rouges et juteuses, récoltées le matin',
        producerId: producer1._id
      },
      {
        title: 'Mangues sucrées',
        price: 300,
        quantity: 80,
        category: 'Fruits',
        description: 'Mangues mûres et parfumées, variété locale',
        producerId: producer2._id
      },
      {
        title: 'Pommes de terre',
        price: 400,
        quantity: 60,
        category: 'Tubercules',
        description: 'Pommes de terre fermes, idéales pour la cuisine',
        producerId: producer2._id
      },
      {
        title: 'Haricots verts',
        price: 600,
        quantity: 30,
        category: 'Légumineuses',
        description: 'Haricots verts frais, cueillis à la main',
        producerId: producer1._id
      },
      {
        title: 'Piment rouge',
        price: 200,
        quantity: 25,
        category: 'Épices',
        description: 'Piment rouge séché, très piquant',
        producerId: producer2._id
      }
    ];

    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
    }

    console.log('Produits créés avec succès');
    console.log('\n=== DONNÉES DE DÉMONSTRATION CRÉÉES ===');
    console.log('Producteurs:');
    console.log('- producteur@demo.com / demo123');
    console.log('- fatou@demo.com / demo123');
    console.log('\nCommerçants:');
    console.log('- commercant@demo.com / demo123');
    console.log('- aicha@demo.com / demo123');
    console.log('\nVous pouvez maintenant tester l\'application !');

  } catch (error) {
    console.error('Erreur lors du seeding:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Exécuter le seeding
connectDB().then(() => {
  seedData();
});


