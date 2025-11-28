// Script pour vérifier les données dans MongoDB Atlas
const mongoose = require('mongoose');

// Configuration MongoDB
const MONGODB_URI = 'mongodb+srv://dili:Dili@cluster0.jbqemdq.mongodb.net/agriconnect?retryWrites=true&w=majority';

// Schémas simplifiés
const userSchema = new mongoose.Schema({}, { strict: false });
const productSchema = new mongoose.Schema({}, { strict: false });
const orderSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

async function checkDatabase() {
  try {
    console.log('🔌 Connexion à MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas !\n');

    // Compter les documents
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();

    console.log('📊 STATISTIQUES DE LA BASE DE DONNÉES :');
    console.log('=====================================');
    console.log(`👥 Utilisateurs : ${userCount}`);
    console.log(`🥕 Produits : ${productCount}`);
    console.log(`📦 Commandes : ${orderCount}\n`);

    // Afficher quelques utilisateurs
    if (userCount > 0) {
      console.log('👥 UTILISATEURS :');
      console.log('================');
      const users = await User.find().limit(5).select('firstName lastName email role profileImage');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.role})`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Photo: ${user.profileImage ? '✅' : '❌'}`);
        console.log('');
      });
    }

    // Afficher quelques produits
    if (productCount > 0) {
      console.log('🥕 PRODUITS :');
      console.log('============');
      const products = await Product.find().limit(5).select('title price quantity category producerId');
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title}`);
        console.log(`   Prix: ${product.price} FCFA`);
        console.log(`   Quantité: ${product.quantity}`);
        console.log(`   Catégorie: ${product.category}`);
        console.log('');
      });
    }

    // Afficher quelques commandes
    if (orderCount > 0) {
      console.log('📦 COMMANDES :');
      console.log('==============');
      const orders = await Order.find().limit(5).select('status totalPrice createdAt');
      orders.forEach((order, index) => {
        console.log(`${index + 1}. Commande ${order._id}`);
        console.log(`   Statut: ${order.status}`);
        console.log(`   Montant: ${order.totalPrice} FCFA`);
        console.log(`   Date: ${new Date(order.createdAt).toLocaleDateString()}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB Atlas');
  }
}

checkDatabase();
