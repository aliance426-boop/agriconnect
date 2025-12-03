const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  producerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index unique pour éviter les doublons
favoriteSchema.index({ merchantId: 1, producerId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
