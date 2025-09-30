import React from 'react';
import { CheckCircle, XCircle, Clock, Package } from 'lucide-react';

const OrderStats = ({ orders, userRole }) => {
  const stats = {
    total: orders.length,
    pending: orders.filter(order => order.status === 'PENDING').length,
    accepted: orders.filter(order => order.status === 'ACCEPTED').length,
    refused: orders.filter(order => order.status === 'REFUSED').length,
    delivered: orders.filter(order => order.status === 'DELIVERED').length
  };

  const totalRevenue = orders
    .filter(order => order.status === 'DELIVERED')
    .reduce((sum, order) => sum + order.totalPrice, 0);

  const getStatCard = (title, value, Icon, color) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {getStatCard('Total', stats.total, Package, 'bg-blue-500')}
        {getStatCard('En attente', stats.pending, Clock, 'bg-yellow-500')}
        {getStatCard('Acceptées', stats.accepted, CheckCircle, 'bg-green-500')}
        {userRole === 'PRODUCER' && getStatCard('Refusées', stats.refused, XCircle, 'bg-red-500')}
        {getStatCard('Livrées', stats.delivered, CheckCircle, 'bg-blue-600')}
      </div>
      
      {userRole === 'PRODUCER' && totalRevenue > 0 && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-500">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-green-900">{totalRevenue.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStats;
