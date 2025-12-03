import React, { useState } from 'react';
import { X, Package, User, Phone, MapPin } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

const OrderForm = ({ product, producer, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const orderData = {
      producerId: producer._id,
      productId: product._id,
      quantity: parseInt(formData.quantity),
      message: formData.message
    };
    
    onSubmit(orderData);
  };

  const totalPrice = product.price * formData.quantity;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Passer une commande
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Product Info */}
          <div className="card mb-6">
            <div className="flex items-start space-x-4">
              {product.image && (
                <img
                  src={getImageUrl(product.image)}
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {product.category}
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-xl font-bold text-primary-600">
                    {product.price} FCFA
                  </span>
                  <span className="text-sm text-gray-600">
                    Stock: {product.quantity}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Producer Info */}
          <div className="card mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informations du producteur
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">
                  {producer.firstName} {producer.lastName}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{producer.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{producer.location}</span>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="label">
                Quantité souhaitée *
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                required
                min="1"
                max={product.quantity}
                className="input-field"
                value={formData.quantity}
                onChange={handleChange}
              />
              <p className="text-sm text-gray-600 mt-1">
                Quantité disponible: {product.quantity}
              </p>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="label">
                Message (optionnel)
              </label>
              <textarea
                id="message"
                name="message"
                rows="3"
                className="input-field"
                placeholder="Ajoutez un message pour le producteur..."
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            {/* Order Summary */}
            <div className="card bg-gray-50">
              <h4 className="font-semibold text-gray-900 mb-3">
                Résumé de la commande
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix unitaire:</span>
                  <span className="font-medium">{product.price} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantité:</span>
                  <span className="font-medium">{formData.quantity}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-900 font-semibold">Total:</span>
                  <span className="text-xl font-bold text-primary-600">
                    {totalPrice} FCFA
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Confirmer la commande
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;


