const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/users/producers
// @desc    Obtenir tous les producteurs (avec pagination)
// @access  Private (Commerçant seulement)
router.get('/producers', auth, requireRole(['MERCHANT']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = { role: 'PRODUCER', isActive: true };

    const [producers, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({
      producers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des producteurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/users/merchants
// @desc    Obtenir tous les commerçants
// @access  Private (Producteur seulement)
router.get('/merchants', auth, requireRole(['PRODUCER']), async (req, res) => {
  try {
    const merchants = await User.find({ 
      role: 'MERCHANT', 
      isActive: true 
    }).select('-password').sort({ createdAt: -1 });

    res.json(merchants);
  } catch (error) {
    console.error('Erreur lors de la récupération des commerçants:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/users/profile
// @desc    Modifier le profil de l'utilisateur connecté
// @access  Private
router.put('/profile', auth, [
  body('firstName').optional().trim().notEmpty().withMessage('Le prénom ne peut pas être vide'),
  body('lastName').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('phone').optional().trim().notEmpty().withMessage('Le téléphone ne peut pas être vide'),
  body('location').optional().trim().notEmpty().withMessage('La localisation ne peut pas être vide'),
  body('companyName').optional().trim().notEmpty().withMessage('Le nom de l\'entreprise ne peut pas être vide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone, location, companyName } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mettre à jour les champs fournis
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (companyName && user.role === 'MERCHANT') user.companyName = companyName;

    await user.save();

    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        companyName: user.companyName,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du profil' });
  }
});

// @route   POST /api/users/profile-image
// @desc    Upload une photo de profil
// @access  Private
router.post('/profile-image', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image fournie' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Supprimer l'ancienne image si elle existe
    if (user.profileImage) {
      const fs = require('fs');
      const path = require('path');
      const oldImagePath = path.join(__dirname, '../uploads', user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Mettre à jour la photo de profil
    user.profileImage = req.file.filename;
    await user.save();

    res.json({
      message: 'Photo de profil mise à jour avec succès',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload de la photo de profil:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'upload de la photo' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Supprimer un utilisateur (Admin seulement)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUser = req.user;

    // Vérifier si l'utilisateur existe
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Seul l'utilisateur lui-même ou un admin peut supprimer
    if (currentUser._id.toString() !== userId && currentUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Compter les données liées
    const Product = require('../models/Product');
    const Order = require('../models/Order');
    
    const productCount = await Product.countDocuments({ producerId: userId });
    const orderCount = await Order.countDocuments({ 
      $or: [{ producerId: userId }, { merchantId: userId }] 
    });

    // Si l'utilisateur a des données liées, on ne peut pas le supprimer
    if (productCount > 0 || orderCount > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer cet utilisateur car il a des données liées',
        data: {
          products: productCount,
          orders: orderCount
        }
      });
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);

    res.json({ 
      message: 'Utilisateur supprimé avec succès',
      deletedUser: {
        id: userToDelete._id,
        name: `${userToDelete.firstName} ${userToDelete.lastName}`,
        email: userToDelete.email
      }
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
});

// @route   DELETE /api/users/:id/force
// @desc    Supprimer un utilisateur et toutes ses données liées (Admin seulement)
// @access  Private
router.delete('/:id/force', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUser = req.user;

    // Seul un admin peut faire une suppression forcée
    if (currentUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès non autorisé - Admin requis' });
    }

    // Vérifier si l'utilisateur existe
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const Product = require('../models/Product');
    const Order = require('../models/Order');

    // Supprimer les données liées
    const deletedProducts = await Product.deleteMany({ producerId: userId });
    const deletedOrders = await Order.deleteMany({ 
      $or: [{ producerId: userId }, { merchantId: userId }] 
    });

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);

    res.json({ 
      message: 'Utilisateur et toutes ses données supprimés avec succès',
      deletedData: {
        user: {
          id: userToDelete._id,
          name: `${userToDelete.firstName} ${userToDelete.lastName}`,
          email: userToDelete.email
        },
        products: deletedProducts.deletedCount,
        orders: deletedOrders.deletedCount
      }
    });

  } catch (error) {
    console.error('Erreur lors de la suppression forcée:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression forcée' });
  }
});

module.exports = router;

