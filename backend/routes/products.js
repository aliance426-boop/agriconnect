const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { auth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/products
// @desc    Obtenir tous les produits actifs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, producerId } = req.query;
    let filter = { isActive: true };

    if (category) filter.category = category;
    if (producerId) filter.producerId = producerId;

    const products = await Product.find(filter)
      .populate('producerId', 'firstName lastName phone location companyName')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/products/my-products
// @desc    Obtenir les produits du producteur connecté
// @access  Private (Producteur seulement)
router.get('/my-products', auth, requireRole(['PRODUCER']), async (req, res) => {
  try {
    const products = await Product.find({ producerId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/products
// @desc    Créer un nouveau produit
// @access  Private (Producteur seulement)
router.post('/', auth, requireRole(['PRODUCER']), upload.single('image'), [
  body('title').trim().notEmpty().withMessage('Le titre est requis'),
  body('price').isNumeric().withMessage('Le prix doit être un nombre'),
  body('quantity').isInt({ min: 1 }).withMessage('La quantité doit être un entier positif'),
  body('category').isIn(['Céréales', 'Légumes', 'Fruits', 'Tubercules', 'Légumineuses', 'Épices', 'Autres']).withMessage('Catégorie invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, price, quantity, category, description } = req.body;
    const image = req.file ? req.file.filename : '';

    const product = new Product({
      title,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      category,
      description,
      image,
      producerId: req.user._id
    });

    await product.save();
    await product.populate('producerId', 'firstName lastName phone location companyName');

    res.status(201).json({
      message: 'Produit créé avec succès',
      product
    });
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du produit' });
  }
});

// @route   PUT /api/products/:id
// @desc    Modifier un produit
// @access  Private (Producteur propriétaire seulement)
router.put('/:id', auth, requireRole(['PRODUCER']), upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, producerId: req.user._id });
    
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    const { title, price, quantity, category, description } = req.body;
    
    product.title = title || product.title;
    product.price = price ? parseFloat(price) : product.price;
    product.quantity = quantity ? parseInt(quantity) : product.quantity;
    product.category = category || product.category;
    product.description = description || product.description;
    
    if (req.file) {
      product.image = req.file.filename;
    }

    await product.save();
    await product.populate('producerId', 'firstName lastName phone location companyName');

    res.json({
      message: 'Produit modifié avec succès',
      product
    });
  } catch (error) {
    console.error('Erreur lors de la modification du produit:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la modification du produit' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Supprimer un produit
// @access  Private (Producteur propriétaire seulement)
router.delete('/:id', auth, requireRole(['PRODUCER']), async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, producerId: req.user._id });
    
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    product.isActive = false;
    await product.save();

    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du produit' });
  }
});

module.exports = router;

