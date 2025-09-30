const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'ID du commerçant est requis']
  },
  producerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'ID du producteur est requis']
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'L\'ID du produit est requis']
  },
  quantity: {
    type: Number,
    required: [true, 'La quantité est requise'],
    min: [1, 'La quantité doit être au moins 1']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Le prix total est requis'],
    min: [0, 'Le prix total ne peut pas être négatif']
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REFUSED', 'DELIVERED'],
    default: 'PENDING'
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500
  },
  deliveryDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
orderSchema.index({ merchantId: 1, status: 1 });
orderSchema.index({ producerId: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);

