// Script pour supprimer un utilisateur de la base de données
const mongoose = require('mongoose');

// Configuration MongoDB
const MONGODB_URI = 'mongodb+srv://dili:Dili@cluster0.jbqemdq.mongodb.net/agriconnect?retryWrites=true&w=majority';

// Schémas
const userSchema = new mongoose.Schema({}, { strict: false });
const productSchema = new mongoose.Schema({}, { strict: false });
const orderSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

async function deleteUser() {
  try {
    console.log('🔌 Connexion à MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas !\n');

    // Récupérer l'ID de l'utilisateur à supprimer depuis les arguments
    const userId = process.argv[2];
    
    if (!userId) {
      console.log('❌ Erreur: Veuillez fournir l\'ID de l\'utilisateur à supprimer');
      console.log('📝 Usage: node delete-user.js <USER_ID>');
      console.log('\n📋 Exemple:');
      console.log('node delete-user.js 68dc000f34c4e4c529339d3a');
      process.exit(1);
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      console.log(`❌ Utilisateur avec l'ID ${userId} non trouvé`);
      process.exit(1);
    }

    console.log('👤 UTILISATEUR À SUPPRIMER :');
    console.log('============================');
    console.log(`🆔 ID: ${user._id}`);
    console.log(`👤 Nom: ${user.firstName} ${user.lastName}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🏷️  Rôle: ${user.role}`);
    console.log(`📅 Inscrit le: ${new Date(user.createdAt).toLocaleDateString('fr-FR')}\n`);

    // Compter les données liées
    const productCount = await Product.countDocuments({ producerId: userId });
    const orderCount = await Order.countDocuments({ 
      $or: [{ producerId: userId }, { merchantId: userId }] 
    });

    console.log('📊 DONNÉES LIÉES :');
    console.log('==================');
    console.log(`🥕 Produits: ${productCount}`);
    console.log(`📦 Commandes: ${orderCount}\n`);

    if (productCount > 0 || orderCount > 0) {
      console.log('⚠️  ATTENTION: Cet utilisateur a des données liées !');
      console.log('📝 Que voulez-vous faire ?');
      console.log('1. Supprimer l\'utilisateur ET toutes ses données liées');
      console.log('2. Annuler la suppression');
      console.log('\n💡 Pour supprimer avec les données liées, utilisez:');
      console.log(`node delete-user.js ${userId} --force`);
      process.exit(1);
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);
    console.log('✅ Utilisateur supprimé avec succès !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB Atlas');
  }
}

// Fonction pour supprimer avec force (toutes les données liées)
async function deleteUserWithForce() {
  try {
    console.log('🔌 Connexion à MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas !\n');

    const userId = process.argv[2];
    
    if (!userId) {
      console.log('❌ Erreur: Veuillez fournir l\'ID de l\'utilisateur à supprimer');
      process.exit(1);
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log(`❌ Utilisateur avec l'ID ${userId} non trouvé`);
      process.exit(1);
    }

    console.log('⚠️  SUPPRESSION FORCÉE EN COURS...');
    console.log('===================================');
    console.log(`👤 Utilisateur: ${user.firstName} ${user.lastName} (${user.email})`);

    // Supprimer les produits liés
    const deletedProducts = await Product.deleteMany({ producerId: userId });
    console.log(`🥕 Produits supprimés: ${deletedProducts.deletedCount}`);

    // Supprimer les commandes liées
    const deletedOrders = await Order.deleteMany({ 
      $or: [{ producerId: userId }, { merchantId: userId }] 
    });
    console.log(`📦 Commandes supprimées: ${deletedOrders.deletedCount}`);

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);
    console.log('👤 Utilisateur supprimé');

    console.log('\n✅ Suppression complète terminée !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB Atlas');
  }
}

// Vérifier si c'est une suppression forcée
if (process.argv[3] === '--force') {
  deleteUserWithForce();
} else {
  deleteUser();
}







