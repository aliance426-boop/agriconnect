const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/users/producers
// @desc    Obtenir tous les producteurs
// @access  Private (Commerçant seulement)
router.get('/producers', auth, requireRole(['MERCHANT']), async (req, res) => {
  try {
    const producers = await User.find({ 
      role: 'PRODUCER', 
      isActive: true 
    }).select('-password').sort({ createdAt: -1 });

    res.json(producers);
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

module.exports = router;

