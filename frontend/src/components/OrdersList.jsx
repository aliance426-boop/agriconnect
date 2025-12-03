import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Package, User, Phone } from 'lucide-react';
import UserAvatar from './UserAvatar';
import SearchBar from './SearchBar';
import FilterDropdown from './FilterDropdown';
import ActiveFilters from './ActiveFilters';
import OrderStats from './OrderStats';
import { useFilters } from '../hooks/useFilters';

const OrdersList = ({ orders, onStatusUpdate, userRole }) => {
  // Configuration des filtres pour les commandes
  const orderFilterConfig = {
    searchFields: [
      'productId.title', 
      'productId.category', 
      'merchantId.firstName', 
      'merchantId.lastName', 
      'merchantId.companyName',
      'producerId.firstName', 
      'producerId.lastName',
      'message'
    ],
    filters: [
      {
        key: 'status',
        label: 'Statut',
        field: 'status',
        type: 'select',
        options: [
          { value: 'all', label: 'Tous les statuts' },
          { value: 'PENDING', label: 'En attente' },
          { value: 'ACCEPTED', label: 'Acceptée' },
          { value: 'REFUSED', label: 'Refusée' },
          { value: 'DELIVERED', label: 'Livrée' }
        ]
      },
      {
        key: 'dateRange',
        label: 'Période',
        field: 'createdAt',
        type: 'select',
        options: [
          { value: 'all', label: 'Toutes les périodes' },
          { value: 'today', label: "Aujourd'hui" },
          { value: 'week', label: 'Cette semaine' },
          { value: 'month', label: 'Ce mois' },
          { value: 'last-month', label: 'Mois dernier' }
        ]
      },
      {
        key: 'amountRange',
        label: 'Montant',
        field: 'totalPrice',
        type: 'select',
        options: [
          { value: 'all', label: 'Tous les montants' },
          { value: 'low', label: 'Moins de 10 000 FCFA' },
          { value: 'medium', label: '10 000 - 50 000 FCFA' },
          { value: 'high', label: 'Plus de 50 000 FCFA' }
        ]
      }
    ]
  };

  // Hook pour gérer les filtres des commandes
  const {
    filters: orderFilters,
    searchTerm: orderSearchTerm,
    filteredData: filteredOrders,
    activeFilters: activeOrderFilters,
    updateFilter: updateOrderFilter,
    removeFilter: removeOrderFilter,
    clearAllFilters: clearAllOrderFilters,
    setSearchTerm: setOrderSearchTerm,
    clearSearch: clearOrderSearch
  } = useFilters(orders, orderFilterConfig);
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'ACCEPTED': return 'text-green-600 bg-green-100';
      case 'REFUSED': return 'text-red-600 bg-red-100';
      case 'DELIVERED': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'ACCEPTED': return <CheckCircle className="w-4 h-4" />;
      case 'REFUSED': return <XCircle className="w-4 h-4" />;
      case 'DELIVERED': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'ACCEPTED': return 'Acceptée';
      case 'REFUSED': return 'Refusée';
      case 'DELIVERED': return 'Livrée';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (orders.length === 0) {
    return (
      <div className="card text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune commande
        </h3>
        <p className="text-gray-600">
          {userRole === 'PRODUCER' 
            ? 'Vous n\'avez pas encore reçu de commandes'
            : 'Vous n\'avez pas encore passé de commandes'
          }
        </p>
      </div>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Commandes ({filteredOrders.length} sur {orders.length})
        </h2>

        {/* Barre de recherche et filtres */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={orderSearchTerm}
                onChange={setOrderSearchTerm}
                placeholder="Rechercher par produit, client, message..."
                onClear={clearOrderSearch}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <FilterDropdown
                label="Statut"
                options={orderFilterConfig.filters[0].options}
                value={orderFilters.status || 'all'}
                onChange={(value) => updateOrderFilter('status', value)}
                placeholder="Tous les statuts"
              />
              <FilterDropdown
                label="Période"
                options={orderFilterConfig.filters[1].options}
                value={orderFilters.dateRange || 'all'}
                onChange={(value) => updateOrderFilter('dateRange', value)}
                placeholder="Toutes les périodes"
              />
              <FilterDropdown
                label="Montant"
                options={orderFilterConfig.filters[2].options}
                value={orderFilters.amountRange || 'all'}
                onChange={(value) => updateOrderFilter('amountRange', value)}
                placeholder="Tous les montants"
              />
            </div>
          </div>

          {/* Filtres actifs */}
          <ActiveFilters
            filters={activeOrderFilters}
            onRemoveFilter={removeOrderFilter}
            onClearAll={clearAllOrderFilters}
          />
        </div>

        {/* Statistiques des commandes */}
        <OrderStats orders={filteredOrders} userRole={userRole} />

        <div className="card text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune commande trouvée
          </h3>
          <p className="text-gray-600 mb-4">
            Aucune commande ne correspond à vos critères de recherche
          </p>
          <button
            onClick={clearAllOrderFilters}
            className="btn-outline"
          >
            Effacer les filtres
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Commandes ({filteredOrders.length} sur {orders.length})
      </h2>

      {/* Barre de recherche et filtres */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={orderSearchTerm}
              onChange={setOrderSearchTerm}
              placeholder="Rechercher par produit, client, message..."
              onClear={clearOrderSearch}
            />
          </div>
          <div className="flex gap-3">
            <FilterDropdown
              label="Statut"
              options={orderFilterConfig.filters[0].options}
              value={orderFilters.status || 'all'}
              onChange={(value) => updateOrderFilter('status', value)}
              placeholder="Tous les statuts"
            />
            <FilterDropdown
              label="Période"
              options={orderFilterConfig.filters[1].options}
              value={orderFilters.dateRange || 'all'}
              onChange={(value) => updateOrderFilter('dateRange', value)}
              placeholder="Toutes les périodes"
            />
            <FilterDropdown
              label="Montant"
              options={orderFilterConfig.filters[2].options}
              value={orderFilters.amountRange || 'all'}
              onChange={(value) => updateOrderFilter('amountRange', value)}
              placeholder="Tous les montants"
            />
          </div>
        </div>

        {/* Filtres actifs */}
        <ActiveFilters
          filters={activeOrderFilters}
          onRemoveFilter={removeOrderFilter}
          onClearAll={clearAllOrderFilters}
        />
      </div>

      {/* Statistiques des commandes */}
      <OrderStats orders={filteredOrders} userRole={userRole} />
      
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order._id} className="card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                    {order.productId?.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {order.productId?.category}
                  </p>
                </div>
              </div>
              
              <div className={`inline-flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)} flex-shrink-0`}>
                {getStatusIcon(order.status)}
                <span>{getStatusText(order.status)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Order Details */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantité:</span>
                  <span className="font-medium">{order.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix unitaire:</span>
                  <span className="font-medium">{order.productId?.price} FCFA</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-lg text-primary-600">
                    {order.totalPrice} FCFA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <UserAvatar 
                    user={userRole === 'PRODUCER' ? order.merchantId : order.producerId} 
                    size="sm" 
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {userRole === 'PRODUCER' 
                        ? `${order.merchantId?.firstName} ${order.merchantId?.lastName}`
                        : `${order.producerId?.firstName} ${order.producerId?.lastName}`
                      }
                    </p>
                    {userRole === 'PRODUCER' && order.merchantId?.companyName && (
                      <p className="text-sm text-gray-600">
                        {order.merchantId.companyName}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a
                    href={`tel:${userRole === 'PRODUCER' ? order.merchantId?.phone : order.producerId?.phone}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {userRole === 'PRODUCER' ? order.merchantId?.phone : order.producerId?.phone}
                  </a>
                </div>

                {userRole === 'PRODUCER' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">📍</span>
                    <span className="text-sm text-gray-600">
                      {order.producerId?.location}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            {order.message && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Message:</strong> {order.message}
                </p>
              </div>
            )}

            {/* Action Buttons for Producer */}
            {userRole === 'PRODUCER' && order.status === 'PENDING' && (
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 mt-4 pt-4 border-t">
                <button
                  onClick={() => onStatusUpdate(order._id, 'ACCEPTED')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Accepter</span>
                </button>
                <button
                  onClick={() => onStatusUpdate(order._id, 'REFUSED')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Refuser</span>
                </button>
              </div>
            )}

            {/* WhatsApp Button */}
            <div className="mt-4 pt-4 border-t">
              <a
                href={`https://wa.me/${userRole === 'PRODUCER' ? order.merchantId?.phone?.replace(/\D/g, '') : order.producerId?.phone?.replace(/\D/g, '')}?text=Bonjour, je vous contacte concernant la commande de ${order.productId?.title}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span>📱</span>
                <span>Contacter sur WhatsApp</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersList;


