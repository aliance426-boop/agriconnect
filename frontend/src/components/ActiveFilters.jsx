import React from 'react';
import { X } from 'lucide-react';

const ActiveFilters = ({ filters, onRemoveFilter, onClearAll }) => {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-gray-600">Filtres actifs:</span>
      {filters.map((filter, index) => (
        <span
          key={index}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
        >
          {filter.label}: {filter.value}
          <button
            onClick={() => onRemoveFilter(filter.key)}
            className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-200 focus:outline-none"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      {filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Effacer tout
        </button>
      )}
    </div>
  );
};

export default ActiveFilters;
