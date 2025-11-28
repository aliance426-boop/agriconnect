import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const StockIndicator = ({ quantity, className = "" }) => {
  const getStockStatus = (qty) => {
    if (qty === 0) {
      return {
        status: 'out-of-stock',
        label: 'Rupture de stock',
        icon: XCircle,
        color: 'text-red-600 bg-red-100',
        iconColor: 'text-red-600'
      };
    } else if (qty <= 10) {
      return {
        status: 'low-stock',
        label: 'Stock faible',
        icon: AlertTriangle,
        color: 'text-yellow-600 bg-yellow-100',
        iconColor: 'text-yellow-600'
      };
    } else {
      return {
        status: 'in-stock',
        label: 'En stock',
        icon: CheckCircle,
        color: 'text-green-600 bg-green-100',
        iconColor: 'text-green-600'
      };
    }
  };

  const stockInfo = getStockStatus(quantity);
  const Icon = stockInfo.icon;

  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${stockInfo.color} ${className}`}>
      <Icon className={`w-3 h-3 ${stockInfo.iconColor}`} />
      <span>{stockInfo.label}</span>
    </div>
  );
};

export default StockIndicator;







