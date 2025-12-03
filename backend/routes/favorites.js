const express = require('express');
const Favorite = require('../models/Favorite');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/favorites
// @desc    Obtenir les favoris du commerçant connecté
// @access  Private (Commerçant seulement)
router.get('/', auth, requireRole(['MERCHANT']), async (req, res) => {
  try {
    const favorites = await Favorite.find({ merchantId: req.user._id })
      .populate('producerId', 'firstName lastName phone location profileImage')
      .sort({ createdAt: -1 });

    res.json(favorites.map(fav => fav.producerId));
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/favorites/:producerId
// @desc    Ajouter un producteur aux favoris
// @access  Private (Commerçant seulement)
router.post('/:producerId', auth, requireRole(['MERCHANT']), async (req, res) => {
  try {
    const { producerId } = req.params;

    // Vérifier si déjà en favoris
    const existing = await Favorite.findOne({
      merchantId: req.user._id,
      producerId
    });

    if (existing) {
      return res.status(400).json({ message: 'Déjà dans les favoris' });
    }

    const favorite = new Favorite({
      merchantId: req.user._id,
      producerId
    });

    await favorite.save();
    await favorite.populate('producerId', 'firstName lastName phone location profileImage');

    res.status(201).json({
      message: 'Ajouté aux favoris',
      producer: favorite.producerId
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout aux favoris:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Déjà dans les favoris' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   DELETE /api/favorites/:producerId
// @desc    Retirer un producteur des favoris
// @access  Private (Commerçant seulement)
router.delete('/:producerId', auth, requireRole(['MERCHANT']), async (req, res) => {
  try {
    const { producerId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      merchantId: req.user._id,
      producerId
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favori non trouvé' });
    }

    res.json({ message: 'Retiré des favoris' });
  } catch (error) {
    console.error('Erreur lors de la suppression du favori:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/favorites/check/:producerId
// @desc    Vérifier si un producteur est en favoris
// @access  Private (Commerçant seulement)
router.get('/check/:producerId', auth, requireRole(['MERCHANT']), async (req, res) => {
  try {
    const { producerId } = req.params;

    const favorite = await Favorite.findOne({
      merchantId: req.user._id,
      producerId
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Erreur lors de la vérification du favori:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
