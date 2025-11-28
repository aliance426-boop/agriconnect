// Script pour voir tous les utilisateurs en détail
const mongoose = require('mongoose');

// Configuration MongoDB
const MONGODB_URI = 'mongodb+srv://dili:Dili@cluster0.jbqemdq.mongodb.net/agriconnect?retryWrites=true&w=majority';

// Schéma utilisateur
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function checkAllUsers() {
  try {
    console.log('🔌 Connexion à MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas !\n');

    // Récupérer tous les utilisateurs
    const users = await User.find().sort({ createdAt: -1 });

    console.log('👥 TOUS LES UTILISATEURS D\'AGRICONNECT :');
    console.log('==========================================');
    console.log(`📊 Total: ${users.length} utilisateurs\n`);

    users.forEach((user, index) => {
      console.log(`👤 UTILISATEUR ${index + 1}:`);
      console.log('--------------------------------');
      console.log(`🆔 ID: ${user._id}`);
      console.log(`👤 Nom: ${user.firstName} ${user.lastName}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🏷️  Rôle: ${user.role}`);
      console.log(`📱 Téléphone: ${user.phone || 'Non renseigné'}`);
      console.log(`📍 Localisation: ${user.location || 'Non renseignée'}`);
      
      if (user.role === 'MERCHANT') {
        console.log(`🏢 Entreprise: ${user.companyName || 'Non renseignée'}`);
        console.log(`📋 Description: ${user.description || 'Non renseignée'}`);
      }
      
      console.log(`🖼️  Photo de profil: ${user.profileImage ? '✅ Oui' : '❌ Non'}`);
      console.log(`📅 Date d'inscription: ${new Date(user.createdAt).toLocaleDateString('fr-FR')}`);
      console.log(`🕐 Heure d'inscription: ${new Date(user.createdAt).toLocaleTimeString('fr-FR')}`);
      console.log('');
    });

    // Statistiques par rôle
    const producers = users.filter(u => u.role === 'PRODUCER');
    const merchants = users.filter(u => u.role === 'MERCHANT');
    const withPhotos = users.filter(u => u.profileImage);

    console.log('📊 STATISTIQUES :');
    console.log('=================');
    console.log(`🌱 Producteurs: ${producers.length}`);
    console.log(`🏪 Commerçants: ${merchants.length}`);
    console.log(`📸 Avec photos: ${withPhotos.length}`);
    console.log(`📷 Sans photos: ${users.length - withPhotos.length}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB Atlas');
  }
}

checkAllUsers();







