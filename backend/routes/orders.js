const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/orders/my-orders
// @desc    Obtenir les commandes de l'utilisateur connecté
// @access  Private
router.get('/my-orders', auth, async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'MERCHANT') {
      filter.merchantId = req.user._id;
    } else if (req.user.role === 'PRODUCER') {
      filter.producerId = req.user._id;
    }

    const orders = await Order.find(filter)
      .populate('merchantId', 'firstName lastName phone companyName')
      .populate('producerId', 'firstName lastName phone location')
      .populate('productId', 'title price category image')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/orders
// @desc    Créer une nouvelle commande
// @access  Private (Commerçant seulement)
router.post('/', auth, requireRole(['MERCHANT']), [
  body('producerId').isMongoId().withMessage('ID producteur invalide'),
  body('productId').isMongoId().withMessage('ID produit invalide'),
  body('quantity').isInt({ min: 1 }).withMessage('La quantité doit être un entier positif'),
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Le message ne peut pas dépasser 500 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { producerId, productId, quantity, message } = req.body;

    // Vérifier que le produit existe et est actif
    const product = await Product.findOne({ _id: productId, producerId, isActive: true });
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé ou non disponible' });
    }

    // Vérifier que la quantité demandée est disponible
    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Quantité insuffisante en stock' });
    }

    // Calculer le prix total
    const totalPrice = product.price * quantity;

    const order = new Order({
      merchantId: req.user._id,
      producerId,
      productId,
      quantity,
      totalPrice,
      message
    });

    await order.save();
    await order.populate([
      { path: 'merchantId', select: 'firstName lastName phone companyName' },
      { path: 'producerId', select: 'firstName lastName phone location' },
      { path: 'productId', select: 'title price category image' }
    ]);

    res.status(201).json({
      message: 'Commande créée avec succès',
      order
    });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la commande' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Modifier le statut d'une commande
// @access  Private (Producteur propriétaire seulement)
router.put('/:id/status', auth, requireRole(['PRODUCER']), [
  body('status').isIn(['ACCEPTED', 'REFUSED', 'DELIVERED']).withMessage('Statut invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    const order = await Order.findOne({ _id: req.params.id, producerId: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    order.status = status;
    
    if (status === 'ACCEPTED') {
      // Réduire la quantité du produit
      const product = await Product.findById(order.productId);
      if (product) {
        product.quantity -= order.quantity;
        await product.save();
      }
    }

    await order.save();
    await order.populate([
      { path: 'merchantId', select: 'firstName lastName phone companyName' },
      { path: 'producerId', select: 'firstName lastName phone location' },
      { path: 'productId', select: 'title price category image' }
    ]);

    res.json({
      message: 'Statut de la commande mis à jour avec succès',
      order
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du statut' });
  }
});

module.exports = router;

